// server/controllers/restaurantController.js
const { validationResult } = require('express-validator');
const db = require('../config/database');
const fs = require('fs');
const path = require('path');
const emailSender = require('../utils/emailSender');

// Get all restaurants
exports.getAllRestaurants = async (req, res) => {
  try {
    const [restaurants] = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id) as reviews_count,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as average_rating,
        (SELECT photo_url FROM restaurant_photos WHERE restaurant_id = r.id AND is_primary = 1 LIMIT 1) as primary_photo
      FROM restaurants r
      WHERE r.is_approved = 1
      ORDER BY r.name
    `);

    res.json({
      success: true,
      restaurants
    });
  } catch (err) {
    console.error('Error fetching restaurants:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Search restaurants by criteria
exports.searchRestaurants = async (req, res) => {
  const { date, time, party_size, location, cuisine_type, price_range, rating } = req.query;
  
  try {
    let query = `
      SELECT r.*, 
        (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id) as reviews_count,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as average_rating,
        (SELECT photo_url FROM restaurant_photos WHERE restaurant_id = r.id AND is_primary = 1 LIMIT 1) as primary_photo,
        (SELECT COUNT(*) FROM reservations WHERE restaurant_id = r.id AND reservation_date = ? AND status IN ('confirmed', 'pending')) as bookings_today
      FROM restaurants r
      WHERE r.is_approved = 1
    `;
    
    const queryParams = [date || new Date().toISOString().split('T')[0]];
    
    // Add location filter
    if (location) {
      query += ` AND (r.city LIKE ? OR r.zip_code LIKE ?)`;
      queryParams.push(`%${location}%`, `%${location}%`);
    }
    
    // Add cuisine filter
    if (cuisine_type) {
      query += ` AND r.cuisine_type = ?`;
      queryParams.push(cuisine_type);
    }
    
    // Add price range filter
    if (price_range) {
      query += ` AND r.cost_rating <= ?`;
      queryParams.push(price_range);
    }
    
    // Add rating filter
    if (rating) {
      query += ` AND (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) >= ?`;
      queryParams.push(rating);
    }
    
    query += ` ORDER BY r.name`;
    
    const [restaurants] = await db.query(query, queryParams);
    
    // Filter for available time slots if time and party_size are provided
    let availableRestaurants = restaurants;
    
    if (time && party_size) {
      // This would normally involve a complex query to check table availability
      // For simplicity, we'll just simulate available slots
      availableRestaurants = restaurants.map(restaurant => {
        // Generate random available time slots near the requested time
        const requestedHour = parseInt(time.split(':')[0]);
        const availableTimes = [];
        
        // Add times 30 minutes before and after the requested time
        for (let i = -1; i <= 1; i++) {
          const hour = requestedHour + Math.floor(i / 2);
          const minute = (i % 2) === 0 ? '00' : '30';
          if (hour >= 10 && hour <= 22) { // Restaurant hours
            availableTimes.push(`${hour}:${minute}`);
          }
        }
        
        return {
          ...restaurant,
          available_times: availableTimes
        };
      });
    }
    
    res.json({
      success: true,
      restaurants: availableRestaurants
    });
  } catch (err) {
    console.error('Error searching restaurants:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get restaurant details
    const [restaurants] = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id) as reviews_count,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as average_rating
      FROM restaurants r
      WHERE r.id = ?
    `, [id]);
    
    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const restaurant = restaurants[0];
    
    // Get restaurant photos
    const [photos] = await db.query(
      'SELECT * FROM restaurant_photos WHERE restaurant_id = ?',
      [id]
    );
    
    // Get operating hours
    const [operating_hours] = await db.query(
      'SELECT * FROM operating_hours WHERE restaurant_id = ? ORDER BY FIELD(day_of_week, "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")',
      [id]
    );
    
    // Get available tables (simplified)
    const [tables] = await db.query(
      'SELECT * FROM tables WHERE restaurant_id = ?',
      [id]
    );
    
    // Get reviews
    const [reviews] = await db.query(`
      SELECT r.*, u.first_name, u.last_name 
      FROM reviews r
      JOIN users u ON r.customer_id = u.id
      WHERE r.restaurant_id = ?
      ORDER BY r.created_at DESC
      LIMIT 10
    `, [id]);
    
    // Combine all data
    const restaurantData = {
      ...restaurant,
      photos,
      operating_hours,
      tables,
      reviews
    };
    
    res.json({
      success: true,
      restaurant: restaurantData
    });
  } catch (err) {
    console.error('Error fetching restaurant:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create new restaurant
exports.createRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  const {
    name,
    description,
    cuisine_type,
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    phone,
    email,
    website,
    cost_rating,
    latitude,
    longitude,
    operating_hours
  } = req.body;
  
  const manager_id = req.user.id;
  
  // Start a transaction
  const connection = await db.getConnection();
  await connection.beginTransaction();
  
  try {
    // Insert restaurant
    const [result] = await connection.query(
      `INSERT INTO restaurants (
        name, description, cuisine_type, address_line1, address_line2,
        city, state, zip_code, phone, email, website, cost_rating,
        latitude, longitude, manager_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, description, cuisine_type, address_line1, address_line2,
        city, state, zip_code, phone, email, website, cost_rating,
        latitude, longitude, manager_id
      ]
    );
    
    const restaurant_id = result.insertId;
    
    // Insert operating hours
    if (operating_hours && Array.isArray(operating_hours)) {
      for (const hour of operating_hours) {
        await connection.query(
          `INSERT INTO operating_hours (restaurant_id, day_of_week, opening_time, closing_time)
           VALUES (?, ?, ?, ?)`,
          [restaurant_id, hour.day_of_week, hour.opening_time, hour.closing_time]
        );
      }
    }
    
    // Handle uploaded photos if any
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const isPrimary = i === 0; // First image is primary
        
        await connection.query(
          `INSERT INTO restaurant_photos (restaurant_id, photo_url, is_primary)
           VALUES (?, ?, ?)`,
          [restaurant_id, `/uploads/${file.filename}`, isPrimary]
        );
      }
    }
    
    // Commit the transaction
    await connection.commit();
    
    // Get the newly created restaurant
    const [restaurants] = await db.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [restaurant_id]
    );
    
    res.status(201).json({
      success: true,
      message: 'Restaurant created successfully',
      restaurant: restaurants[0]
    });
  } catch (err) {
    // Rollback in case of error
    await connection.rollback();
    console.error('Error creating restaurant:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  } finally {
    connection.release();
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  
  const { id } = req.params;
  const manager_id = req.user.id;
  
  // First check if the restaurant exists and belongs to the manager
  try {
    const [restaurants] = await db.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );
    
    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const restaurant = restaurants[0];
    
    // Only the manager or admin can update the restaurant
    if (restaurant.manager_id !== manager_id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this restaurant'
      });
    }
    
    // Process update
    const {
      name,
      description,
      cuisine_type,
      address_line1,
      address_line2,
      city,
      state,
      zip_code,
      phone,
      email,
      website,
      cost_rating,
      latitude,
      longitude,
      operating_hours
    } = req.body;
    
    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update restaurant details
      await connection.query(
        `UPDATE restaurants SET
          name = ?, description = ?, cuisine_type = ?, address_line1 = ?,
          address_line2 = ?, city = ?, state = ?, zip_code = ?, phone = ?,
          email = ?, website = ?, cost_rating = ?, latitude = ?, longitude = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [
          name, description, cuisine_type, address_line1,
          address_line2, city, state, zip_code, phone,
          email, website, cost_rating, latitude, longitude,
          id
        ]
      );
      
      // Update operating hours if provided
      if (operating_hours && Array.isArray(operating_hours)) {
        // Delete existing hours
        await connection.query(
          'DELETE FROM operating_hours WHERE restaurant_id = ?',
          [id]
        );
        
        // Insert new hours
        for (const hour of operating_hours) {
          await connection.query(
            `INSERT INTO operating_hours (restaurant_id, day_of_week, opening_time, closing_time)
             VALUES (?, ?, ?, ?)`,
            [id, hour.day_of_week, hour.opening_time, hour.closing_time]
          );
        }
      }
      
      // Handle uploaded photos if any
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const isPrimary = i === 0 && req.body.makeFirstImagePrimary === 'true';
          
          // If making this image primary, update other images
          if (isPrimary) {
            await connection.query(
              'UPDATE restaurant_photos SET is_primary = 0 WHERE restaurant_id = ?',
              [id]
            );
          }
          
          await connection.query(
            `INSERT INTO restaurant_photos (restaurant_id, photo_url, is_primary)
             VALUES (?, ?, ?)`,
            [id, `/uploads/${file.filename}`, isPrimary]
          );
        }
      }
      
      // Commit the transaction
      await connection.commit();
      
      // Get the updated restaurant
      const [updatedRestaurants] = await db.query(
        'SELECT * FROM restaurants WHERE id = ?',
        [id]
      );
      
      res.json({
        success: true,
        message: 'Restaurant updated successfully',
        restaurant: updatedRestaurants[0]
      });
    } catch (err) {
      // Rollback in case of error
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error updating restaurant:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete restaurant (admin only)
exports.deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if restaurant exists
    const [restaurants] = await db.query(
      'SELECT * FROM restaurants WHERE id = ?',
      [id]
    );
    
    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    // Get photos to delete files
    const [photos] = await db.query(
      'SELECT photo_url FROM restaurant_photos WHERE restaurant_id = ?',
      [id]
    );
    
    // Start a transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete restaurant and related data (cascading will handle foreign keys)
      await connection.query('DELETE FROM restaurants WHERE id = ?', [id]);
      
      // Commit the transaction
      await connection.commit();
      
      // Delete photo files from the uploads directory
      photos.forEach(photo => {
        const photoPath = path.join(__dirname, '..', photo.photo_url);
        if (fs.existsSync(photoPath)) {
          fs.unlinkSync(photoPath);
        }
      });
      
      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (err) {
      // Rollback in case of error
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting restaurant:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Approve restaurant (admin only)
exports.approveRestaurant = async (req, res) => {
  const { id } = req.params;
  
  try {
    // Check if restaurant exists
    const [restaurants] = await db.query(
      'SELECT r.*, u.email, u.first_name, u.last_name FROM restaurants r JOIN users u ON r.manager_id = u.id WHERE r.id = ?',
      [id]
    );
    
    if (restaurants.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }
    
    const restaurant = restaurants[0];
    
    // Update restaurant approval status
    await db.query(
      'UPDATE restaurants SET is_approved = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    
    // Send approval notification email to restaurant manager
    try {
      await emailSender.sendRestaurantApprovalNotification(restaurant, {
        email: restaurant.email,
        first_name: restaurant.first_name,
        last_name: restaurant.last_name
      });
    } catch (emailErr) {
      console.error('Error sending approval email:', emailErr.message);
      // Continue despite email error
    }
    
    res.json({
      success: true,
      message: 'Restaurant approved successfully'
    });
  } catch (err) {
    console.error('Error approving restaurant:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get restaurant by manager ID
exports.getRestaurantsByManager = async (req, res) => {
  const manager_id = req.user.id;
  
  try {
    const [restaurants] = await db.query(`
      SELECT r.*, 
        (SELECT COUNT(*) FROM reviews WHERE restaurant_id = r.id) as reviews_count,
        (SELECT AVG(rating) FROM reviews WHERE restaurant_id = r.id) as average_rating,
        (SELECT photo_url FROM restaurant_photos WHERE restaurant_id = r.id AND is_primary = 1 LIMIT 1) as primary_photo
      FROM restaurants r
      WHERE r.manager_id = ?
      ORDER BY r.name
    `, [manager_id]);
    
    res.json({
      success: true,
      restaurants
    });
  } catch (err) {
    console.error('Error fetching manager restaurants:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get pending restaurant approvals (admin only)
exports.getPendingRestaurants = async (req, res) => {
  try {
    const [restaurants] = await db.query(`
      SELECT r.*, u.first_name, u.last_name, u.email,
        (SELECT photo_url FROM restaurant_photos WHERE restaurant_id = r.id AND is_primary = 1 LIMIT 1) as primary_photo
      FROM restaurants r
      JOIN users u ON r.manager_id = u.id
      WHERE r.is_approved = 0
      ORDER BY r.created_at DESC
    `);
    
    res.json({
      success: true,
      restaurants
    });
  } catch (err) {
    console.error('Error fetching pending restaurants:', err.message);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};