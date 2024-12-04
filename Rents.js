const express = require("express");
const router = express.Router();
//@Db
  const { db } = require('./SqlDb');
const verifyToken = require("./verifyToken");
const { HTTP_STATUS } = require("./Helpers");
const authorizeRoles = require("./authorizeRoles");

// Add a rent to a house

router.post("/book",  authorizeRoles('user'), async (req, res) => {
    const {
      amount,
      tenantName,
      tenantEmail,
      startDate,
      endDate,
      status = 'pending',
      notes,
      tenantId,
      ownerId,
      phone,
      houseId,
    } = req.body;
  
    try {
      // Check if the house exists
      const houseResult = await db.query("SELECT * FROM public.houses WHERE id = $1", [houseId]);
      if (houseResult.rows.length === 0) {
        return handleError(res, new Error("House not found"), "House not found", HTTP_STATUS.NOT_FOUND);
      }
  
      // Verify tenant and owner existence
      const tenantResult = await db.query("SELECT * FROM public.users WHERE id = $1", [tenantId]);
      const ownerResult = await db.query("SELECT * FROM public.users WHERE id = $1", [ownerId]);
      if (tenantResult.rows.length === 0 || ownerResult.rows.length === 0) {
        return handleError(res, new Error("Tenant or owner not found"), "Tenant or owner not found", HTTP_STATUS.NOT_FOUND);
      }
  
      // Calculate the number of days between startDate and endDate
      const start = new Date(startDate);
      const end = new Date(endDate);
      const timeDiff = end - start;
      const daysNumber = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Calculate days
  
      // Insert the rent into the rentals table
      const insertRentQuery = `
        INSERT INTO public.rentals 
          (amount, tenant_name, tenant_email, start_date, end_date, status, notes, tenant_id, owner_id, phone, days_number, house_id)
        VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *;
      `;
  
      const rentValues = [
        amount,
        tenantName,
        tenantEmail,
        startDate,
        endDate,
        status,
        notes,
        tenantId,
        ownerId,
        phone,
        daysNumber,
        houseId,
      ];
  
      const rentResult = await db.query(insertRentQuery, rentValues);
  
      // Respond with the newly created rent record
      res.status(HTTP_STATUS.CREATED).json({
        message: "Rent added successfully",
        rent: rentResult.rows[0],
      });
    } catch (error) {
      handleError(res, error, "Error adding rent", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  });
// Update a specific rent of a house

router.put("/:houseId/rents/:rentId", authorizeRoles('user'), async (req, res) => {
    const { houseId, rentId } = req.params;
  
    try {
      // Check if the house exists
      const houseResult = await db.query("SELECT * FROM public.houses WHERE id = $1", [houseId]);
      if (houseResult.rows.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "House not found" });
      }
  
      // Check if the rent exists
      const rentResult = await db.query("SELECT * FROM public.rentals WHERE id = $1", [rentId]);
      if (rentResult.rows.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Rent not found" });
      }
  
      // Update the rent details
      const updatedRent = {
        amount: req.body.amount,
        tenant_name: req.body.tenantName,
        tenant_email: req.body.tenantEmail,
        start_date: req.body.startDate,
        end_date: req.body.endDate,
        status: 'pending',
        notes: req.body.notes,
        phone: req.body.phone,
      };
  
      const updateRentQuery = `
        UPDATE public.rentals 
        SET amount = $1, tenant_name = $2, tenant_email = $3, start_date = $4, end_date = $5,
            status = $6, notes = $7, phone = $8
        WHERE id = $9 RETURNING *;
      `;
  
      const rentValues = [
        updatedRent.amount,
        updatedRent.tenant_name,
        updatedRent.tenant_email,
        updatedRent.start_date,
        updatedRent.end_date,
        updatedRent.status,
        updatedRent.notes,
        updatedRent.phone,
        rentId,
      ];
  
      const updateResult = await db.query(updateRentQuery, rentValues);
  
      // Respond with the updated rent record
      res.status(HTTP_STATUS.OK).json({
        message: "Rent updated successfully",
        rent: updateResult.rows[0],
      });
    } catch (error) {
      handleError(res, error, "Error updating rent");
    }
  });
  

  
  // Get rents by houseId and only allow access if the user is admin, subAdmin, or owner
  router.get("/:houseId/rents", authorizeRoles("admin", "subAdmin", "owner"), async (req, res) => {
    const { houseId } = req.params;

    // Get page and limit from query parameters, with defaults
    const page = parseInt(req.query.page) || 1;  // Default to page 1
    const limit = parseInt(req.query.limit) || 10;  // Default to 10 rents per page
    const skip = (page - 1) * limit;  // Skip the appropriate number of rents based on page

    try {
        // Check if the house exists
        const houseResult = await db.query("SELECT * FROM public.houses WHERE id = $1", [houseId]);
        if (houseResult.rows.length === 0) {
            return res.status(404).json({ message: "House not found" });
        }

        // Fetch total count of rents associated with the house
        const totalRentsQuery = "SELECT COUNT(*) FROM public.rentals WHERE house_id = $1";
        const totalRentsResult = await db.query(totalRentsQuery, [houseId]);
        const totalRents = parseInt(totalRentsResult.rows[0].count); // Get the total count of rents

        // Fetch rents associated with the house
        const rentsQuery = `
            SELECT * FROM public.rentals
            WHERE house_id = $1
            ORDER BY start_date DESC
            LIMIT $2 OFFSET $3;
        `;
        const rentsResult = await db.query(rentsQuery, [houseId, limit, skip]);

        // Calculate total pages and remaining pages
        const totalPages = Math.ceil(totalRents / limit); // Total number of pages
        const remainingPages = totalPages - page; // Pages left after the current page

        // Respond with the rents and pagination info
        res.status(HTTP_STATUS.OK).json({
            message: "Rents retrieved successfully",
            rents: rentsResult.rows,
            totalRents: totalRents,  // Total rents count
            currentPage: page,
            totalPages: totalPages, // Total pages based on the count
            remainingPages: remainingPages >= 0 ? remainingPages : 0 // Prevent negative remaining pages
        });
    } catch (error) {
        handleError(res, error, "Error retrieving rents");
    }
});

module.exports = router;
