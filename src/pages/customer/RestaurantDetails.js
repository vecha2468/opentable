// src/pages/customer/RestaurantDetails.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  Paper, 
  Tabs, 
  Tab, 
  Divider, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Rating,
  CircularProgress,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar
} from '@mui/material';
import { 
  LocationOn, 
  Phone, 
  Language, 
  AccessTime, 
  EventAvailable, 
  RestaurantMenu, 
  Info,
  Event,
  Person,
  Message
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { format, addDays, parse, isAfter, isBefore, parseISO } from 'date-fns';
import AuthContext from '../../context/AuthContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

// Mock restaurant data for development
const mockRestaurant = {
  id: 1,
  name: 'The Gourmet Kitchen',
  description: 'Experience fine dining with our award-winning international cuisine in an elegant setting.',
  cuisine_type: 'International',
  cost_rating: 4,
  rating: 4.8,
  reviews_count: 248,
  address_line1: '123 Main St',
  address_line2: 'Suite 101',
  city: 'Anytown',
  state: 'NY',
  zip_code: '10001',
  phone: '(555) 123-4567',
  email: 'info@gourmetkitchen.com',
  website: 'https://gourmetkitchen.example.com',
  latitude: 40.712776,
  longitude: -74.005974,
  manager_id: 2,
  created_at: '2022-01-01T00:00:00.000Z',
  updated_at: '2022-06-01T00:00:00.000Z',
  is_approved: true,
  photos: [
    {
      id: 1,
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
      is_primary: true
    },
    {
      id: 2,
      url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
      is_primary: false
    },
    {
      id: 3,
      url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
      is_primary: false
    }
  ],
  operating_hours: [
    { day_of_week: 'Monday', opening_time: '11:00', closing_time: '22:00' },
    { day_of_week: 'Tuesday', opening_time: '11:00', closing_time: '22:00' },
    { day_of_week: 'Wednesday', opening_time: '11:00', closing_time: '22:00' },
    { day_of_week: 'Thursday', opening_time: '11:00', closing_time: '23:00' },
    { day_of_week: 'Friday', opening_time: '11:00', closing_time: '23:00' },
    { day_of_week: 'Saturday', opening_time: '12:00', closing_time: '23:00' },
    { day_of_week: 'Sunday', opening_time: '12:00', closing_time: '21:00' }
  ],
  available_times: [
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'
  ],
  reviews: [
    {
      id: 1,
      customer_id: 3,
      customer_name: 'John Smith',
      rating: 5,
      comment: 'Absolutely amazing experience! The food was exquisite and the service impeccable.',
      created_at: '2022-05-15T14:30:00.000Z'
    },
    {
      id: 2,
      customer_id: 4,
      customer_name: 'Emma Johnson',
      rating: 4,
      comment: 'Great food and ambiance. Slightly pricey but worth it for a special occasion.',
      created_at: '2022-04-22T19:15:00.000Z'
    },
    {
      id: 3,
      customer_id: 5,
      customer_name: 'Michael Brown',
      rating: 5,
      comment: 'One of the best dining experiences I have. Will definitely return!',
      created_at: '2022-03-10T20:45:00.000Z'
    }
  ]
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`restaurant-tabpanel-${index}`}
      aria-labelledby={`restaurant-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const RestaurantDetails = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  const queryParams = new URLSearchParams(location.search);
  
  // State for restaurant data
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for reservation
  const [reservationParams, setReservationParams] = useState({
    date: queryParams.get('date') ? new Date(queryParams.get('date')) : new Date(),
    time: queryParams.get('time') 
      ? parse(queryParams.get('time'), 'HH:mm', new Date()) 
      : new Date(),
    partySize: parseInt(queryParams.get('partySize')) || 2,
    specialRequest: ''
  });
  
  // State for reservation confirmation dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [reservationSubmitting, setReservationSubmitting] = useState(false);
  
  // State for review form
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    comment: ''
  });
  
  // Fetch restaurant data on component mount
  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      
      // In a real application, this would be an API call with the restaurant ID
      // For now, we'll use a setTimeout to simulate an API call with mock data
      setTimeout(() => {
        setRestaurant(mockRestaurant);
        setLoading(false);
      }, 1000);
    };
    
    fetchRestaurant();
  }, [id]);
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle reservation form changes
  const handleReservationChange = (field, value) => {
    setReservationParams({
      ...reservationParams,
      [field]: value
    });
  };
  
  // Handle reservation form submission
  const handleReservationSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please log in to make a reservation'
        } 
      });
      return;
    }
    
    // Open confirmation dialog
    setOpenDialog(true);
  };
  
  // Handle reservation confirmation
  const handleReservationConfirm = async () => {
    setReservationSubmitting(true);
    
    // In a real application, this would be an API call to create the reservation
    // For now, we'll use a setTimeout to simulate an API call
    setTimeout(() => {
      setReservationSubmitting(false);
      setOpenDialog(false);
      
      // Navigate to the reservations page
      navigate('/reservations', { 
        state: { 
          message: 'Reservation confirmed successfully!' 
        } 
      });
    }, 1500);
  };
  
  // Handle dialog close
  const handleDialogClose = () => {
    setOpenDialog(false);
  };
  
  // Handle review form changes
  const handleReviewChange = (field, value) => {
    setReviewForm({
      ...reviewForm,
      [field]: value
    });
  };
  
  // Handle review form submission
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location.pathname,
          message: 'Please log in to leave a review'
        } 
      });
      return;
    }
    
    // In a real application, this would be an API call to submit the review
    console.log('Review submitted:', reviewForm);
    
    // Reset form
    setReviewForm({
      rating: 0,
      comment: ''
    });
    
    // Show success message
    alert('Review submitted successfully!');
  };
  
  // Generate dollar signs for cost rating
  const getCostRating = (rating) => {
    return '₹'.repeat(rating);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMMM d, yyyy');
  };
  
  // Map container style
  const mapContainerStyle = {
    width: '100%',
    height: '300px'
  };
  
  // If loading, show loading indicator
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // If restaurant not found, show error message
  if (!restaurant) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Restaurant Not Found
          </Typography>
          <Typography paragraph>
            The restaurant you are looking for does not exist or has been removed.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/search')}
          >
            Search Restaurants
          </Button>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      {/* Restaurant Header */}
      <Box className="restaurant-header">
        <Typography variant="h3" component="h1" gutterBottom>
          {restaurant.name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Rating value={restaurant.rating} precision={0.1} readOnly />
            <Typography variant="body2" sx={{ ml: 1 }}>
              {restaurant.rating} ({restaurant.reviews_count} reviews)
            </Typography>
          </Box>
          
          <Chip 
            label={restaurant.cuisine_type} 
            variant="outlined" 
            color="primary" 
            size="small" 
          />
          
          <Typography variant="body2">
            {getCostRating(restaurant.cost_rating)}
          </Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          {restaurant.description}
        </Typography>
      </Box>
      
      {/* Restaurant Photos */}
      <Box className="restaurant-photos" sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {restaurant.photos.map((photo, index) => (
            <Grid item xs={12} sm={index === 0 ? 12 : 6} md={index === 0 ? 8 : 4} key={photo.id}>
              <img 
                src={photo.url} 
                alt={`${restaurant.name} - ${index + 1}`} 
                style={{ 
                  width: '100%', 
                  height: index === 0 ? '400px' : '200px', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }} 
              />
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Tabs Section */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab label="Information" icon={<Info />} iconPosition="start" />
          <Tab label="Reservation" icon={<EventAvailable />} iconPosition="start" />
          <Tab label="Reviews" icon={<Message />} iconPosition="start" />
        </Tabs>
        
        {/* Information Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Location & Contact
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <LocationOn color="primary" sx={{ mr: 2, mt: 0.5 }} />
                  <Typography>
                    {restaurant.address_line1}<br />
                    {restaurant.address_line2 && `${restaurant.address_line2}`}<br />
                    {restaurant.city}, {restaurant.state} {restaurant.zip_code}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone color="primary" sx={{ mr: 2 }} />
                  <Typography>
                    {restaurant.phone}
                  </Typography>
                </Box>
                
                {restaurant.website && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Language color="primary" sx={{ mr: 2 }} />
                    <Typography>
                      <a href={restaurant.website} target="_blank" rel="noopener noreferrer">
                        {restaurant.website.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </Typography>
                  </Box>
                )}
              </Box>
              
              <Typography variant="h6" gutterBottom>
                Hours of Operation
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                {restaurant.operating_hours.map((hours, index) => (
                  <Box 
                    key={hours.day_of_week} 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: index < restaurant.operating_hours.length - 1 ? '1px solid #eee' : 'none'
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {hours.day_of_week}
                    </Typography>
                    <Typography variant="body2">
                      {hours.opening_time} - {hours.closing_time}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              
              <LoadScript
                googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"
              >
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={{
                    lat: restaurant.latitude,
                    lng: restaurant.longitude
                  }}
                  zoom={15}
                >
                  <Marker
                    position={{
                      lat: restaurant.latitude,
                      lng: restaurant.longitude
                    }}
                  />
                </GoogleMap>
              </LoadScript>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Reservation Tab */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Make a Reservation
          </Typography>
          
          <Box component="form" onSubmit={handleReservationSubmit} noValidate className="reservation-form">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date"
                    value={reservationParams.date}
                    onChange={(newValue) => handleReservationChange('date', newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth required />}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
                  />
                </LocalizationProvider>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="time-label">Time</InputLabel>
                  <Select
                    labelId="time-label"
                    id="time"
                    value={format(reservationParams.time, 'HH:mm')}
                    label="Time"
                    onChange={(e) => {
                      const time = parse(e.target.value, 'HH:mm', new Date());
                      handleReservationChange('time', time);
                    }}
                  >
                    {restaurant.available_times.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel id="party-size-label">Party Size</InputLabel>
                  <Select
                    labelId="party-size-label"
                    id="party-size"
                    value={reservationParams.partySize}
                    label="Party Size"
                    onChange={(e) => handleReservationChange('partySize', e.target.value)}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <MenuItem key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</MenuItem>
                    ))}
                    <MenuItem value={11}>More than 10</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="special-request"
                  label="Special Request (Optional)"
                  name="specialRequest"
                  value={reservationParams.specialRequest}
                  onChange={(e) => handleReservationChange('specialRequest', e.target.value)}
                  multiline
                  rows={3}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                >
                  Book Table
                </Button>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
        
        {/* Reviews Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom>
                Customer Reviews
              </Typography>
              
              <List>
                {restaurant.reviews.map((review) => (
                  <ListItem 
                    key={review.id} 
                    alignItems="flex-start"
                    sx={{ 
                      px: 0,
                      borderBottom: '1px solid #eee',
                      mb: 2
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>{review.customer_name.charAt(0)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography component="span" variant="subtitle1">
                            {review.customer_name}
                          </Typography>
                          <Typography component="span" variant="body2" color="text.secondary">
                            {formatDate(review.created_at)}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <>
                          <Rating value={review.rating} size="small" readOnly sx={{ mt: 1, mb: 1 }} />
                          <Typography variant="body2" color="text.primary" paragraph>
                            {review.comment}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Paper elevation={1} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Write a Review
                </Typography>
                
                <Box component="form" onSubmit={handleReviewSubmit} noValidate>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Your Rating
                    </Typography>
                    <Rating
                      name="rating"
                      value={reviewForm.rating}
                      onChange={(event, newValue) => {
                        handleReviewChange('rating', newValue);
                      }}
                      size="large"
                    />
                  </Box>
                  
                  <TextField
                    fullWidth
                    id="review-comment"
                    label="Your Review"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={(e) => handleReviewChange('comment', e.target.value)}
                    multiline
                    rows={5}
                    margin="normal"
                    required
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    disabled={reviewForm.rating === 0 || !reviewForm.comment}
                  >
                    Submit Review
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
      
      {/* Reservation Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="reservation-dialog-title"
      >
        <DialogTitle id="reservation-dialog-title">
          Confirm Reservation
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            Please confirm your reservation details:
          </DialogContentText>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Event color="primary" sx={{ mr: 2 }} />
            <Typography>
              {format(reservationParams.date, 'EEEE, MMMM d, yyyy')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <AccessTime color="primary" sx={{ mr: 2 }} />
            <Typography>
              {format(reservationParams.time, 'h:mm a')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Person color="primary" sx={{ mr: 2 }} />
            <Typography>
              {reservationParams.partySize} {reservationParams.partySize === 1 ? 'person' : 'people'}
            </Typography>
          </Box>
          
          {reservationParams.specialRequest && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Special Request:
              </Typography>
              <Typography variant="body2">
                {reservationParams.specialRequest}
              </Typography>
            </Box>
          )}
          
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              A confirmation will be sent to your email address.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} disabled={reservationSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleReservationConfirm} 
            color="primary" 
            variant="contained"
            disabled={reservationSubmitting}
          >
            {reservationSubmitting ? <CircularProgress size={24} /> : 'Confirm Reservation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RestaurantDetails;