# Project Overview: Linkler Application

This document provides a comprehensive overview of the "Linkler" application, detailing its architecture, key components, and their functionalities. It serves as a persistent context for future interactions.

## Application Architecture

The Linkler application is a full-stack project utilizing a Django backend for data management and API services, and a React frontend for the user interface. The frontend is structured with multiple independent React applications for different pages (e.g., `sign_in_page`) and a main application (`main_page`) that handles the core user experience.

### Backend (Django)

The Django backend is responsible for data persistence and providing RESTful APIs.

**Key Models:**
*   **`accounts.CustomUser`**: Extends the default Django user to include profile information like `age`, `nationality`, `profile_picture`, and `bio`.
*   **`posts.Post`**: The central model for all user-generated content. It is designed to be flexible, supporting both media-based and text-only posts.
    *   **Content Fields**: `caption` (TextField), `media_file` (FileField), `media_type`, `aspect_ratio`. The media fields are optional to allow for text-only posts.
    *   **Settings Fields**: Includes fields to manage the post's visibility and interaction settings:
        *   `status`: `CharField` with choices ('draft', 'published').
        *   `audience`: `CharField` with choices ('public', 'followers', 'private').
        *   `allow_comments`: `BooleanField`.

**Key API Endpoints:**
*   `/api/auth/login/`: Handles user login via session authentication.
*   `/api/posts/create/`: A protected endpoint for creating new posts (both media and text-only).

### Frontend (React - `main_page`)

The `main_page` is the core of the user experience, built as a single-page application using React and `react-router-dom`.

#### Core UI Components:

*   **`App.jsx`**: The root component. It manages the main layout, including the `SideNav` and the main content area which uses `<Outlet />` from `react-router-dom` to render different pages. It also manages the state for floating chat windows.

*   **`SideNav.jsx`**: The primary navigation component.
    *   **Hybrid Navigation**: Differentiates between items that are direct links (like "Home") and items that open a side panel (like "Messages", "Groups", "Saved Guides").
    *   **Side Panels**: When a panel item is clicked, a side panel slides out, displaying a list of previews (e.g., chat previews, group previews).
    *   **Notification Badges**: Displays an unread count on the "Messages" and "Groups" icons.

*   **`CreatePostModal.jsx`**: A modal for creating new posts, implemented using a React Portal and a dedicated route (`/create`).
    *   **Modal Routing**: It appears as an overlay while keeping the previous page visible in the background, managed by `react-router-dom`'s location state.
    *   **Multi-Step Flow**:
        1.  **`MediaSelection`**: The initial view, allowing the user to either upload media (photo/video) or choose to write a text-only post.
        2.  **`PostDetails`**: The second view for finalizing the post. It includes a caption input, audience selector, comment toggle, and buttons to "Post" or "Save as Draft". It features a responsive two-column layout on desktop.

*   **`ChatWindow.jsx`**: A floating pop-up component for direct messages and interacting with saved guides.
    *   **Global State**: Managed by `App.jsx` to allow multiple chat windows to be open simultaneously.
    *   **UI**: Each window is a self-contained chat interface that can be minimized or closed.

*   **`GroupChatPage.jsx`**: A full-page component for group chats.
    *   **Dedicated Page**: Unlike direct messages, clicking a group navigates the user to a full-page chat experience at a dynamic route (`/groups/:groupId`), replacing the main post feed.

This architecture creates a clear separation between different types of user interactions: full-page navigation for major sections, a routed modal for post creation, and floating pop-ups for private chats.
