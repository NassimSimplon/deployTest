const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
//SqlDb
const { db } = require("./SqlDb");
const House = require("./House"); // Adjust the path to your model file
const { upload, uploadErrorHandler } = require("./multer-config");
const { validateHouseData } = require("./validateHouseData");
const handleError = require("./errorHandler");
// Assuming you have a User model
// const Rent = require("./Rents"); // New Rent model
// const User = require("./User");
const authorizeRoles = require("./authorizeRoles");
const verifyToken = require("./verifyToken");
const { HTTP_STATUS } = require("./Helpers");

/**
 * @route   POST /houses
 * @desc    Create a new house entry
//  * @access  Public (or adjust for your use case, e.g., authenticated users)
 */



router.post(
  "/",
  upload.array("images", 10), // Multer handles file uploads
  uploadErrorHandler, // Middleware to handle errors during upload
  validateHouseData,
  async (req, res) => {
    try {
      // Destructure fields from the request body
      const {
        owner_id,
        owner_name,
        status = "available",
        description,
        price_per_day,
        location,
        posted_by,
      } = req.body;

      // Ensure uploaded files exist
      if (!req.files || req.files.length === 0) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "At least one image is required." });
      }

      // Map uploaded files to their respective URLs
      const images = req.files.map((file) => `/uploads/${file.filename}`);

      // Validate status against allowed values
      const allowedStatuses = ["available", "rented", "under_maintenance"];
      if (!allowedStatuses.includes(status)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: `Invalid status. Allowed values: ${allowedStatuses.join(
            ", "
          )}`,
        });
      }

      // Prepare SQL INSERT statement
      const insertQuery = `
        INSERT INTO public.houses (owner_id, owner_name, posted_by, images, status, description, price_per_day, location, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *
      `;
      const values = [
        owner_id,
        owner_name,
        posted_by,
        images,
        status,
        description,
        price_per_day,
        location,
        new Date(), // Current timestamp for created_at
      ];

      // Execute the insert query
      const result = await db.query(insertQuery, values);
      const savedHouse = result.rows[0]; // Get the inserted house details

      // Respond with the saved house
      return res.status(HTTP_STATUS.CREATED).json({
        message: "House created successfully.",
        house: savedHouse,
      });
    } catch (error) {
      console.error("Error creating house:", error);
      handleError(res, error, "Failed to create house");
    }
  }
);
// Get all houses with pagination
router.get("/", verifyToken, async (req, res) => {
  try {
    // Get query parameters
    const page = parseInt(req.query.page, 10) || 1; // Default to page 1
    const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 per page

    // Validate page and limit values
    if (page <= 0 || limit <= 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        message: "Page and limit must be positive integers.",
      });
    }

    // Calculate the offset for pagination
    const offset = (page - 1) * limit;

    // Construct the query to fetch houses with pagination
    const fetchHousesQuery = `
        SELECT * FROM public.houses
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2;
      `;

    // Query to get the total count of houses
    const countHousesQuery = `
        SELECT COUNT(*) AS total FROM public.houses;
      `;

    // Fetch data from the database
    const housesResult = await db.query(fetchHousesQuery, [limit, offset]);
    const countResult = await db.query(countHousesQuery);

    const houses = housesResult.rows; // Houses data
    const totalHouses = parseInt(countResult.rows[0].total, 10); // Total count of houses

    // If no houses are found
    if (!houses.length) {
      return res
        .status(HTTP_STATUS.OK)
        .json({ message: "No houses found", houses: [], pagination: {} });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalHouses / limit);

    // Respond with the houses and pagination info
    res.status(HTTP_STATUS.OK).json({
      houses,
      pagination: {
        totalHouses,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching houses:", error);
    handleError(res, error, "Error fetching houses");
  }
});

// Get a specific house by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  // Validate ID format (assuming it is a numeric ID; modify as needed)
  if (isNaN(id)) {
    return res
      .status(HTTP_STATUS.BAD_REQUEST)
      .json({ message: "Invalid house ID format" });
  }

  try {
    // Query to fetch a specific house by ID
    const fetchHouseQuery = `
      SELECT * FROM public.houses
      WHERE id = $1;
    `;

    // Execute the query
    const result = await db.query(fetchHouseQuery, [id]);

    // Check if the house was found
    if (result.rows.length === 0) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: "House not found" });
    }

    // Respond with the house data
    res.status(HTTP_STATUS.OK).json(result.rows[0]); // Return the first (and only) row
  } catch (error) {
    console.error("Error fetching house by ID:", error);
    handleError(res, error, "Error fetching house by ID");
  }
});

// Update a house by ID
router.put(
  "/:id",
  upload.array("images", 10),
  uploadErrorHandler,
  authorizeRoles("admin", "subAdmin", "owner"),
  async (req, res) => {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid house ID format" });
    }

    const updatedData = req.body;
    const uploadedFiles = req.files.map((file) => `/uploads/${file.filename}`);

    try {
      // Fetch existing house details
      const existingHouseQuery = `SELECT images FROM public.houses WHERE id = $1`;
      const existingHouseResult = await db.query(existingHouseQuery, [id]);

      if (existingHouseResult.rows.length === 0) {
        return res.status(404).json({ message: "House not found" });
      }

      const existingImages = existingHouseResult.rows[0].images || [];

      // Identify and remove old images
      const removedImages = existingImages.filter(
        (image) => !uploadedFiles.includes(image)
      );
      removedImages.forEach((image) => {
        const imagePath = path.join(
          __dirname,
          "../uploads",
          path.basename(image)
        );
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath);
          } catch (err) {
            console.error(`Error deleting image ${imagePath}:`, err.message);
          }
        }
      });

      // Combine remaining existing images with new uploads
      const finalImages = uploadedFiles;

      // Ensure the array format is PostgreSQL-compliant
      const formattedImages = `{${finalImages
        .map((img) => `"${img}"`)
        .join(",")}}`;

      // Update the house in the database
      const updateHouseQuery = `
        UPDATE public.houses
        SET owner_id = $1,
            owner_name = $2,
            posted_by = $3,
            images = $4,
            status = $5,
            description = $6,
            price_per_day = $7,
            location = $8
        WHERE id = $9
        RETURNING *;
      `;

      const result = await db.query(updateHouseQuery, [
        updatedData.owner_id,
        updatedData.owner_name,
        updatedData.posted_by,
        formattedImages, // Correctly formatted array
        updatedData.status,
        updatedData.description,
        updatedData.price_per_day,
        updatedData.location,
        id,
      ]);

      res.status(200).json({
        message: "House updated successfully",
        data: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating house:", error);
      res.status(500).json({
        message: "Error updating house",
        error: error.message,
      });
    }
  }
);
// Delete a house by ID
router.delete(
  "/:id",
  authorizeRoles("admin", "subAdmin", "owner"),
  async (req, res) => {
    const { id } = req.params;

    // Validate ID format (assuming numeric ID)
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid house ID format" });
    }

    try {
      // Check if the house exists
      const existingHouseQuery = `SELECT images FROM public.houses WHERE id = $1`;
      const existingHouseResult = await db.query(existingHouseQuery, [id]);

      if (existingHouseResult.rows.length === 0) {
        return res.status(404).json({ message: "House not found" });
      }

      // Parse the images array (ensure it is properly handled if stored as JSON)
      const existingImages = existingHouseResult.rows[0].images || [];

      // Remove images associated with the house from the /uploads folder
      existingImages.forEach((image) => {
        const imagePath = path.join(
          __dirname,
          "../uploads",
          path.basename(image)
        ); // Ensure secure path resolution
        if (fs.existsSync(imagePath)) {
          try {
            fs.unlinkSync(imagePath); // Delete the file
          } catch (err) {
            console.error(`Error deleting image ${imagePath}:`, err.message);
          }
        }
      });

      // Delete the house from the database
      const deleteHouseQuery = `DELETE FROM public.houses WHERE id = $1 RETURNING *`;
      const deleteHouseResult = await db.query(deleteHouseQuery, [id]);

      if (deleteHouseResult.rows.length === 0) {
        return res.status(404).json({ message: "House not found" });
      }

      res.status(200).json({
        message: "House and associated images deleted successfully",
        data: deleteHouseResult.rows[0],
      });
    } catch (error) {
      console.error("Error deleting house:", error);
      res.status(500).json({
        message: "Error deleting house",
        error: error.message,
      });
    }
  }
);

// // Delete a specific rent from a house
// router.delete("/:houseId/rents/:rentId", async (req, res) => {
//   const { houseId, rentId } = req.params;

//   if (!isValidObjectId(houseId) || !isValidObjectId(rentId)) {
//     return res.status(400).json({ message: "Invalid house or rent ID format" });
//   }

//   try {
//     const house = await House.findById(houseId);
//     if (!house) {
//       return res.status(404).json({ message: "House not found" });
//     }

//     const rent = house.rents.id(rentId);
//     if (!rent) {
//       return res.status(404).json({ message: "Rent not found" });
//     }

//     rent.remove();
//     await house.save();
//     res.status(200).json(house);
//   } catch (error) {
//     handleError(res, error, "Error deleting rent");
//   }
// });

module.exports = router;
