const { body, validationResult } = require("express-validator");

const validateHouseData = [
  // Validate ownerID (must be a number)
  body("owner_id")
    .notEmpty()
    .withMessage("Owner ID is required.")
    .isNumeric()
    .withMessage("Owner ID must be a number."),

  // Validate ownerName (must be a string)
  body("owner_name")
    .notEmpty()
    .withMessage("Owner name is required.")
    .isString()
    .withMessage("Owner name must be a string."),

  // Validate status (optional, must be one of the allowed values)
  body("status")
    .optional()
    .isIn(["available", "rented", "under_maintenance"])
    .withMessage("Invalid status. Allowed values: available, rented, under_maintenance."),

  // Validate description (required, must be a string)
  body("description")
    .notEmpty()
    .withMessage("Description is required.")
    .isString()
    .withMessage("Description must be a string."),

  // Validate pricePerDay (required, must be a number)
  body("price_per_day")
    .notEmpty()
    .withMessage("Price per day is required.")
    .isNumeric()
    .withMessage("Price per day must be a number."),

  // Validate location (required, must be a string)
  body("location")
    .notEmpty()
    .withMessage("Location is required.")
    .isString()
    .withMessage("Location must be a string."),

  // Validate postedBy (required, must be one of the allowed values)
  body("posted_by")
    .notEmpty()
    .withMessage("Posted by is required.")
    .isString()
    .withMessage("Posted by must be a string.")
    .isIn(["admin", "user", "owner", "subAdmin"])
    .withMessage("Invalid postedBy value. Allowed values: admin, user, owner, subAdmin."),

  // Check for validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateHouseData };
