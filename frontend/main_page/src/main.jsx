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
import IndexPage from './components/IndexPage.jsx';
import CreatePostModal from './components/CreatePostModal.jsx';
import FellowTravelersPage from './components/FellowTravelersPage.jsx';
import NewGuidesPage from './components/NewGuidesPage.jsx';
import GroupChatPage from './components/GroupChatPage.jsx'; // Import the new page

// This is the key component that will manage the routing logic
function AppRouter() {
  const location = useLocation();
  const background = location.state?.background;

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<App />}>
          <Route index element={<IndexPage />} />
          <Route path="travelers" element={<FellowTravelersPage />} />
          <Route path="guides" element={<NewGuidesPage />} />
          <Route path="groups/:groupId" element={<GroupChatPage />} /> 
        </Route>
      </Routes>

      {background && (
        <Routes>
          <Route path="/create" element={<CreatePostModal />} />
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
