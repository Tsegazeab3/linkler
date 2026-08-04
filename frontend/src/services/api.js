import axios from 'axios';

// Get the CSRF token from the cookie
// Django requires this for POST requests to protect against CSRF attacks
function getCookie(name) {
  let cookieValue = null;
  if (typeof document !== 'undefined' && document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Create an axios instance with default settings
export const api = axios.create({
  baseURL: '/api/', // Use the proxied URL
  withCredentials: true, // This is crucial for sending cookies (and session info)
});

// Add a request interceptor to include the auth token and CSRF token dynamically
api.interceptors.request.use((config) => {
  // Add auth token
  const token = localStorage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Token ${token}`;
  }

  // Add CSRF token dynamically for all non-GET requests
  const csrftoken = getCookie('csrftoken');
  if (csrftoken && config.method !== 'get') {
    config.headers['X-CSRFToken'] = csrftoken;
  }
  
  return config;
});

/**
 * Creates a new post.
 * @param {FormData} postData - The post data, including the media file.
 * @returns {Promise} The axios promise.
 */
export const createPost = (postData) => {
  return api.post('posts/create/', postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const login = (username, password) => {
  return api.post('auth/login/', { username, password });
};

export const register = (userData) => {
  return api.post('auth/registration/', userData);
};

export const getProfile = () => {
  return api.get('accounts/profile/');
};

export const updateProfile = (profileData) => {
  const isFormData = profileData instanceof FormData;
  return api.patch('accounts/profile/', profileData, {
    headers: {
      'Content-Type': isFormData ? 'multipart/form-data' : 'application/json',
    },
  });
};

export const changePassword = (oldPassword, newPassword) => {
  return api.post('auth/password/change/', {
    old_password: oldPassword,
    new_password1: newPassword,
    new_password2: newPassword, // Assuming dj-rest-auth requires both
  });
};

export const requestPasswordReset = (email) => {
  return api.post('accounts/password-reset/', { email });
};

export const confirmPasswordReset = (token, newPassword) => {
  return api.post('accounts/password-reset/confirm/', { token, new_password: newPassword });
};

// Helper to build query parameters with support for multiple values (arrays)
const buildParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(val => {
        if (val) searchParams.append(key, val);
      });
    } else if (typeof value === 'boolean') {
      if (value) searchParams.append(key, 'true');
    } else if (value) {
      searchParams.append(key, value);
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

// Posts & Trips
export const getPosts = (url = 'posts/') => api.get(url);
export const getPost = (postId) => api.get(`posts/${postId}/`);
export const getTrips = (category = '', region = '', destination_country = '', search = '', quickFilters = {}, user = '', origin = '') => {
  const params = buildParams({ category, region, destination_country, search, user, origin, ...quickFilters });
  return api.get(`posts/trips/${params}`);
};
export const getTripCategories = () => api.get('posts/trips/categories/');
export const getTripRegions = () => api.get('posts/trips/regions/');
export const createTrip = (tripData) => api.post('posts/trips/', tripData);

// Guides & Promotions
export const getGuides = (type = 'guide', search = '', category = '', quickFilters = {}) => {
  const params = buildParams({ type, search, category, ...quickFilters });
  return api.get(`accounts/guides/${params}`);
};
export const getGuideCountries = (type = 'guide') => api.get(`accounts/guides/countries/?type=${type}`);
export const getPromotions = (search = '', category = '', region = '', country = '', quickFilters = {}) => {
  const params = buildParams({ search, category, region, country, ...quickFilters });
  return api.get(`promotions/${params}`);
};
export const getPromotionCategories = () => api.get('promotions/categories/');
export const getPromotionRegions = () => api.get('promotions/regions/');
export const getExperiences = (search = '', category = '', region = '', country = '', quickFilters = {}, user = '', listing_type = '') => {
  const params = buildParams({ search, category, region, country, user, listing_type, ...quickFilters });
  return api.get(`accounts/experiences/${params}`);
};
export const getExperienceCategories = () => api.get('accounts/experiences/categories/');
export const getExperienceRegions = () => api.get('accounts/experiences/regions/');
export const getExperienceDetail = (id) => api.get(`accounts/experiences/${id}/`);
export const createExperience = (data) => api.post('accounts/experiences/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

// Reviews
export const getExperienceReviews = (experienceId) => api.get(`accounts/experience-reviews/?experience_id=${experienceId}`);
export const createExperienceReview = (experienceId, rating, comment) => api.post('accounts/experience-reviews/', { experience: experienceId, rating, comment });
export const getProviderReviews = (providerId) => api.get(`accounts/provider-reviews/?provider_id=${providerId}`);
export const createProviderReview = (providerId, rating, comment) => api.post('accounts/provider-reviews/', { provider: providerId, rating, comment });

export const createPromotion = (data) => api.post('promotions/', data, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getUserDetail = (username) => api.get(`accounts/${username}/`);
export const searchUsers = (query) => api.get(`accounts/search/?q=${encodeURIComponent(query)}`);
export const getPromotionDetail = (id) => api.get(`promotions/${id}/`);

// Dashboard & Bookings
export const getGuideDashboardStats = () => api.get('accounts/dashboard/stats/');
export const getGuideAvailability = (username) => api.get(`accounts/availability-manage/${username}/`);
export const updateGuideAvailability = (username, data) => api.post(`accounts/availability-manage/${username}/`, data);
export const createBooking = (data) => api.post('accounts/bookings/', data);
export const getBookings = () => api.get('accounts/bookings/');
export const updateBookingStatus = (id, status) => api.patch(`accounts/bookings/${id}/`, { status });

// Onboarding & Verification
export const submitTravelerOnboarding = (data) => api.post('accounts/onboarding/', data);
export const uploadVerificationDoc = (formData) => api.post('accounts/verification/upload/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getVerificationDocs = () => api.get('accounts/verification/upload/');

// Notifications
export const getNotifications = () => api.get('accounts/notifications/');
export const markNotificationRead = (id) => api.patch(`accounts/notifications/${id}/`, { is_read: true });
export const deleteNotification = (id) => api.delete(`accounts/notifications/${id}/`);

// My Content
export const getMyPosts = () => api.get('posts/?my_posts=true');
export const updatePost = (id, formData) => api.patch(`posts/${id}/edit/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePost = (id) => api.delete(`posts/${id}/edit/`);
export const deletePostsBatch = (postIds) => api.post('posts/batch-delete/', { post_ids: postIds });

export const getMyServices = () => api.get('accounts/experiences/?my_services=true');

export const updateService = (id, formData) => api.patch(`accounts/experiences/${id}/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteService = (id) => api.delete(`accounts/experiences/${id}/`);

// Chat
export const getConversations = () => api.get('chat/conversations/');
export const getMessages = (conversationId) => api.get(`chat/conversations/${conversationId}/messages/`);
export const sendMessage = (conversationId, data) => {
  // Check if data has an attachment or is just text
  if (data instanceof FormData) {
    return api.post(`chat/conversations/${conversationId}/messages/`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
  return api.post(`chat/conversations/${conversationId}/messages/`, { text: data });
};
export const markChatAsRead = (conversationId) => api.patch(`chat/conversations/${conversationId}/read/`);
export const createDM = (recipientId) => api.post('chat/conversations/', { type: 'dm', recipient_id: recipientId });
export const createGroup = (name, memberIds, privacy = 'public') => api.post('chat/conversations/', { type: 'group', name, member_ids: memberIds, privacy });
export const updateGroupAvatar = (conversationId, formData) => api.patch(`chat/conversations/${conversationId}/`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const searchGroups = (query) => api.get(`chat/groups/search/?q=${query}`);
export const requestToJoinGroup = (conversationId) => api.post('chat/groups/join-request/', { conversation_id: conversationId });
export const joinGroupByInvite = (inviteCode) => api.post('chat/groups/join-invite/', { invite_code: inviteCode });

// Social
export const followUser = (username) => api.post(`accounts/${username}/follow/`);
export const unfollowUser = (username) => api.delete(`accounts/${username}/unfollow/`);
export const getFollowers = (username) => api.get(`accounts/${username}/followers/`);
export const getFollowing = (username) => api.get(`accounts/${username}/following/`);

// Post Interactions
export const toggleLike = (postId) => api.post(`posts/${postId}/like/`);
export const toggleSave = (postId) => api.post(`posts/${postId}/save/`);
export const getComments = (postId) => api.get(`posts/${postId}/comments/`);
export const addComment = (postId, text) => api.post(`posts/${postId}/comments/`, { text });
