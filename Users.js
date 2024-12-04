//Router
const router = require("express").Router();
//Model
const USER = require("./UserModel");
//Valid token secret key
const authorizeRolesKey = require("./authorizeRoles");
 

const cPanelDb = require('./CpanelDb'); // Correctly import cPanelDb

//@GET
router.get("/", async (req, res) => {
    try {
        const [rows] = await cPanelDb.query("SELECT id, username, email, title, phone, role FROM users");

        return res.status(200).json({
            message: "GET All Users Successfully",
            data: rows,
        });
    } catch (error) {
        console.error("Database query failed:", error);
        return res.status(500).json({
            message: "Internal Server Error: Unable to retrieve users.",
            error: error.message,
        });
    }
});

//@DELETE
router.delete("/:id", authorizeRolesKey('admin','subAdmin'), async (req, res) => {
  try {
    const _user = USER.findByIdAndDelete(req.params.id)
      .then((result) => {
        return res.status(200).json({
          message: "DELETE User Successfully",
          data: result,
        });
      })
      .catch((error) => {
        return res.status(400).json({
          message: `DELETE User Has Failed : ${error} `,
        });
      });
    return await _user;
  } catch (err) {
    return res.status(400).json({
      message: "Something went wrong when trying to DELETE User",
      error: err,
    });
  }
});

// @PUT 
router.put("/update-self/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    // Ensure the user can only update their own data
    if (id !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this user data.",
      });
    }

    const updatedUser = await USER.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        message: `User with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      message: "User successfully updated.",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      message: "Something went wrong when trying to UPDATE User",
      error: err.message || err,
    });
  }
});

// @PUT Admin    
router.put("/update/:id", authorizeRolesKey('admin','subAdmin'), async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const updatedUser = await USER.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password -__v");

    if (!updatedUser) {
      return res.status(404).json({
        message: `User with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      message: "Admin successfully updated the user.",
      data: updatedUser,
    });
  } catch (err) {
    console.error("Error updating user:", err);
    return res.status(500).json({
      message: "Something went wrong when trying to Update User",
      error: err.message || err,
    });
  }
});


module.exports = router;
