# Gemini CLI Changes Summary

**Date:** February 4, 2026

**Overall Objective:** The primary goal was to decouple the React frontend from the Django backend for static content and specific API interactions, simplify the project structure by refactoring the user model, and implement a new guide registration feature.

---

## I. Frontend Decoupling & Content Restructuring

### 1. Static Image Independence
-   **Action:** Moved static images (e.g., `page_1.png` etc.) from Django's `static/assets/` directory to the React frontend's `frontend/LandingPage/public/assets/` directory.
-   **Backend Change:** Updated `image` paths in all `Card` model instances in the database from `static/assets/image.png` to `/assets/image.png` to reflect the new frontend-served location.
-   **Django Settings:** Removed `BASE_DIR / 'static'` from `STATICFILES_DIRS` in `linkler/settings.py`, as these images are no longer served by Django.

### 2. Card Data Decoupling
-   **Action:** Modified `frontend/LandingPage/src/components/HeroSection.jsx` to use hardcoded static data for the "cards" instead of fetching from the `/cards/` Django API endpoint. This completely removes the API dependency for this section.

### 3. Frontend Development Environment Decoupling
-   **Action:** Removed all proxy settings (`/api`, `/cards`, `/users`, `/static`) from `frontend/LandingPage/vite.config.js`. This ensures that when running `npm run dev`, the frontend does not attempt to connect to a Django backend for these paths, achieving full decoupling for development.

---

## II. Backend Refactoring (App Removal & User Model Migration)

### 1. New `accounts` App Creation
-   **Action:** Created a new Django app named `accounts` (`python manage.py startapp accounts`).

### 2. `CustomUser` Model Migration
-   **Action:** Moved the `CustomUser` model definition from `landing_page/models.py` to `accounts/models.py`.
-   **Settings Update:** `linkler/settings.py` was updated to:
    -   Add `accounts` to `INSTALLED_APPS`.
    -   Change `AUTH_USER_MODEL` from `'landing_page.customuser'` to `'accounts.CustomUser'`.

### 3. `landing_page` App Removal
-   **Action:** All model definitions (`Message`, `Card`, `CustomUser`) were removed from `landing_page/models.py`.
-   **Action:** The entire `landing_page` directory was removed.
-   **Settings Update:** `landing_page` was removed from `INSTALLED_APPS` in `linkler/settings.py`.
-   **URL Cleanup:** `path('', include('landing_page.urls'))` was removed from `linkler/urls.py`.

### 4. Database Reset & Migration Reapplication
-   **Action:** The `db.sqlite3` database file was deleted to start with a clean slate.
-   **Action:** All migration files from `accounts/migrations/` and `landing_page/migrations/` (if any existed before deletion) were removed.
-   **Action:** `python manage.py makemigrations accounts` was run to create a fresh initial migration for the `accounts` app.
-   **Action:** `python manage.py makemigrations` was run to create migrations for other apps (e.g., `allauth`).
-   **Action:** `python manage.py migrate` was run to apply all migrations, establishing a new, consistent database schema. (This process accepted data loss for previous `CustomUser`, `Message`, and `Card` data).

---

## III. Built Frontend Serving by Django

-   **Action:** The generic `re_path(r'^(?:.*)/?$')` for serving the React build as a catch-all from `linkler/urls.py` was removed.
-   **Action:** A custom `serve_react_app` function was defined within `linkler/urls.py`.
-   **Action:** `linkler/urls.py` was updated to map the root URL (`/`) to this `serve_react_app` function, which reads and serves the `index.html` from `frontend/LandingPage/dist/`.
-   **Static/Media Serving:** The `if settings.DEBUG:` block in `linkler/urls.py` was adjusted to explicitly serve:
    -   Media files (`MEDIA_URL`).
    -   React app's main static files (`STATIC_URL`, pointing to `LANDING_PAGE_BUILD_DIR`).
    -   React app's built assets (`/assets/`, pointing to `LANDING_PAGE_BUILD_DIR / 'assets'`).

---

## IV. Guide Registration Feature Implementation

### 1. Backend API for Registration
-   **Action:** A new Django app `guide_registration` was created.
-   **Model:** `GuideInterest` model defined in `guide_registration/models.py` with `name`, `email`, `nationality`, `message`, and `registered_at` fields.
-   **Serializer:** `GuideInterestSerializer` created in `guide_registration/serializers.py`.
-   **API View:** `GuideInterestCreateView` (a `generics.CreateAPIView`) created in `guide_registration/views.py`.
-   **Settings:** `guide_registration` added to `INSTALLED_APPS` in `linkler/settings.py`.
-   **URL:** API endpoint `/api/register/` added to `linkler/urls.py`, routing to `GuideInterestCreateView`.
-   **Migrations:** Generated and applied migrations for `guide_registration`.

### 2. Frontend Registration Form
-   **Action:** `RegistrationForm.jsx` component created in `frontend/LandingPage/src/components/`, replacing `GuideRegistrationForm.jsx`.
-   **Form Fields:** Includes fields for `name`, `email`, `nationality`, and `message`.
-   **Submission:** Handles POST requests to `/api/register/` using `axios`.
-   **Layout:** Form is centered on the page.

---

## V. Frontend UI/Layout Adjustments

### 1. Header Component Restructuring
-   **Action:** `Header.jsx` (original) was moved to `frontend/LandingPage/src/temp_components/` for temporary removal from the main view.
-   **Action:** A new `SimpleHeader.jsx` component was created in `frontend/LandingPage/src/components/`.
-   **`SimpleHeader.jsx` Content:** Incorporates the dynamic "Linkler" title with scroll transition (using `useTypewriter`, `HomeIcon`, `smoothScrollTo`) and navigation buttons.
-   **`SimpleHeader.jsx` Layout:** Refined to use one-line flexbox with `nowrap` for desktop, and includes a functional hamburger menu for mobile (`md:hidden`).
-   **Linker Title Positioning:** Adjusted to remove `fixed` positioning from the non-scrolled state, integrating it into the flex flow, and conditionally rendering the fixed "Home" icon.
-   **Responsiveness:** `min-w-0` added to title and button containers in `SimpleHeader` for better shrinking on small screens.

### 2. Landing Page Routing Update
-   **Action:** `frontend/LandingPage/src/LandingPage.jsx` was modified to:
    -   Render `SimpleHeader` and `HeroSection` on the root (`/`) path.
    -   Include a new route `path="/register"` for the `RegistrationForm` component.
    -   Removed previous `/signup` and `/register-guide` routes.
    -   The `SimpleHeader`'s "Register as Traveller" and "Register as Guide" buttons now both link to `/register`.

---

**Crucial Next Steps for User:**
1.  **Build React Frontend:** `cd frontend/LandingPage/ && npm run build`
2.  **Run Django Server:** `python manage.py runserver`
3.  **Test Application:** Access `http://127.0.0.1:8000/` and test the new `SimpleHeader`, `HeroSection`, and the registration form at `/register`.