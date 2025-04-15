// src/pages/customer/Search.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  Rating,
  Chip,
  Divider,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Slider,
  InputAdornment
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, parseISO } from 'date-fns';
import { 
  Search as SearchIcon, 
  FilterList as FilterIcon, 
  RestaurantMenu, 
  Star, 
  AttachMoney
} from '@mui/icons-material';

// Mock data for restaurants
const mockRestaurants = [
  {
    id: 1,
    name: 'The Gourmet Kitchen',
    cuisine: 'International',
    rating: 4.8,
    cost_rating: 4,
    address: '123 Main St, Anytown',
    city: 'Anytown',
    state: 'NY',
    zip_code: '10001',
    image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    description: 'Experience fine dining with our award-winning international cuisine in an elegant setting.',
    reviews_count: 248,
    bookings_today: 15,
    available_times: ['18:00', '18:30', '19:30', '20:00', '21:00']
  },
  {
    id: 2,
    name: 'Seaside Delights',
    cuisine: 'Seafood',
    rating: 4.5,
    cost_rating: 3,
    address: '456 Ocean Blvd, Beachtown',
    city: 'Beachtown',
    state: 'CA',
    zip_code: '90210',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
    description: 'Fresh seafood prepared with passion, offering ocean views and a relaxed atmosphere.',
    reviews_count: 186,
    bookings_today: 8,
    available_times: ['17:30', '18:00', '18:30', '19:00', '20:30']
  },
  {
    id: 3,
    name: 'Bella Italia',
    cuisine: 'Italian',
    rating: 4.7,
    cost_rating: 3,
    address: '789 Pasta Lane, Italyville',
    city: 'Italyville',
    state: 'NJ',
    zip_code: '07001',
    image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    description: 'Authentic Italian cuisine with homemade pasta and wood-fired pizzas in a cozy setting.',
    reviews_count: 215,
    bookings_today: 12,
    available_times: ['17:00', '18:30', '19:00', '20:00', '21:30']
  },
  {
    id: 4,
    name: 'Spice Route',
    cuisine: 'Indian',
    rating: 4.6,
    cost_rating: 2,
    address: '101 Curry St, Spicetown',
    city: 'Spicetown',
    state: 'TX',
    zip_code: '77001',
    image_url: 'https://images.unsplash.com/photo-1505253758473-96b7015fcd40',
    description: 'A culinary journey through India with aromatic spices and traditional recipes.',
    reviews_count: 178,
    bookings_today: 7,
    available_times: ['18:00', '19:00', '19:30', '20:30', '21:00']
  },
  {
    id: 5,
    name: 'Sushi Master',
    cuisine: 'Japanese',
    rating: 4.9,
    cost_rating: 4,
    address: '202 Sakura Ave, Nipponville',
    city: 'Nipponville',
    state: 'WA',
    zip_code: '98001',
    image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754',
    description: 'Expertly crafted sushi and traditional Japanese dishes in an authentic setting.',
    reviews_count: 320,
    bookings_today: 18,
    available_times: ['17:30', '18:00', '19:00', '20:00', '21:30']
  }
];

