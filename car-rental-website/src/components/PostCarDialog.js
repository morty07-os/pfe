import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  InputAdornment,
  MenuItem,
  IconButton,
  Snackbar,
  Alert,
  DialogTitle,
  Paper,
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SearchIcon from "@mui/icons-material/Search";
import { wilayasConfig, pickupLocationsConfig } from "../data/wilayasConfig";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";

// Import Leaflet and fix icon issue
import L from "leaflet";
import { MapContainer, TileLayer, useMapEvents } from "react-leaflet";

// Import geosearch
import { OpenStreetMapProvider } from "leaflet-geosearch";

// Fix for default marker icons in React-Leaflet
const DefaultIcon = L.icon({
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// List of available wilayas (only those active in the Map page)
const wilayas = wilayasConfig.filter((w) => w.available).map((w) => w.name);

// List of valid wilayas for validation
const validWilayas = wilayas;

// Flatten pickup locations from config for dropdown (only those inside available wilayas)
const pickupLocations = Object.entries(pickupLocationsConfig)
  .filter(([wilayaName]) => validWilayas.includes(wilayaName))
  .flatMap(([wilayaName, locs]) =>
    locs.map((loc) => ({ ...loc, wilaya: wilayaName }))
  );

const brands = [
  "Toyota",
  "Renault",
  "Peugeot",
  "Hyundai",
  "Volkswagen",
  "Kia",
  "Dacia",
  "Citroën",
  "Fiat",
  "Seat",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Ford",
  "Chevrolet",
  "Nissan",
  "Honda",
  "Mazda",
  "Jeep",
  "Land Rover",
  "Opel",
  "Skoda",
  "Suzuki",
  "Mitsubishi",
  "Subaru",
  "Porsche",
  "Lexus",
  "Jaguar",
  "Mini",
  "Volvo",
  "Tesla",
  "Alfa Romeo",
  "Infiniti",
  "Acura",
  "Chery",
  "Geely",
  "BYD",
  "Great Wall",
  "Dongfeng",
  "Changan",
  "SsangYong",
  "Isuzu",
  "Daewoo",
  "Other",
];
const energies = ["Essence", "Diesel", "Hybrid", "Electric"];
const transmissions = ["Manual", "Automatic"];
const carTypes = ["SUV", "VAN", "STATIONWAGON", "CITADINE", "SEDAN"];

const carFeatures = [
  {
    id: "airConditioning",
    label: "Air Conditioning",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 4V20M4 12H20M7 7L17 17M7 17L17 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "bluetooth",
    label: "Bluetooth",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M6 8L18 16L12 22V2L18 8L6 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "cruiseControl",
    label: "Cruise Control",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V8M12 12V16M4 12H8M16 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "parkingSensors",
    label: "Parking Sensors",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8V16M8 4H16M20 8V16M8 20H16M9 12H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "reverseCam",
    label: "Reverse Camera",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M7 8L9 4H15L17 8" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "usb",
    label: "USB Port",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 10V2M12 22V16M8 6H16M8 18H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <rect x="8" y="10" width="8" height="6" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "auxInput",
    label: "AUX Input",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 12H7M17 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
        <path d="M10 16L14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "leatherSeats",
    label: "Leather Seats",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12V19H19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M5 8V5H19V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M5 8C5 10.2091 8.13401 12 12 12C15.866 12 19 10.2091 19 8"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: "heatedSeats",
    label: "Heated Seats",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 12V19H19V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 5V9M9 6L15 8M9 8L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "sunroof",
    label: "Sunroof",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="8" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
        <path
          d="M8 8V6C8 4.89543 9.79086 4 12 4C14.2091 4 16 4.89543 16 6V8"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    id: "navigation",
    label: "Navigation",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M12 4V12L16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "keylessEntry",
    label: "Keyless Entry",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="15" r="4" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 15H19V10L16 7H12"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "alloyWheels",
    label: "Alloy Wheels",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
        <path
          d="M12 4V9M12 15V20M4 12H9M15 12H20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "childSeat",
    label: "Child Seat",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="2" />
        <path d="M8 14H16L17 20H7L8 14Z" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "airbags",
    label: "Airbags",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function PostCarDialog({ open, onClose }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const mapRef = useRef(null);

  const [formData, setFormData] = useState({
    carName: "",
    brand: "",
    wilaya: "",
    carType: "",
    description: "",
    price: "",
    energy: "",
    transmission: "",
    images: [],
    documentationImages: [], // Add state for documentation images
    location: null,
    locationValid: false, // Track if location is in a valid wilaya
    detectedWilaya: null, // Store the detected wilaya from location
    features: {},
    pickupLocationId: ""
  });
  
  // Add form errors state to track validation errors
  const [formErrors, setFormErrors] = useState({
    location: false
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [documentationImagePreviews, setDocumentationImagePreviews] = useState([]); // Add state for documentation image previews
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [mapDialogOpen, setMapDialogOpen] = useState(false);

  useEffect(() => {
    if (!token && open) {
      console.log("No token found, redirecting to sign in");
      onClose();
      navigate("/sign-in");
    }

    if (open) {
      const savedLocation = localStorage.getItem("selectedLocation");
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation);
          setFormData((prev) => ({ ...prev, location: locationData }));
          localStorage.removeItem("selectedLocation");
        } catch (error) {
          console.error("Error parsing saved location:", error);
        }
      }
    }
  }, [open, onClose, navigate, token]);

  if (!token && open) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      const newImages = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5), // Limit to 5 images
      }));
      setImagePreviews((prev) => [
        ...prev,
        ...newImages.map((file) => URL.createObjectURL(file)),
      ].slice(0, 5));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    setFormData((prev) => ({ ...prev, images: newImages }));

    const newPreviews = [...imagePreviews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setImagePreviews(newPreviews);
  };

  const handleOpenMapDialog = () => {
    setMapDialogOpen(true);
    if (formData.location && mapRef.current) {
      setTimeout(() => {
        mapRef.current.setView([formData.location.lat, formData.location.lng], 15);
      }, 300);
    }
  };

  const handleCloseMapDialog = () => {
    setMapDialogOpen(false);
  };
  
  // Function to check if a location is in one of our valid wilayas
  const isLocationInValidWilaya = async (latitude, longitude) => {
    try {
      // Use reverse geocoding to get the address from coordinates
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
      const data = await response.json();
      
      // Check if the address contains any of our valid wilayas
      const address = data.display_name || '';
      
      // Check for each valid wilaya in the address
      for (const wilaya of validWilayas) {
        // Check for both the exact wilaya name and variations (like Bejaia/Béjaïa)
        if (
          address.includes(wilaya) || 
          (wilaya === 'Setif' && address.includes('Sétif')) ||
          (wilaya === 'Bejaia' && address.includes('Béjaïa')) ||
          (wilaya === 'Alger' && (address.includes('Algiers') || address.includes('Algier')))
        ) {
          return { valid: true, wilaya };
        }
      }
      
      return { valid: false, address };
    } catch (error) {
      console.error('Error checking location:', error);
      return { valid: false, error: error.message };
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (mapRef.current) {
            mapRef.current.setView([latitude, longitude], 15);
          }
          
          // Check if the location is in a valid wilaya
          const locationCheck = await isLocationInValidWilaya(latitude, longitude);
          
          // Set the location in form data
          setFormData(prev => ({
            ...prev,
            location: { lat: latitude, lng: longitude },
            locationValid: locationCheck.valid,
            detectedWilaya: locationCheck.valid ? locationCheck.wilaya : null
          }));
          
          if (locationCheck.valid) {
            setSnackbar({
              open: true,
              message: `Location detected in ${locationCheck.wilaya}`,
              severity: "success"
            });
          } else {
            setSnackbar({
              open: true,
              message: 'Your location is not in one of our service areas.',
              severity: "error"
            });
          }
          
          // Don't close the dialog automatically
          // Let the user confirm the location by clicking the Confirm button
        },
        (error) => {
          console.error("Error getting location:", error);
          setSnackbar({
            open: true,
            message:
              "Could not get your location. Please try again or select on map.",
            severity: "error",
          });
        }
      );
    } else {
      setSnackbar({
        open: true,
        message: "Geolocation is not supported by your browser",
        severity: "error",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    /* Location validation removed */
    if (false) {
      setSnackbar({
        open: true,
        message: "Please set a pickup location before submitting",
        severity: "error",
      });
      setFormErrors(prev => ({ ...prev, location: true }));
      return;
    }
    
    // Check if the location is in a valid wilaya if not already validated
    /* Location validation removed */
    if (false) {
      const locationCheck = await isLocationInValidWilaya(formData.location.lat, formData.location.lng);
      
      if (!locationCheck.valid) {
        setSnackbar({
          open: true,
          message: 'Your location is not in one of our service areas.',
          severity: "error"
        });
        setFormErrors(prev => ({ ...prev, location: true }));
        return;
      } else {
        // Location is valid, update form data
        setFormData(prev => ({
          ...prev,
          locationValid: true,
          detectedWilaya: locationCheck.wilaya,
          wilaya: locationCheck.wilaya // Auto-set the wilaya based on detected location
        }));
        setFormErrors(prev => ({ ...prev, location: false }));
      }
    }

    if (formData.images.length === 0) {
      setSnackbar({
        open: true,
        message: "Please upload at least one image",
        severity: "error",
      });
      return;
    }

    try {
      if (!token) {
        console.error("No token found during submission");
        setSnackbar({
          open: true,
          message: "You must be logged in to post a car",
          severity: "error",
        });
        onClose();
        navigate("/SignIn");
        return;
      }

      if (typeof token !== "string" || token.split(".").length !== 3) {
        console.error("Invalid token format");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setSnackbar({
          open: true,
          message: "Your session is invalid. Please sign in again.",
          severity: "error",
        });
        onClose();
        return;
      }

      if (formData.availabilityStart && formData.availabilityEnd) {
        const startDate = new Date(formData.availabilityStart);
        const endDate = new Date(formData.availabilityEnd);

        if (startDate >= endDate) {
          setSnackbar({
            open: true,
            message: "End date must be after start date.",
            severity: "error",
          });
          return;
        }
      }

      const dataToSend = new FormData();
      dataToSend.append("carName", formData.carName);
      dataToSend.append("brand", formData.brand);
      dataToSend.append("wilaya", formData.wilaya);
      dataToSend.append("description", formData.description);
      dataToSend.append("energy", formData.energy);
      dataToSend.append("seats", formData.seats);
      dataToSend.append("doors", formData.doors);
      dataToSend.append("transmission", formData.transmission);
      dataToSend.append("mileage", formData.mileage);
      dataToSend.append("engine", formData.engine);
      dataToSend.append("availabilityStart", formData.availabilityStart);
      dataToSend.append("availabilityEnd", formData.availabilityEnd);
      dataToSend.append("price", formData.price);
      dataToSend.append("carType", formData.carType);
      // Append pickup location coordinates if selected
      const selectedPickup = pickupLocations.find(
        (l) => String(l.id) === String(formData.pickupLocationId)
      );
      if (selectedPickup) {
        dataToSend.append("location[lat]", selectedPickup.lat);
        dataToSend.append("location[lng]", selectedPickup.lng);
      }



      formData.images.forEach((imageFile) => {
        dataToSend.append("images", imageFile);
      });

      formData.documentationImages.forEach((imageFile) => {
        dataToSend.append("documentationImages", imageFile);
      });

      const apiUrl = process.env.REACT_APP_API_URL || "https://pfe-uhbw.onrender.com";
      const response = await fetch(`${apiUrl}/api/cars/addcars`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to post the car");
      }

      setSnackbar({
        open: true,
        message: "Car posted successfully!",
        severity: "success",
      });
      onClose();
    } catch (error) {
      console.error("Error posting car:", error.message);
      setSnackbar({
        open: true,
        message: error.message || "Failed to post the car. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const filteredPickupLocations = formData.wilaya ? 
    pickupLocations.filter(loc => loc.wilaya === formData.wilaya) : 
    pickupLocations;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: "0 12px 50px -12px rgba(30,41,59,0.25)",
            bgcolor: "#f8fafc",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
            p: 4,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, mb: 0.5, color: "white", letterSpacing: 0.5 }}
          >
            Post Your Car for Rent
          </Typography>
          <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.85)", mb: 0 }}>
            Share your car and earn income easily
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 16,
              top: 16,
              color: "white",
              "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <form onSubmit={handleSubmit}>
          <DialogContent
            sx={{ p: 4, maxHeight: "70vh", overflowY: "auto", bgcolor: "#f8fafc" }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Image Upload */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#334155", fontWeight: 600 }}
                >
                  Car Images
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  fullWidth
                  sx={{
                    mb: 1.5,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    borderColor: "#475569",
                    color: "#475569",
                    bgcolor: "#f1f5f9",
                    "&:hover": { borderColor: "#334155", bgcolor: "#e2e8f0" },
                  }}
                >
                  Upload Images (max 5)
                  <input
                    type="file"
                    accept="image/*"
                    name="images"
                    multiple
                    hidden
                    onChange={handleChange}
                  />
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    mt: 1,
                    p: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                  }}
                >
                  {imagePreviews.map((src, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: "relative",
                        width: 72,
                        height: 72,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "2px solid #cbd5e1",
                        bgcolor: "#fff",
                        boxShadow: "0 2px 8px rgba(30,41,59,0.07)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={src}
                        alt="preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 12,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveImage(idx)}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                          },
                          p: 0.5,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Documentation Images Upload */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: "#334155", fontWeight: 600 }}
                >
                  Car Documentation (Images)
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<AddPhotoAlternateIcon />}
                  fullWidth
                  sx={{
                    mb: 1.5,
                    textTransform: "none",
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    borderColor: "#475569",
                    color: "#475569",
                    bgcolor: "#f1f5f9",
                    "&:hover": { borderColor: "#334155", bgcolor: "#e2e8f0" },
                  }}
                >
                  Upload Documentation Images (max 5)
                  <input
                    type="file"
                    accept="image/*"
                    name="documentationImages"
                    multiple
                    hidden
                    onChange={(e) => {
                      const newImages = Array.from(e.target.files);
                      setFormData((prev) => ({
                        ...prev,
                        documentationImages: [...prev.documentationImages, ...newImages].slice(0, 5), // Limit to 5 images
                      }));
                      setDocumentationImagePreviews((prev) => [
                        ...prev,
                        ...newImages.map((file) => URL.createObjectURL(file)),
                      ].slice(0, 5));
                    }}
                  />
                </Button>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    overflowX: "auto",
                    mt: 1,
                    p: 1,
                    border: "1px solid #cbd5e1",
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                  }}
                >
                  {documentationImagePreviews.map((src, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        position: "relative",
                        width: 72,
                        height: 72,
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "2px solid #cbd5e1",
                        bgcolor: "#fff",
                        boxShadow: "0 2px 8px rgba(30,41,59,0.07)",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={src}
                        alt="documentation preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: 12,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => {
                          const newImages = [...formData.documentationImages];
                          newImages.splice(idx, 1);
                          setFormData((prev) => ({ ...prev, documentationImages: newImages }));

                          const newPreviews = [...documentationImagePreviews];
                          URL.revokeObjectURL(newPreviews[idx]);
                          newPreviews.splice(idx, 1);
                          setDocumentationImagePreviews(newPreviews);
                        }}
                        sx={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          color: "white",
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                          },
                          p: 0.5,
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Description */}
              <TextField
                required
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                minRows={2}
                maxRows={4}
                InputProps={{
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: "#f1f5f9",
                    boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                    "&:hover": { bgcolor: "#e2e8f0" },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 2px #64748b44",
                      borderColor: "#475569",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                }}
              />
              {/* Car Name, Brand, Wilaya */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Car Name"
                  name="carName"
                  value={formData.carName}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <path
                            d="M6 15v-2a2 2 0 012-2h4a2 2 0 012 2v2"
                            stroke="#64748b"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                          <rect
                            x="4.5"
                            y="10"
                            width="11"
                            height="2.5"
                            rx="1.25"
                            fill="#e2e8f0"
                            stroke="#64748b"
                            strokeWidth="1.2"
                          />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                />
                <TextField
                  required
                  select
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <circle cx="10" cy="10" r="6" stroke="#64748b" strokeWidth="1.5" fill="#fff" />
                          <path
                            d="M10 4v12M4 10h12"
                            stroke="#64748b"
                            strokeWidth="1.2"
                          />
                          <path d="M10 10l4.2-4.2" stroke="#64748b" strokeWidth="1.1" />
                          <circle cx="10" cy="10" r="2.2" fill="#e2e8f0" stroke="#64748b" strokeWidth="1.1" />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                >
                  {brands.map((b) => (
                    <MenuItem key={b} value={b}>
                      {b}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  select
                  fullWidth
                  label="Wilaya"
                  name="wilaya"
                  value={formData.wilaya}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnIcon sx={{ color: "#64748b" }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                >
                  {wilayas.map((w) => (
                    <MenuItem key={w} value={w}>
                      {w}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {/* Car Type */}
              <TextField
                required
                select
                fullWidth
                label="Car Type"
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                        <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                        <path
                          d="M6 15v-2a2 2 0 012-2h4a2 2 0 012 2v2"
                          stroke="#64748b"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                        <rect
                          x="4.5"
                          y="10"
                          width="11"
                          height="2.5"
                          rx="1.25"
                          fill="#e2e8f0"
                          stroke="#64748b"
                          strokeWidth="1.2"
                        />
                      </svg>
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: "#f1f5f9",
                    boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                    "&:hover": { bgcolor: "#e2e8f0" },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 2px #64748b44",
                      borderColor: "#475569",
                    },
                  },
                }}
                InputLabelProps={{
                  sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                }}
              >
                {carTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </TextField>
              {/* Pickup Location */}
              <TextField
                required
                select
                fullWidth
                label="Pickup Location"
                name="pickupLocationId"
                value={formData.pickupLocationId}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocationOnIcon sx={{ color: "#64748b" }} />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: "#f1f5f9",
                    boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                    "&:hover": { bgcolor: "#e2e8f0" },
                    "&.Mui-focused": {
                      boxShadow: "0 0 0 2px #64748b44",
                      borderColor: "#475569",
                    },
                  },
                }}
                InputLabelProps={{ sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 } }}
              >
                {filteredPickupLocations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))}
              </TextField>
              {/* Energy, Engine, Transmission */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  required
                  select
                  fullWidth
                  label="Energy"
                  name="energy"
                  value={formData.energy}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <rect
                            x="7"
                            y="7"
                            width="6"
                            height="8"
                            rx="1.2"
                            stroke="#64748b"
                            strokeWidth="1.5"
                          />
                          <rect x="10" y="6" width="2" height="2" rx="0.5" fill="#64748b" />
                          <path
                            d="M8.5 8.5l5 5"
                            stroke="#64748b"
                            strokeWidth="1.1"
                            strokeLinecap="round"
                          />
                          <rect
                            x="9"
                            y="11"
                            width="2"
                            height="2.5"
                            rx="0.7"
                            stroke="#64748b"
                            strokeWidth="1.1"
                          />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                >
                  {energies.map((e) => (
                    <MenuItem key={e} value={e}>
                      {e}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  required
                  fullWidth
                  label="Engine (e.g. 1.6L, 90ch)"
                  name="engine"
                  value={formData.engine}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <path
                            d="M7 13l6-6M7 7h6v6"
                            stroke="#64748b"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                />
                <TextField
                  required
                  select
                  fullWidth
                  label="Transmission"
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <path
                            d="M7 13V7M13 13V7M7 10h6M10 7v6"
                            stroke="#64748b"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                          <circle cx="7" cy="7" r="1" fill="#64748b" />
                          <circle cx="13" cy="7" r="1" fill="#64748b" />
                          <circle cx="7" cy="13" r="1" fill="#64748b" />
                          <circle cx="13" cy="13" r="1" fill="#64748b" />
                          <circle cx="10" cy="10" r="1" fill="#64748b" />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                >
                  {transmissions.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {/* Seats, Doors, Mileage */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Seats"
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  inputProps={{ min: 1, max: 9 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <path
                            d="M7.5 5c0-1 .8-1.5 1.7-1.2l.3.1c.4.2.7.6.7 1.1v3.5"
                            stroke="#64748b"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                          />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Doors"
                  name="doors"
                  type="number"
                  value={formData.doors}
                  onChange={handleChange}
                  inputProps={{ min: 2, max: 6 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <path
                            d="M6.5 15V7.5c0-.5.3-.9.7-1.1l5.1-1.7c.6-.2 1.2.2 1.2.8V15"
                            stroke="#64748b"
                            strokeWidth="1.4"
                            fill="#fff"
                          />
                          <path d="M7 8.2h7.2" stroke="#64748b" strokeWidth="1.1" />
                          <rect
                            x="8.8"
                            y="9.3"
                            width="2.4"
                            height="1.1"
                            rx="0.5"
                            fill="#e2e8f0"
                            stroke="#64748b"
                            strokeWidth="1"
                          />
                          <rect
                            x="8.2"
                            y="11.8"
                            width="4.2"
                            height="0.5"
                            rx="0.2"
                            fill="#64748b"
                          />
                          <ellipse
                            cx="8.7"
                            cy="10.6"
                            rx="0.7"
                            ry="0.3"
                            fill="#e2e8f0"
                            stroke="#64748b"
                            strokeWidth="0.9"
                          />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Mileage (km)"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  inputProps={{ min: 0 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <circle cx="10" cy="10" r="5" stroke="#64748b" strokeWidth="1.6" />
                          <path
                            d="M10 10V7"
                            stroke="#64748b"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                          />
                          <circle cx="10" cy="10" r="1.2" fill="#64748b" />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                />
              </Box>
              {/* Availability Dates */}
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  required
                  fullWidth
                  label="Available From"
                  name="availabilityStart"
                  type="date"
                  value={formData.availabilityStart}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <rect
                            x="6"
                            y="8"
                            width="8"
                            height="6"
                            rx="1.2"
                            stroke="#64748b"
                            strokeWidth="1.6"
                          />
                          <rect x="8" y="6" width="1.5" height="2" rx="0.5" fill="#64748b" />
                          <rect x="10.5" y="6" width="1.5" height="2" rx="0.5" fill="#64748b" />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                />
                <TextField
                  required
                  fullWidth
                  label="Available Until"
                  name="availabilityEnd"
                  type="date"
                  value={formData.availabilityEnd}
                  onChange={handleChange}
                  InputLabelProps={{
                    shrink: true,
                    sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <svg width="20" height="20" fill="none" style={{ marginRight: 4 }}>
                          <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                          <rect
                            x="6"
                            y="8"
                            width="8"
                            height="6"
                            rx="1.2"
                            stroke="#64748b"
                            strokeWidth="1.6"
                          />
                          <rect x="8" y="6" width="1.5" height="2" rx="0.5" fill="#64748b" />
                          <rect x="10.5" y="6" width="1.5" height="2" rx="0.5" fill="#64748b" />
                        </svg>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                />
                {/* Price Field */}
                <TextField
                  required
                  fullWidth
                  label="Price per Day (DZD)"
                  name="price"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.price}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ color: "#64748b", fontWeight: 600 }}>DZD</Typography>
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2.5,
                      bgcolor: "#f1f5f9",
                      boxShadow: "0 1px 4px rgba(30,41,59,0.03)",
                      "&:hover": { bgcolor: "#e2e8f0" },
                      "&.Mui-focused": {
                        boxShadow: "0 0 0 2px #64748b44",
                        borderColor: "#475569",
                      },
                    },
                  }}
                  InputLabelProps={{ sx: { fontWeight: 600, color: "#334155", letterSpacing: 0.3 } }}
                />
              </Box>
              {/* Car Features */}
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: "#334155",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={{ mr: 1, display: "flex", alignItems: "center" }}
                  >
                    <svg width="20" height="20" fill="none">
                      <rect width="20" height="20" rx="10" fill="#e2e8f0" />
                      <path
                        d="M6 10h8M6 7h8M6 13h8"
                        stroke="#475569"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Box>
                  Car Features
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr 1fr",
                      sm: "1fr 1fr 1fr",
                      md: "repeat(5, 1fr)",
                    },
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  }}
                >
                  {carFeatures.map((feature) => (
                    <Box
                      key={feature.id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          features: {
                            ...prev.features,
                            [feature.id]: !prev.features[feature.id],
                          },
                        }));
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        p: 1.5,
                        borderRadius: 2,
                        cursor: "pointer",
                        bgcolor: formData.features[feature.id] ? "#e2e8f0" : "transparent",
                        border: formData.features[feature.id]
                          ? "1px solid #cbd5e1"
                          : "1px solid transparent",
                        boxShadow: formData.features[feature.id]
                          ? "0 2px 4px rgba(15,23,42,0.06)"
                          : "none",
                        "&:hover": {
                          bgcolor: formData.features[feature.id]
                            ? "#e2e8f0"
                            : "#f1f5f9",
                          borderColor: formData.features[feature.id]
                            ? "#94a3b8"
                            : "#cbd5e1",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <Box
                        sx={{
                          mr: 1.5,
                          fontSize: "1.2rem",
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: formData.features[feature.id] ? "#475569" : "#f1f5f9",
                          color: formData.features[feature.id] ? "white" : "#64748b",
                          borderRadius: "50%",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          color: formData.features[feature.id] ? "#334155" : "#64748b",
                          fontWeight: formData.features[feature.id] ? 600 : 400,
                        }}
                      >
                        {feature.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
            <DialogActions sx={{ p: 0, pt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                startIcon={
                  <svg
                    width="24"
                    height="24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="24" height="24" rx="12" fill="#334155" />
                    <path
                      d="M7 17v-2.5a2 2 0 012-2h6a2 2 0 012 2V17"
                      stroke="#fff"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                    <rect
                      x="5.5"
                      y="12"
                      width="13"
                      height="3"
                      rx="1.5"
                      fill="#64748b"
                    />
                    <circle cx="8.5" cy="17.5" r="1.5" fill="#fff" />
                    <circle cx="15.5" cy="17.5" r="1.5" fill="#fff" />
                  </svg>
                }
                sx={{
                  background: "linear-gradient(90deg, #334155 0%, #475569 100%)",
                  color: "white",
                  py: 1.5,
                  fontSize: "1.13rem",
                  fontWeight: 700,
                  borderRadius: 3,
                  boxShadow: "0 2px 12px 0 rgba(71,85,105,0.13)",
                  textTransform: "none",
                  letterSpacing: 0.7,
                  transition: "all 0.22s cubic-bezier(.4,2,.6,1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  "&:hover": {
                    background: "linear-gradient(90deg, #475569 0%, #334155 100%)",
                    color: "#f1f5f9",
                    boxShadow: "0 6px 24px 0 rgba(30,41,59,0.18), 0 0 0 4px #cbd5e15a",
                    transform: "scale(1.035) translateY(-2px)",
                  },
                }}
              >
                Post Car
              </Button>
            </DialogActions>
          </DialogContent>
        </form>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Commented out Map Dialog to remove reference to LocationMarker */}
      {/*
      <Dialog
        open={mapDialogOpen}
        onClose={handleCloseMapDialog}
        maxWidth="md"
        fullWidth
        fullScreen={window.innerWidth < 600}
      >
        <DialogTitle sx={{ bgcolor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
            Set Pickup Location
          </Typography>
          <IconButton
            onClick={handleCloseMapDialog}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#64748b' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, height: window.innerWidth < 600 ? 'calc(100vh - 56px)' : '70vh' }}>
          <MapContainer
            center={formData.location || [36.737232, 3.086472]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <LocationMarker
              position={formData.location}
              setPosition={handleLocationSelect}
            />
          </MapContainer>
          <SearchControl onLocationFound={handleLocationSelect} mapRef={mapRef} />
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Fab
              size="small"
              color="primary"
              onClick={handleUseCurrentLocation}
              sx={{
                boxShadow: '0 4px 12px rgba(30,41,59,0.2)',
                '&:hover': { bgcolor: '#1e293b' },
              }}
            >
              <MyLocationIcon />
            </Fab>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={handleCloseMapDialog}
            color="primary"
            variant="contained"
            disabled={!formData.location || !formData.locationValid}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
          >
            Confirm Location
          </Button>
        </DialogActions>
      </Dialog>
      */}
    </>
  );
}

export { PostCarDialog };
