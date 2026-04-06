import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getPosts, getConversations } from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  
  // Track if we've already done the initial fetch to prevent loops
  const initialFetchDone = useRef(false);

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    try {
      const res = await getPosts();
      const data = res.data.results || res.data;
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  }, []);

  const fetchConversations = useCallback(async () => {
    setLoadingConversations(true);
    try {
      const res = await getConversations();
      const data = res.data.results || res.data;
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setConversations([]);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && !initialFetchDone.current) {
      fetchPosts();
      fetchConversations();
      initialFetchDone.current = true;
    } else if (!isAuthenticated) {
      setPosts([]);
      setConversations([]);
      initialFetchDone.current = false;
    }
  }, [isAuthenticated, fetchPosts, fetchConversations]);

  return (
    <DataContext.Provider value={{
      posts,
      conversations,
      loadingPosts,
      loadingConversations,
      refreshPosts: fetchPosts,
      refreshConversations: fetchConversations,
      setPosts,
      setConversations
    }}>
      {children}
    </DataContext.Provider>
  );
};
