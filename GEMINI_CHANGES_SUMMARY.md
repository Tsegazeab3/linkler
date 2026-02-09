# Project Overview: Linkler Application

This document provides a comprehensive overview of the "Linkler" application, detailing its architecture, key components, and their functionalities. It serves as a persistent context for future interactions.

## Application Architecture

The Linkler application is a full-stack project utilizing a Django backend for data management and API services, and a React frontend for the user interface. The frontend is structured as a monorepo, containing several independent React applications (Vite projects) for different sections of the user experience.

### Backend (Django)

The Django backend is responsible for:
*   **User Authentication and Authorization:** Handled by the `accounts` app.
*   **Guide Management:** Likely managed by the `guide_registration` app, handling creation, storage, and retrieval of travel guides.
*   **Data Persistence:** Interacting with a database (e.g., PostgreSQL, SQLite) to store application data.
*   **API Endpoints:** Providing RESTful APIs for the frontend to consume.

**Key Django Directories/Files:**
*   `manage.py`: Django's command-line utility for administrative tasks.
*   `requirements.txt`: Lists Python dependencies for the Django project.
*   `accounts/`: Django app for user accounts, authentication, and profiles.
    *   `models.py`: Defines database models for users and related data.
    *   `views.py`: Contains logic for handling user-related requests (e.g., login, registration).
    *   `migrations/`: Database schema changes for the `accounts` app.
*   `guide_registration/`: Django app for managing travel guides.
    *   `models.py`: Defines database models for guides, interests, nationalities, etc.
    *   `serializers.py`: (If using Django REST Framework) Defines how model instances are serialized/deserialized for API responses.
    *   `views.py`: Contains logic for handling guide-related requests.
*   `linkler/` (project root Django directory):
    *   `settings.py`: Main configuration for the Django project.
    *   `urls.py`: Defines URL routing for the entire Django project, dispatching requests to specific app-level URL configurations.
    *   `wsgi.py`, `asgi.py`: Entry points for web servers.

### Frontend (React - Monorepo)

The `frontend/` directory houses multiple independent React (Vite) applications, each serving a distinct part of the user interface.

**Key Frontend Directories/Applications:**
*   `frontend/LandingPage/`: Likely the public-facing landing page of the application, designed to attract new users.
    *   `src/LandingPage.jsx`: Main component for the landing page.
    *   `src/components/`: Contains reusable UI components specific to the landing page (e.g., `HeroSection`, `ContentSection`).
*   `frontend/main_page/`: The core application interface for logged-in users, featuring the main feed and navigation. This is where the `SideNav` and `PostCard` components reside.
    *   `src/App.jsx`: The main entry point and orchestrator for the `main_page` application.
    *   `src/components/SideNav.jsx`: Provides primary navigation within the `main_page`, featuring links to Home, Saved Guides, Messages, Settings, Fellow Travelers, and New Guides. It includes state for showing/hiding a side panel.
    *   `src/components/PostCard.jsx`: A reusable Instagram-style component for displaying individual posts in a media-first feed. (Details below)
*   `frontend/sign_in_page/`: Application for user login.
*   `frontend/sign_up_page/`: Application for user registration.

## Recent Changes: PostCard Component Development

During the last session, a new React component `PostCard.jsx` was developed within `frontend/main_page/src/components/` to serve as a reusable, Instagram-style post unit for social media feeds.

### Key Features Implemented in `PostCard.jsx`:

1.  **Media Display:** Supports image and video posts exclusively, with configurable aspect ratios (1:1 and 4:5). Media is the root element, rendering before any text or actions and defining the initial card height.
2.  **User Information Section:**
    *   Displays the user's profile picture, username, and a "Follow" button above the post media.
    *   Includes a user bio below the username, which is limited to 80 characters and wraps to a maximum of two lines. If the bio exceeds these limits, an ellipsis (`...`) is appended. Padding (`px-3`) is applied for better readability.
3.  **Action Bar:** Located below the media, it contains interactive buttons for:
    *   **Like:** Toggles a liked state.
    *   **Comment:** Placeholder for commenting functionality.
    *   **Share:** Placeholder for sharing functionality.
    *   **Save:** Toggles a saved state.
4.  **Post Metadata:** Displays the total number of likes and the post's timestamp.
5.  **Caption Block:** An optional text block rendered below the action bar. It includes a placeholder username and supports truncation with a "more/less" toggle for longer captions, ensuring this interaction does not affect media layout.

### Integration and Data Flow:

*   The `PostCard` component is designed to be stateless and purely driven by `props`, receiving all necessary data (media type, URL, aspect ratio, caption, user details, interaction states, etc.) explicitly.
*   **`frontend/main_page/src/App.jsx`**: Was modified to import and render multiple instances of `PostCard`. It provides `fakePosts` dummy data, which includes all the necessary props to showcase various types of posts and user interactions, enabling visual verification of the component's features.

This robust `PostCard` component forms a core building block for the social media feed functionality within the `main_page` frontend application.