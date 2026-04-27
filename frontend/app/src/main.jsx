import { StrictMode, lazy, Suspense } from 'react';
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

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const SignInPage = lazy(() => import('./pages/SignInPage.jsx'));
const SignUpPage = lazy(() => import('./pages/SignUpPage.jsx'));
const ProfileCompletionPage = lazy(() => import('./pages/ProfileCompletionPage.jsx'));
const IndexPage = lazy(() => import('./pages/IndexPage.jsx'));
const FellowTravelersPage = lazy(() => import('./pages/FellowTravelersPage.jsx'));
const ExperiencesPage = lazy(() => import('./pages/ExperiencesPage.jsx'));
const EssentialsPage = lazy(() => import('./pages/EssentialsPage.jsx'));
const ExperienceDetailPage = lazy(() => import('./pages/ExperienceDetailPage.jsx'));
const BookingsPage = lazy(() => import('./pages/BookingsPage.jsx'));
const GuideDetailPage = lazy(() => import('./pages/GuideDetailPage.jsx'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage.jsx'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage.jsx'));
const CreateTripPage = lazy(() => import('./pages/CreateTripPage.jsx'));
const CreateExperiencePage = lazy(() => import('./pages/CreateExperiencePage.jsx'));
const CreatePromotionPage = lazy(() => import('./pages/CreatePromotionPage.jsx'));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage.jsx'));
const PromotionDetailPage = lazy(() => import('./pages/PromotionDetailPage'));
const GuideDashboardPage = lazy(() => import('./pages/GuideDashboardPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const TravelerOnboardingPage = lazy(() => import('./pages/TravelerOnboardingPage'));
const GuideVerificationPage = lazy(() => import('./pages/GuideVerificationPage'));

const ChatPage = lazy(() => import('./pages/ChatPage.jsx'));
const MessagesPage = lazy(() => import('./pages/MessagesPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage.jsx'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage.jsx'));
const CreatePostModal = lazy(() => import('./components/CreatePostModal.jsx'));

import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import AuthGuard from './components/AuthGuard';

function NotFound() {
  return <h1>404 - Not Found</h1>;
}

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-ui-bg">
    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand"></div>
  </div>
);

// Logic to handle the root path based on auth status
function HomeRedirect() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) return null; 

  // Only redirect from the base URL /
  if (isAuthenticated && location.pathname === '/') {
    return <Navigate to="/app" replace />;
  }
  
  if (location.pathname === '/') {
    return <LandingPage />;
  }

  return null;
}

// This is the key component that will manage the routing logic
function AppRouter() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes location={background || location}>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Protected App Routes */}
        <Route path="/app" element={<AuthGuard><App /></AuthGuard>}>
          <Route index element={<IndexPage />} />
          <Route path="onboarding" element={<TravelerOnboardingPage />} />
          <Route path="complete-profile" element={<ProfileCompletionPage />} />
          <Route path="verify" element={<GuideVerificationPage />} />
          <Route path="travelers" element={<FellowTravelersPage />} />
          <Route path="experiences" element={<ExperiencesPage />} />
          <Route path="experiences/:id" element={<ExperienceDetailPage />} />
          <Route path="essentials" element={<EssentialsPage />} />
          <Route path="essentials/:id" element={<ExperienceDetailPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="guides/:username" element={<GuideDetailPage />} />
          <Route path="dashboard" element={<GuideDashboardPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="posts/:postId" element={<PostDetailPage />} />
          <Route path="profile/:username" element={<UserProfilePage />} />
          <Route path="promotions" element={<PromotionsPage />} />
          <Route path="promotions/:id" element={<PromotionDetailPage />} />
          <Route path="messages" element={<MessagesPage />}>
            <Route path=":conversationId" element={<ChatPage />} />
          </Route>
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {background && (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/app/posts/:postId" element={<AuthGuard><PostDetailPage /></AuthGuard>} />
            <Route path="/create" element={<AuthGuard><CreatePostModal /></AuthGuard>} />
            <Route path="/create-trip" element={<AuthGuard><CreateTripPage /></AuthGuard>} />
            <Route path="/create-service" element={<AuthGuard><CreateExperiencePage /></AuthGuard>} />
            <Route path="/create-promotion" element={<AuthGuard><CreatePromotionPage /></AuthGuard>} />
          </Routes>
        </Suspense>
      )}
    </Suspense>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
