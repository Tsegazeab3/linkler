import axios from 'axios';
import storage from '../utils/storage';

// Get the CSRF token from the cookie
// Django requires this for POST requests to protect against CSRF attacks
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
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

const csrftoken = getCookie('csrftoken');

// Create an axios instance with default settings
export const api = axios.create({
  baseURL: '/api/', // Use the proxied URL
  headers: {
    'X-CSRFToken': csrftoken,
  },
  withCredentials: true, // This is crucial for sending cookies (and session info)
});

// Add a request interceptor to include the auth token
api.interceptors.request.use((config) => {
  const token = storage.getItem('token');
  if (token && token !== 'null' && token !== 'undefined') {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

/**
 * Creates a new post.
 * @param {FormData} postData - The post data, including the media file.
 * @returns {Promise} The axios promise.
 */
export const createPost = (postData) => {
  return api.post('/posts/create/', postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const login = (email, password) => {
  return axios.post('/api/auth/login/', { email, password }, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    withCredentials: true,
  });
};

export const register = (userData) => {
  return axios.post('/api/auth/registration/', userData, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
    },
    withCredentials: true,
  });
};

export const getProfile = () => {
  return api.get('accounts/profile/');
};

export const updateProfile = (profileData) => {
  return api.patch('accounts/profile/', profileData, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

// Posts & Trips
export const getPosts = () => api.get('posts/');
export const getPost = (postId) => api.get(`posts/${postId}/`);
export const updatePost = (postId, postData) => {
  return api.patch(`posts/${postId}/`, postData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
export const deletePost = (postId) => api.delete(`posts/${postId}/`);
export const getTrips = () => api.get('posts/trips/');
export const createTrip = (tripData) => api.post('posts/trips/', tripData);

// Guides & Promotions
export const getGuides = () => api.get('accounts/guides/');
export const getPromotions = () => api.get('promotions/');
export const getUserDetail = (userId) => api.get(`accounts/${userId}/`);
export const getPromotionDetail = (id) => api.get(`promotions/${id}/`);

// Chat
export const getConversations = () => api.get('chat/conversations/');
export const getMessages = (conversationId) => api.get(`chat/conversations/${conversationId}/messages/`);
export const sendMessage = (conversationId, text) => api.post(`chat/conversations/${conversationId}/messages/`, { text });
export const markChatAsRead = (conversationId) => api.patch(`chat/conversations/${conversationId}/read/`);
export const createDM = (recipientId) => api.post('chat/conversations/', { type: 'dm', recipient_id: recipientId });

// Social
export const followUser = (userId) => api.post(`accounts/${userId}/follow/`);
export const unfollowUser = (userId) => api.delete(`accounts/${userId}/unfollow/`);
