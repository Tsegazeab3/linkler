import React, { useState, useEffect, useRef } from 'react';
import { searchUsers, followUser, unfollowUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const inputRef = useRef(null);
  const debounceTimeout = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // If we need to see if current user is the one in results

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      searchUsers(query)
        .then(response => {
          setResults(response.data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Search failed:", err);
          setError("Failed to search users.");
          setLoading(false);
        });
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceTimeout.current);
  }, [query]);

  const handleFollowToggle = async (targetUser) => {
    try {
      if (targetUser.is_following) {
        await unfollowUser(targetUser.id);
        setResults(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_following: false, followers_count: u.followers_count - 1 } : u));
      } else {
        await followUser(targetUser.id);
        setResults(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_following: true, followers_count: u.followers_count + 1 } : u));
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
    }
  };

  const navigateToProfile = (userId) => {
    onClose();
    navigate(`/user/${userId}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden bg-ui-white/95 backdrop-blur-md border-ui-border shadow-2xl [&>button]:hidden">
        <VisuallyHidden.Root><DialogTitle>Search Travelers</DialogTitle></VisuallyHidden.Root>
        
        {/* Search Input Area */}
        <div className="flex items-center p-2 border-b border-ui-border">
          <div className="pl-4 pr-2 text-ui-muted">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M10.5 3.75a6.75 6.75 0 100 13.5 6.75 6.75 0 000-13.5zM2.25 10.5a8.25 8.25 0 1114.59 5.28l4.69 4.69a.75.75 0 11-1.06 1.06l-4.69-4.69A8.25 8.25 0 012.25 10.5z" clipRule="evenodd" />
            </svg>
          </div>
          <Input
            ref={inputRef}
            type="text"
            className="w-full h-14 text-lg lg:text-xl border-none shadow-none focus-visible:ring-0 px-2 bg-transparent"
            placeholder="Search for travelers, guides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="mr-2 text-ui-muted hover:text-ui-text-main rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </Button>
          )}
          <Button 
            variant="ghost"
            onClick={onClose}
            className="flex sm:hidden mr-2 text-ui-muted"
          >
            Cancel
          </Button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto bg-ui-bg">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-ui-muted">
              <svg className="animate-spin h-8 w-8 mb-4 text-brand" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm font-medium">Searching our global network...</p>
            </div>
          )}

          {!loading && error && (
            <div className="p-8 text-center text-error">{error}</div>
          )}

          {!loading && !error && query.trim() !== '' && results.length === 0 && (
            <div className="py-16 px-6 text-center">
              <div className="w-16 h-16 bg-ui-bg-alt rounded-full flex items-center justify-center mx-auto mb-4 text-ui-muted">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-ui-text-main font-semibold text-lg mb-1">No travelers found</h3>
              <p className="text-ui-text-secondary text-sm">We couldn't find any matches for "{query}".</p>
            </div>
          )}

          {!loading && !error && results.length > 0 && (
            <div className="p-2 space-y-1">
              <div className="px-4 pt-2 pb-1">
                <h3 className="text-xs font-bold text-ui-muted uppercase tracking-wider">Travelers & Guides</h3>
              </div>
              {results.map((resultUser) => (
                <div 
                  key={resultUser.id}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-ui-white hover:shadow-sm border border-transparent hover:border-ui-border transition-all cursor-pointer group"
                  onClick={() => navigateToProfile(resultUser.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <Avatar className="w-12 h-12 border border-ui-border">
                      <AvatarImage src={resultUser.profile_picture} alt={resultUser.username} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-brand-light to-accent-indigo/10 text-brand font-bold">
                        {resultUser.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-ui-text-main truncate">@{resultUser.username}</h4>
                        {resultUser.account_type === 'guide' && (
                          <span className="px-1.5 py-0.5 rounded-md bg-warning-light text-warning text-[10px] font-bold uppercase tracking-wide flex-shrink-0">
                            Guide
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ui-muted truncate mt-0.5">
                        {resultUser.bio ? resultUser.bio : (resultUser.city || resultUser.country ? `${resultUser.city ? resultUser.city + ', ' : ''}${resultUser.country || ''}` : 'New Traveler')}
                      </p>
                    </div>
                  </div>
                  
                  {user?.id !== resultUser.id && (
                    <Button 
                      variant={resultUser.is_following ? "secondary" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowToggle(resultUser);
                      }}
                      className={`ml-4 rounded-full text-xs font-bold transition-all ${
                        resultUser.is_following && 'hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 border border-transparent'
                      }`}
                    >
                      {resultUser.is_following ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {!query && (
            <div className="py-16 px-6 text-center opacity-60">
              <p className="text-sm font-medium text-ui-text-secondary mb-2">Search for your friends, favorite guides, or discover new people.</p>
              <div className="flex justify-center gap-2">
                <span className="px-2 py-1 bg-ui-bg-alt rounded text-xs font-mono text-ui-muted border border-ui-border">try "@alex"</span>
                <span className="px-2 py-1 bg-ui-bg-alt rounded text-xs font-mono text-ui-muted border border-ui-border">or "Guide"</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="hidden sm:block p-3 border-t border-ui-border bg-ui-bg-alt/30 text-center">
          <p className="text-xs text-ui-muted flex items-center justify-center gap-1.5">
            Press <kbd className="px-2 py-0.5 rounded-md bg-ui-white border border-ui-border shadow-sm">Esc</kbd> to close
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SearchModal;
