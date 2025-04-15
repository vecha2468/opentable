// src/services/restaurantService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to handle API errors
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with an error status
    return {
      success: false,
      message: error.response.data.message || 'An error occurred',
      errors: error.response.data.errors
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      success: false,
      message: 'No response from server. Please check your internet connection.'
    };
  } else {
    // Something happened in setting up the request
    return {
      success: false,
      message: error.message || 'An unknown error occurred'
    };
  }
};

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    const response = await axios.get(`${API_URL}/restaurants`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Search restaurants by criteria
export const searchRestaurants = async (params) => {
  try {
    const response = await axios.get(`${API_URL}/restaurants/search`, { params });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/restaurants/${id}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Create a new restaurant (for restaurant managers)
export const createRestaurant = async (restaurantData, token) => {
  try {
    // Create FormData for handling file uploads
    const formData = new FormData();
    
    // Add basic restaurant data
    Object.keys(restaurantData).forEach(key => {
      if (key !== 'photos' && key !== 'operating_hours') {
        formData.append(key, restaurantData[key]);
      }
    });
    
    // Add operating hours as JSON string
    if (restaurantData.operating_hours && Array.isArray(restaurantData.operating_hours)) {
      formData.append('operating_hours', JSON.stringify(restaurantData.operating_hours));
    }
    
    // Add photos
    if (restaurantData.photos && restaurantData.photos.length > 0) {
      for (let i = 0; i < restaurantData.photos.length; i++) {
        formData.append('photos', restaurantData.photos[i]);
      }
    }
    
    const response = await axios.post(`${API_URL}/restaurants`, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Update restaurant (for restaurant managers)
export const updateRestaurant = async (id, restaurantData, token) => {
  try {
    // Create FormData for handling file uploads
    const formData = new FormData();
    
    // Add basic restaurant data
    Object.keys(restaurantData).forEach(key => {
      if (key !== 'photos' && key !== 'operating_hours') {
        formData.append(key, restaurantData[key]);
      }
    });
    
    // Add operating hours as JSON string
    if (restaurantData.operating_hours && Array.isArray(restaurantData.operating_hours)) {
      formData.append('operating_hours', JSON.stringify(restaurantData.operating_hours));
    }
    
    // Add photos
    if (restaurantData.photos && restaurantData.photos.length > 0) {
      for (let i = 0; i < restaurantData.photos.length; i++) {
        formData.append('photos', restaurantData.photos[i]);
      }
    }
    
    // Add flag for making first image primary
    if (restaurantData.makeFirstImagePrimary) {
      formData.append('makeFirstImagePrimary', 'true');
    }
    
    const response = await axios.put(`${API_URL}/restaurants/${id}`, formData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Delete restaurant (for admins)
export const deleteRestaurant = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/restaurants/${id}`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get restaurant reviews
export const getRestaurantReviews = async (restaurantId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/restaurant/${restaurantId}`);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get restaurant manager's restaurants
export const getManagerRestaurants = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/restaurants/manager/list`, {
      headers: {
        'x-auth-token': token
      }
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Check restaurant availability
export const checkAvailability = async (restaurantId, date, time, partySize) => {
  try {
    const response = await axios.get(`${API_URL}/reservations/availability`, {
      params: {
        restaurant_id: restaurantId,
        date,
        time, 
        party_size: partySize
      }
    });
    
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

export default {
  getAllRestaurants,
  searchRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantReviews,
  getManagerRestaurants,
  checkAvailability
};