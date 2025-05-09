import './App.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import QuickSearch from './components/QuickSearch';
import CarTypesCarousel from './components/CarTypesCarousel';
import MapSection from './components/MapSection';
import MapPage from './pages/MapPage';
import AllOffersPage from './pages/AllOffersPage';
import OfferDetailsPage from './pages/OfferDetailsPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CarDetailsPage from './pages/CarDetailsPage'; // Import the CarDetailsPage component
import BookingPage from './pages/BookingPage'; // Import the BookingPage component
import MyBookingsPage from './pages/MyBookingsPage'; // Import the MyBookingsPage component
import OwnerBookingsPage from './pages/OwnerBookingsPage'; // Import the OwnerBookingsPage component

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/" element={
              <>
                <Navbar sx={{ backgroundColor: '#111', color: '#fff' }} iconColor="#fff" />
                <QuickSearch />
                <CarTypesCarousel />
                <MapSection />
              </>
            } />
            <Route path="/map/:wilaya" element={<MapPage />} />
            <Route path="/offers" element={<AllOffersPage />} />
            <Route path="/offer/:offerId" element={<OfferDetailsPage />} />
            <Route path="/chat/:posterName" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/car-details/:carId" element={<CarDetailsPage />} /> {/* Add route for CarDetailsPage */}
            <Route path="/booking/:carId" element={<BookingPage />} /> {/* Add route for BookingPage */}
            <Route path="/my-bookings" element={<MyBookingsPage />} /> {/* Add route for MyBookingsPage */}
            <Route path="/owner-bookings" element={<OwnerBookingsPage />} /> {/* Add route for OwnerBookingsPage */}
          </Routes>
        </div>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
