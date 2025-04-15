// src/pages/customer/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CardActions,
  Paper,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Rating
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format } from 'date-fns';
import { Search as SearchIcon } from '@mui/icons-material';

const Home = () => {
  const navigate = useNavigate();
  
  // Search form state
  const [searchParams, setSearchParams] = useState({
    date: new Date(),
    time: new Date(),
    partySize: 2,
    location: ''
  });
  
  // Featured restaurants (mockup data)
  const featuredRestaurants = [
    {
      id: 1,
      name: 'The Gourmet Kitchen',
      cuisine: 'International',
      rating: 4.8,
      costRating: 4,
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      description: 'Experience fine dining with our award-winning international cuisine in an elegant setting.'
    },
    {
      id: 2,
      name: 'Seaside Delights',
      cuisine: 'Seafood',
      rating: 4.5,
      costRating: 3,
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
      description: 'Fresh seafood prepared with passion, offering ocean views and a relaxed atmosphere.'
    },
    {
      id: 3,
      name: 'Bella Italia',
      cuisine: 'Italian',
      rating: 4.7,
      costRating: 3,
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
      description: 'Authentic Italian cuisine with homemade pasta and wood-fired pizzas in a cozy setting.'
    },
    {
      id: 4,
      name: 'Spice Route',
      cuisine: 'Indian',
      rating: 4.6,
      costRating: 2,
      image: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40',
      description: 'A culinary journey through India with aromatic spices and traditional recipes.'
    }
  ];
  
  // Handle search form input changes
  const handleInputChange = (field, value) => {
    setSearchParams({
      ...searchParams,
      [field]: value
    });
  };
  
  // Handle search form submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Format date and time for URL parameters
    const formattedDate = format(searchParams.date, 'yyyy-MM-dd');
    const formattedTime = format(searchParams.time, 'HH:mm');
    
    // Navigate to search page with parameters
    navigate(`/search?date=${formattedDate}&time=${formattedTime}&partySize=${searchParams.partySize}&location=${encodeURIComponent(searchParams.location)}`);
  };
  
  // Generate dollar signs for cost rating
  const getCostRating = (rating) => {
    return '₹'.repeat(rating);
  };
  
  return (
    <>
      {/* Hero Section */}
      <Box className="hero-section">
        <Container maxWidth="md" className="hero-content">
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Perfect Dining Experience
          </Typography>
          <Typography variant="h5" paragraph>
            Discover and book the best restaurants in your area
          </Typography>
          
          {/* Search Form */}
          <Paper elevation={3} className="search-container">
            <Box component="form" onSubmit={handleSearch} noValidate>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={searchParams.date}
                      onChange={(newValue) => handleInputChange('date', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      minDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <TimePicker
                      label="Time"
                      value={searchParams.time}
                      onChange={(newValue) => handleInputChange('time', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                    />
                  </LocalizationProvider>
                </Grid>
                
                <Grid item xs={12} sm={6} md={2}>
                  <FormControl fullWidth required>
                    <InputLabel id="party-size-label">Party Size</InputLabel>
                    <Select
                      labelId="party-size-label"
                      id="party-size"
                      value={searchParams.partySize}
                      label="Party Size"
                      onChange={(e) => handleInputChange('partySize', e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <MenuItem key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</MenuItem>
                      ))}
                      <MenuItem value={11}>More than 10</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    id="location"
                    label="City or Zip Code"
                    name="location"
                    value={searchParams.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={1}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<SearchIcon />}
                    sx={{ height: '56px' }}
                  >
                    Find
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Container>
      </Box>
      
      {/* Featured Restaurants Section */}
      <Container maxWidth="lg" sx={{ mt: 8, mb: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Featured Restaurants
        </Typography>
        <Typography variant="subtitle1" paragraph align="center" sx={{ mb: 4 }}>
          Discover our most popular dining destinations
        </Typography>
        
        <Grid container spacing={4}>
          {featuredRestaurants.map((restaurant) => (
            <Grid item key={restaurant.id} xs={12} sm={6} md={3}>
              <Card className="restaurant-card" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={restaurant.image}
                  alt={restaurant.name}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {restaurant.name}
                  </Typography>
                  
                  <Box display="flex" alignItems="center" sx={{ mb: 1 }}>
                    <Rating 
                      value={restaurant.rating} 
                      precision={0.1} 
                      readOnly 
                      size="small" 
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {restaurant.rating}
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {restaurant.cuisine} • {getCostRating(restaurant.costRating)}
                  </Typography>
                  
                  <Typography variant="body2" paragraph>
                    {restaurant.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      
      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" gutterBottom align="center">
            How It Works
          </Typography>
          
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  1. Search
                </Typography>
                <Typography>
                  Find restaurants by location, date, time, and party size
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  2. Choose
                </Typography>
                <Typography>
                  Browse restaurant details, menus, and reviews
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Typography variant="h5" gutterBottom>
                  3. Book
                </Typography>
                <Typography>
                  Reserve your table with instant confirmation
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Call to Action Section */}
      <Container maxWidth="md" sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Are You a Restaurant Owner?
        </Typography>
        <Typography variant="body1" paragraph>
          Join our platform to increase your visibility and streamline your reservation process.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          onClick={() => navigate('/register')}
          sx={{ mt: 2 }}
        >
          Register Your Restaurant
        </Button>
      </Container>
    </>
  );
};

export default Home;