const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  // Parse and set initial search parameters from URL
  const initialSearchParams = {
    date: queryParams.get('date') ? new Date(queryParams.get('date')) : new Date(),
    time: queryParams.get('time') ? new Date(`2000-01-01T${queryParams.get('time')}`) : new Date(),
    partySize: parseInt(queryParams.get('partySize')) || 2,
    location: queryParams.get('location') || ''
  };
  
  // State for search parameters
  const [searchParams, setSearchParams] = useState(initialSearchParams);
  
  // State for filter options
  const [filters, setFilters] = useState({
    cuisines: [],
    rating: 0,
    priceRange: [1, 5],
    showFilters: false
  });
  
  // State for search results
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Cuisine options for filter
  const cuisineOptions = ['Italian', 'Chinese', 'Japanese', 'Indian', 'Mexican', 'American', 'French', 'Seafood', 'International'];
  
  // Fetch restaurants on component mount or when search params change
  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      
      // In a real application, this would be an API call with the search parameters
      // For now, we'll use a setTimeout to simulate an API call with mock data
      setTimeout(() => {
        // Filter mock data based on search parameters and filters
        const filteredRestaurants = mockRestaurants.filter(restaurant => {
          // Apply cuisine filter if any cuisines are selected
          if (filters.cuisines.length > 0 && !filters.cuisines.includes(restaurant.cuisine)) {
            return false;
          }
          
          // Apply rating filter
          if (restaurant.rating < filters.rating) {
            return false;
          }
          
          // Apply price range filter
          if (restaurant.cost_rating < filters.priceRange[0] || restaurant.cost_rating > filters.priceRange[1]) {
            return false;
          }
          
          // Apply location filter if provided
          if (searchParams.location && 
              !(restaurant.city.toLowerCase().includes(searchParams.location.toLowerCase()) || 
                restaurant.zip_code.includes(searchParams.location))) {
            return false;
          }
          
          return true;
        });
        
        setRestaurants(filteredRestaurants);
        setLoading(false);
      }, 1000);
    };
    
    fetchRestaurants();
  }, [searchParams, filters]);
  
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
    
    // Update URL parameters
    const formattedDate = format(searchParams.date, 'yyyy-MM-dd');
    const formattedTime = format(searchParams.time, 'HH:mm');
    
    navigate(
      `/search?date=${formattedDate}&time=${formattedTime}&partySize=${searchParams.partySize}&location=${encodeURIComponent(searchParams.location)}`,
      { replace: true }
    );
  };
  
  // Toggle cuisine filter
  const handleCuisineToggle = (cuisine) => {
    const currentCuisines = [...filters.cuisines];
    const cuisineIndex = currentCuisines.indexOf(cuisine);
    
    if (cuisineIndex === -1) {
      currentCuisines.push(cuisine);
    } else {
      currentCuisines.splice(cuisineIndex, 1);
    }
    
    setFilters({
      ...filters,
      cuisines: currentCuisines
    });
  };
  
  // Handle rating filter change
  const handleRatingChange = (event, newValue) => {
    setFilters({
      ...filters,
      rating: newValue
    });
  };
  
  // Handle price range filter change
  const handlePriceRangeChange = (event, newValue) => {
    setFilters({
      ...filters,
      priceRange: newValue
    });
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilters({
      ...filters,
      cuisines: [],
      rating: 0,
      priceRange: [1, 5]
    });
  };
  
  // Toggle filter panel visibility
  const toggleFilters = () => {
    setFilters({
      ...filters,
      showFilters: !filters.showFilters
    });
  };
  
  // Generate dollar signs for cost rating
  const getCostRating = (rating) => {
    return '₹'.repeat(rating);
  };
  
  // Handle reservation time selection
  const handleTimeSelection = (restaurantId, time) => {
    const formattedDate = format(searchParams.date, 'yyyy-MM-dd');
    navigate(`/restaurant/${restaurantId}?date=${formattedDate}&time=${time}&partySize=${searchParams.partySize}`);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find Available Restaurants
      </Typography>
      
      {/* Search Form */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box component="form" onSubmit={handleSearch} noValidate>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2.5}>
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
            
            <Grid item xs={12} sm={6} md={2.5}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{ height: '56px', flexGrow: 1 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={toggleFilters}
                  sx={{ height: '56px' }}
                >
                  <FilterIcon />
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {/* Filters Section */}
          {filters.showFilters && (
            <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
              <Grid container spacing={3}>
                {/* Cuisine Filters */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Cuisine
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {cuisineOptions.map((cuisine) => (
                      <Chip
                        key={cuisine}
                        label={cuisine}
                        onClick={() => handleCuisineToggle(cuisine)}
                        color={filters.cuisines.includes(cuisine) ? 'primary' : 'default'}
                        variant={filters.cuisines.includes(cuisine) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Grid>
                
                {/* Rating Filter */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Minimum Rating
                  </Typography>
                  <Box sx={{ width: '100%', px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 2 }}>
                        <Rating
                          value={filters.rating}
                          precision={0.5}
                          onChange={handleRatingChange}
                        />
                      </Box>
                      <Typography>
                        {filters.rating > 0 ? `${filters.rating}+` : 'Any'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                {/* Price Range Filter */}
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle1" gutterBottom>
                    Price Range
                  </Typography>
                  <Box sx={{ width: '100%', px: 2 }}>
                    <Slider
                      value={filters.priceRange}
                      onChange={handlePriceRangeChange}
                      valueLabelDisplay="auto"
                      min={1}
                      max={5}
                      marks={[
                        { value: 1, label: '₹' },
                        { value: 2, label: '₹₹' },
                        { value: 3, label: '₹₹₹' },
                        { value: 4, label: '₹₹₹₹' },
                        { value: 5, label: '₹₹₹₹₹' }
                      ]}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={resetFilters} sx={{ mr: 1 }}>
                  Reset Filters
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
      
      {/* Results Section */}
      <Typography variant="h5" gutterBottom>
        {loading ? 'Searching...' : `${restaurants.length} restaurants available`}
      </Typography>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : restaurants.length > 0 ? (
        <Grid container spacing={3}>
          {restaurants.map((restaurant) => (
            <Grid item key={restaurant.id} xs={12}>
              <Card sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                <CardMedia
                  component="img"
                  sx={{ 
                    width: { xs: '100%', sm: 200 },
                    height: { xs: 200, sm: 'auto' }
                  }}
                  image={restaurant.image_url}
                  alt={restaurant.name}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <CardContent>
                    <Typography variant="h5" component="h2">
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
                        {restaurant.rating} ({restaurant.reviews_count} reviews)
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {restaurant.cuisine} • {getCostRating(restaurant.cost_rating)}
                    </Typography>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zip_code}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Booked {restaurant.bookings_today} times today
                    </Typography>
                    
                    <Typography variant="body2">
                      {restaurant.description}
                    </Typography>
                  </CardContent>
                  
                  <Box sx={{ 
                    mt: 'auto', 
                    p: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: { xs: 'center', md: 'flex-start' }
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Available times for {searchParams.partySize} {searchParams.partySize === 1 ? 'person' : 'people'}:
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      {restaurant.available_times.map((time) => (
                        <Button
                          key={time}
                          variant="outlined"
                          size="small"
                          className="time-button"
                          onClick={() => handleTimeSelection(restaurant.id, time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', my: 4 }}>
          <Typography variant="h6" paragraph>
            No restaurants found matching your criteria.
          </Typography>
          <Typography variant="body1">
            Try adjusting your search filters or location to find more options.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default Search;