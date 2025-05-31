import express from "express";
import multer from "multer";
import { createCar, getCars, updateCar, deleteCar } from "../controllers/car.controller.js";
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
router.post("/addcars", ProtectedRoute(), upload.fields([{ name: 'images', maxCount: 5 }, { name: 'documentation', maxCount: 1 }]), async (req, res) => {
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
    const documentation = files.documentation ? files.documentation[0] : null;

    // Check if images were uploaded
    if (!images || images.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }

    // Upload images to Cloudinary using the unsigned preset
    const uploadImagePromises = images.map((file) =>
      new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              resource_type: "image",
              upload_preset: "unsigned_preset",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary image upload error:", error);
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
    let documentationUrl = null;

    // Upload documentation to Cloudinary if provided
    if (documentation) {
      try {
        const uploadDocResult = await new Promise((resolve, reject) => {
          cloudinary.v2.uploader
            .upload_stream(
              {
                resource_type: "raw", // Use 'raw' for non-image files like PDF
                upload_preset: "unsigned_preset", // Use your unsigned preset
                folder: "car_documentation", // Optional: specify a folder
              },
              (error, result) => {
                if (error) {
                  console.error("Cloudinary documentation upload error:", error);
                  reject(error);
                } else {
                  resolve(result);
                }
              }
            )
            .end(documentation.buffer);
        });
        documentationUrl = uploadDocResult.secure_url;
      } catch (docUploadError) {
        console.error("Error uploading documentation:", docUploadError);
        // Decide how to handle documentation upload failure:
        // Option 1: Return an error and stop the car posting process
        // return res.status(500).json({ error: "Failed to upload car documentation." });
        // Option 2: Log the error and proceed without documentation (as it's optional in the model)
        console.warn("Proceeding without documentation due to upload error.");
      }
    }


    // Get user information for owner details
    const User = (await import("../models/user.models.js")).default;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

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
      carType,
      images: imageUrls, // Store Cloudinary URLs
      documentation: documentationUrl, // Store documentation URL
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

    const query = { isDeleted: false };

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

    if (brand) query.brand = brand;
    if (energy) query.energy = energy;
    if (transmission) query.transmission = transmission;
    if (wilaya) query.wilaya = wilaya;
    if (carType) query.carType = carType;
    if (location) query.location = location;
    if (seats) query.seats = parseInt(seats);
    if (doors) query.doors = parseInt(doors);
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }
    if (availableFrom || availableTo) {
      query.$and = [];
      if (availableFrom) {
        query.$and.push({ availabilityEnd: { $gte: new Date(availableFrom) } });
      }
      if (availableTo) {
        query.$and.push({ availabilityStart: { $lte: new Date(availableTo) } });
      }
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
      .populate("owner", "firstName lastName email");

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

export default router;
