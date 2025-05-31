import './App.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import QuickSearch from './components/QuickSearch';
import CarTypesCarousel from './components/CarTypesCarousel';
import MapSection from './components/MapSection';

import AllOffersPage from './pages/AllOffersPage';
import OfferDetailsPage from './pages/OfferDetailsPage';
import ProfilePage from './pages/ProfilePage';
import CarDetailsPage from './pages/CarDetailsPage';
import BookingPage from './pages/BookingPage';
import ConversationPage from './pages/ConversationPage';
import ConversationListPage from './pages/ConversationListPage';
import CategoriesPage from './pages/CategoriesPage';
import DealsPage from './pages/DealsPage';
import AboutPage from './pages/AboutPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import ReviewsPage from './pages/ReviewsPage';
import AddCarPage from './pages/AddCarPage';
import VerificationPage from './pages/VerificationPage';
import EditProfilePage from './pages/EditProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage'; // Import AdminDashboardPage
import { useAuthContext } from './contexts/AuthContext'; // Import useAuthContext

function App() {
  const { authUser } = useAuthContext(); // Get authUser from context

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

            <Route path="/offers" element={<AllOffersPage />} />
            <Route path="/offer/:offerId" element={<OfferDetailsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
            <Route path="/car-details/:carId" element={<CarDetailsPage />} />
            <Route path="/booking/:carId" element={<BookingPage />} />
            <Route path="/conversation/:carId/:ownerId" element={<ConversationPage />} />
            <Route path="/messages" element={<ConversationListPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/deals" element={<DealsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/add-car" element={<AddCarPage />} />
            <Route path="/verify-email" element={<VerificationPage />} />

            {/* Admin Route */}
            <Route
              path="/admin"
              element={authUser && authUser.role === 'admin' ? <AdminDashboardPage /> : <Navigate to="/" />}
            />
          </Routes>
        </div>
      </BrowserRouter>
    </LocalizationProvider>
  );
}

export default App;
