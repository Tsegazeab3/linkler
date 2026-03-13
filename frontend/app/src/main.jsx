import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import LandingPage from './pages/LandingPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import ProfileCompletionPage from './pages/ProfileCompletionPage.jsx';
import IndexPage from './pages/IndexPage.jsx';
import FellowTravelersPage from './pages/FellowTravelersPage.jsx';
import NewGuidesPage from './pages/NewGuidesPage.jsx';
import GuideDetailPage from './pages/GuideDetailPage.jsx';
import PostDetailPage from './pages/PostDetailPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx';
import CreateTripPage from './pages/CreateTripPage.jsx';
import CreateExperiencePage from './pages/CreateExperiencePage.jsx';
import CreatePromotionPage from './pages/CreatePromotionPage.jsx';
import PromotionsPage from './pages/PromotionsPage.jsx';
import PromotionDetailPage from './pages/PromotionDetailPage.jsx';
import ChatPage from './pages/ChatPage.jsx';
import MessagesPage from './pages/MessagesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import CreatePostModal from './components/CreatePostModal.jsx';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthGuard from './components/AuthGuard';

function NotFound() {
  return <h1>404 - Not Found</h1>;
}

// Logic to handle the root path based on auth status
function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null; // Or a loading spinner
  
  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }
  
  return <LandingPage />;
}

// This is the key component that will manage the routing logic
function AppRouter() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/complete-profile" element={<AuthGuard><ProfileCompletionPage /></AuthGuard>} />
        
        {/* Protected App Routes */}
        <Route path="/app" element={<AuthGuard><App /></AuthGuard>}>
          <Route index element={<IndexPage />} />
          <Route path="travelers" element={<FellowTravelersPage />} />
          <Route path="guides" element={<NewGuidesPage />} />
          <Route path="guides/:id" element={<GuideDetailPage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          <Route path="profile/:userId" element={<UserProfilePage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="promotions/:id" element={<PromotionDetailPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="/chat/:conversationId" element={<AuthGuard><ChatPage /></AuthGuard>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>

      {background && (
        <Routes>
          <Route path="/app/posts/:postId" element={<AuthGuard><PostDetailPage /></AuthGuard>} />
          <Route path="/create" element={<AuthGuard><CreatePostModal /></AuthGuard>} />
          <Route path="/create-trip" element={<AuthGuard><CreateTripPage /></AuthGuard>} />
          <Route path="/create-service" element={<AuthGuard><CreateExperiencePage /></AuthGuard>} />
          <Route path="/create-promotion" element={<AuthGuard><CreatePromotionPage /></AuthGuard>} />
        </Routes>
      )}
    </>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRouter />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
