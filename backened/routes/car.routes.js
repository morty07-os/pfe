import express from "express";
import multer from "multer";
import { createCar, getCars, updateCar, deleteCar, updateCarBookingStatus } from "../controllers/car.controller.js";
import { ProtectedRoute } from "../midleware/ProtectedRoute.js";
import Car from "../models/car.models.js";
import cloudinary from "cloudinary";

// Configure Cloudinary with your credentials
cloudinary.v2.config({
  cloud_name: "dtob4ibrg",
  api_key: "837972942685863",
  api_secret: "dVaH5ZDobVz2-R9NNZuIKXYCidY",
});

const router = express.Router();

// Configure multer to use memory storage (for Cloudinary uploads)
const upload = multer({ storage: multer.memoryStorage() });

// Car routes from controller
router.post("/add", ProtectedRoute(), upload.single("image"), createCar); // Adjusted for single image if needed
router.get("/list", getCars);
router.put("/update/:id", ProtectedRoute(), upload.single("image"), updateCar);
router.delete("/delete/:id", ProtectedRoute(), deleteCar);

// Route to post a car with Cloudinary uploads
router.post("/addcars", ProtectedRoute(), upload.fields([{ name: 'images', maxCount: 5 }, { name: 'documentationImages', maxCount: 5 }]), async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Uploaded files:", req.files);

    const { body, files } = req;
    const {
      carName,
      brand,
      wilaya,
      description,
      energy,
      seats,
      doors,
      transmission,
      mileage,
      engine,
      availabilityStart,
      availabilityEnd,
      price,
      carType,
    } = body;

    const images = files.images;

    // Check if images were uploaded
    if (!images || images.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Upload car images to Cloudinary using the unsigned preset
    const uploadImagePromises = images.map((file) =>
      new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              resource_type: "image",
              upload_preset: "unsigned_preset",
              folder: "car_images", // Optional: specify a folder for car images
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary car image upload error:", error);
                reject(error);
              } else {
                resolve(result.secure_url);
              }
            }
          )
          .end(file.buffer);
      })
    );

    const imageUrls = await Promise.all(uploadImagePromises);

    const documentationImages = files.documentationImages;
    let documentationImageUrls = [];

    // Upload documentation images to Cloudinary if provided
    if (documentationImages && documentationImages.length > 0) {
      const uploadDocumentationImagePromises = documentationImages.map((file) =>
        new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(
              {
                resource_type: "image",
                upload_preset: "unsigned_preset",
                folder: "car_documentation_images", // Optional: specify a folder for documentation images
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary documentation image upload error:", error);
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            )
            .end(file.buffer);
            })
          );
      documentationImageUrls = await Promise.all(uploadDocumentationImagePromises);
    }


    // Get user information for owner details
    const User = (await import("../models/user.models.js")).default;
    const user = await User.findById(req.user.userId);

            if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Normalize carType to uppercase to match schema enum
    const normalizedCarType = carType ? carType.toUpperCase() : undefined;

    const car = new Car({
      carName,
      brand,
      wilaya,
      description,
      energy,
      seats,
      doors,
      transmission,
      mileage,
      engine,
      availabilityStart,
      availabilityEnd,
      price,
      carType: normalizedCarType,
      images: imageUrls, // Store Cloudinary URLs
      documentationImages: documentationImageUrls, // Add this line to store documentation images
      owner: req.user.userId,
      ownerName: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });

    await car.save();
    res.status(201).json({ message: "Car posted successfully!", car });
  } catch (error) {
    console.error("Error posting car:", error.message);
    res.status(500).json({ error: "Failed to post the car.", details: error.message });
  }
});

