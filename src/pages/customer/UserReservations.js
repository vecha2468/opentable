// src/pages/customer/UserReservations.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Tabs, 
  Tab, 
  Divider, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  Chip,
  Alert,
  CardMedia
} from '@mui/material';
import { 
  Restaurant, 
  LocationOn, 
  AccessTime, 
  Event, 
  Person, 
  Cancel
} from '@mui/icons-material';
import { format, parseISO, isPast } from 'date-fns';
import AuthContext from '../../context/AuthContext';

// Mock reservations data
const mockReservations = [
  {
    id: 1,
    restaurant_id: 1,
    restaurant_name: 'The Gourmet Kitchen',
    restaurant_image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    reservation_date: '2025-04-10',
    reservation_time: '19:30',
    party_size: 4,
    status: 'confirmed',
    special_request: 'Window seating if possible',
    created_at: '2025-04-01T12:30:00.000Z'
  },
  {
    id: 2,
    restaurant_id: 3,
    restaurant_name: 'Bella Italia',
    restaurant_image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    reservation_date: '2025-04-20',
    reservation_time: '20:00',
    party_size: 2,
    status: 'pending',
    special_request: '',
    created_at: '2025-04-02T10:15:00.000Z'
  },
  {
    id: 3,
    restaurant_id: 2,
    restaurant_name: 'Seaside Delights',
    restaurant_image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
    reservation_date: '2025-03-15',
    reservation_time: '18:30',
    party_size: 6,
    status: 'completed',
    special_request: 'Birthday celebration - please prepare a cake',
    created_at: '2025-03-10T09:20:00.000Z'
  },
  {
    id: 4,
    restaurant_id: 5,
    restaurant_name: 'Sushi Master',
    restaurant_image: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
    reservation_date: '2025-03-05',
    reservation_time: '19:00',
    party_size: 3,
    status: 'cancelled',
    special_request: '',
    created_at: '2025-02-28T14:45:00.000Z'
  }
]