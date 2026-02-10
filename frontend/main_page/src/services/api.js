import axios from 'axios';

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
const api = axios.create({
  baseURL: '/api/', // Use the proxied URL
  headers: {
    'Content-Type': 'multipart/form-data',
    'X-CSRFToken': csrftoken,
  },
  withCredentials: true, // This is crucial for sending cookies (and session info)
});

/**
 * Creates a new post.
 * @param {FormData} postData - The post data, including the media file.
 * @returns {Promise} The axios promise.
 */
export const createPost = (postData) => {
  return api.post('/posts/create/', postData);
};

export default api;
