// src/services/restaurantService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Handle errors consistently
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
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
    // Something happened in setting up the request that triggered an Error
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
    const response = await axios.post(`${API_URL}/restaurants`, restaurantData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'  // For uploading images
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
    const response = await axios.put(`${API_URL}/restaurants/${id}`, restaurantData, {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'multipart/form-data'  // For uploading images
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

// Submit a restaurant review
export const submitReview = async (reviewData, token) => {
  try {
    const response = await axios.post(`${API_URL}/reviews`, reviewData, {
      headers: {
        'x-auth-token': token
      }
    });
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Get restaurant manager's restaurants
export const getManagerRestaurants = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/restaurants/manager`, {
      headers: {
        'x-auth-token': token
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
  submitReview,
  getManagerRestaurants
};