// Route to fetch all cars posted by users
router.get("/getcars", async (req, res) => {
  try {
    const {
      brand,
      energy,
      transmission,
      wilaya,
      carType,
      location,
      seats,
      doors,
      priceMin,
      priceMax,
      availableFrom,
      availableTo,
      search,
    } = req.query;

    // Add status filter to only show approved cars
    const query = { isDeleted: false, status: 'approved' };

    // Handle text search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, "i"); // Case-insensitive search
      query.$or = [
        { brand: searchRegex },
        { carName: searchRegex },
        { description: searchRegex },
        { wilaya: searchRegex },
        { carType: searchRegex },
        { engine: searchRegex },
      ];
    }

    if (brand) query.brand = new RegExp(`^${brand}$`, "i");
    if (energy) query.energy = energy;
    if (transmission) query.transmission = transmission;
    if (wilaya) query.wilaya = new RegExp(`^${wilaya}$`, "i");
            if (carType) {
      query.carType = carType.toUpperCase();
    }
    if (location) query.location = location;
    if (seats) query.seats = parseInt(seats);
    if (doors) query.doors = parseInt(doors);
        // Initialize $and array if it doesn't exist
    if (!query.$and) {
      query.$and = [];
    }

    if (priceMin || priceMax) {
      const priceQuery = {};
      if (priceMin) priceQuery.$gte = parseFloat(priceMin);
      if (priceMax) priceQuery.$lte = parseFloat(priceMax);
      query.price = priceQuery;
    }

    if (availableFrom) {
      query.$and.push({ availabilityEnd: { $gte: new Date(availableFrom) } });
    }
    if (availableTo) {
      query.$and.push({ availabilityStart: { $lte: new Date(availableTo) } });
    }

    // Remove the $and property if it's empty to avoid MongoDB errors
    if (query.$and.length === 0) {
      delete query.$and;
    }

    // Fetch cars with owner information
    const cars = await Car.find(query)
      .select("-__v")
      .populate("owner", "firstName lastName -_id");

    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error.message);
    res.status(500).json({ error: "Failed to fetch cars.", details: error.message });
  }
});

// Route to fetch cars owned by the current user
router.get("/user-cars", ProtectedRoute(), async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all cars where the owner is the current user
    const userCars = await Car.find({
      owner: userId,
      isDeleted: false,
    }).sort({ createdAt: -1 }); // Sort by newest first

    res.status(200).json(userCars);
  } catch (error) {
    console.error("Error fetching user's cars:", error.message);
    res.status(500).json({ error: "Failed to fetch your cars.", details: error.message });
  }
});

// Route to fetch car details by ID
router.get("/details/:id", ProtectedRoute({ required: false }), async (req, res) => {
  try {
    const { id } = req.params;
    const car = await Car.findById(id)
      .select("-__v")
      .populate('owner', '-password -refreshToken -resetPasswordToken -resetPasswordExpire -verificationToken -verificationTokenExpires -__v');

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    // Check if the car is available based on its availability dates
    const now = new Date();
    const isAvailable =
      !car.isDeleted &&
      new Date(car.availabilityStart) <= now &&
      new Date(car.availabilityEnd) >= now;

    // Add isAvailable property to the response
    const carResponse = car.toObject();
    carResponse.isAvailable = isAvailable;

    // Inject joinDate field for frontend compatibility
    if (carResponse.owner && carResponse.owner.createdAt) {
      carResponse.owner.joinDate = carResponse.owner.createdAt;
    }

    // Get user ID from request if authenticated
    const userId = req.user?.userId || null;

    // Check if the current user is the owner of the car
    carResponse.isOwner = userId && car.owner._id.toString() === userId.toString();

    res.status(200).json(carResponse);
  } catch (error) {
    console.error("Error fetching car details:", error.message);
    res.status(500).json({ error: "Failed to fetch car details.", details: error.message });
  }
});

// Admin routes for car approval
router.get("/pending", ProtectedRoute(), async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const pendingCars = await Car.find({ status: 'pending' })
      .populate('owner', 'firstName lastName email phone')
      .select('-__v')
      .sort({ createdAt: -1 });

    // Transform the data to include all necessary fields
    const transformedCars = pendingCars.map(car => {
      const carObj = car.toObject();
      return {
        ...carObj,
        ownerName: carObj.owner ? {
          firstName: carObj.owner.firstName,
          lastName: carObj.owner.lastName
        } : carObj.ownerName,
        ownerEmail: carObj.owner?.email,
        ownerPhone: carObj.owner?.phone,
        pricePerDay: carObj.pricePerDay || carObj.price,
        category: carObj.category || carObj.carType,
        transmission: carObj.transmission,
        energy: carObj.energy || carObj.fuelType,
        seats: carObj.seats || carObj.seatingCapacity,
        doors: carObj.doors,
        location: carObj.location || carObj.wilaya,
        status: carObj.status,
        images: carObj.images || [],
        documentationImages: carObj.documentationImages || [],
        createdAt: carObj.createdAt
      };
    });

    res.status(200).json(transformedCars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pending cars" });
  }
});

router.post("/approve/:id", ProtectedRoute(), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to approve car" });
  }
});

router.post("/reject/:id", ProtectedRoute(), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    const { reason } = req.body;
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'rejected',
        rejectionReason: reason
      },
      { new: true }
    );

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.status(200).json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to reject car" });
  }
});

// Update car booking status
router.put("/booking-status/:carId", ProtectedRoute(), updateCarBookingStatus);

export default router;
