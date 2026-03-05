import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import LandingPage from './pages/LandingPage.jsx';
import NavPage from './pages/NavPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ProfileCompletionPage from './pages/ProfileCompletionPage.jsx';
import IndexPage from './pages/IndexPage.jsx';
import FellowTravelersPage from './pages/FellowTravelersPage.jsx';
import NewGuidesPage from './pages/NewGuidesPage.jsx';
import GuideDetailPage from './pages/GuideDetailPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import CreateTripPage from './pages/CreateTripPage.jsx';
import PromotionsPage from './pages/PromotionsPage.jsx';
import PromotionDetailPage from './pages/PromotionDetailPage.jsx';
import GroupChatPage from './pages/GroupChatPage.jsx';
import CreatePostModal from './components/CreatePostModal.jsx';

function NotFound() {
  return <h1>404 - Not Found</h1>;
}

// This is the key component that will manage the routing logic
function AppRouter() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<NavPage />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/complete-profile" element={<ProfileCompletionPage />} />
        <Route path="/app" element={<App />}>
          <Route index element={<IndexPage />} />
          <Route path="fellow_travelers" element={<FellowTravelersPage />} />
          <Route path="guides" element={<NewGuidesPage />} />
          <Route path="guides/:id" element={<GuideDetailPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="promotions/:id" element={<PromotionDetailPage />} />
          <Route path="groups/:groupId" element={<GroupChatPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/create" element={<CreatePostModal />} />
          <Route path="/create-trip" element={<CreateTripPage />} />
        </Routes>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  </StrictMode>,
);
