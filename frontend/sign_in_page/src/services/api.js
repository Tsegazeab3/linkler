import axios from 'axios';

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

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json', // Login sends JSON, not form-data
    'X-CSRFToken': csrftoken,
  },
  withCredentials: true,
});

/**
 * Logs in a user.
 * @param {string} username
 * @param {string} password
 * @returns {Promise}
 */
export const login = (username, password) => {
  return api.post('/auth/login/', { username, password });
};

export default api;
