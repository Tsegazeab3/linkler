import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import StarRating from './StarRating';
import { followUser, unfollowUser, createDM } from '../services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const GuidePreviewCard = ({ guide }) => {
  const { id, name, country, rating, price, serviceDescription, picture, user_id, is_following: initialIsFollowing } = guide;
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const { handleOpenChat } = useOutletContext();

  const handleFollow = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      if (isFollowing) {
        await unfollowUser(name); // name is username here
        setIsFollowing(false);
      } else {
        await followUser(name);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await createDM(user_id);
      handleOpenChat(res.data, 'dm');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  return (
    <Card className="rounded-[20px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-ui-border/50">
      <div className="relative h-48 bg-ui-bg-alt">
        <img src={picture || 'https://images.unsplash.com/photo-1440778303588-435521a205bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3 flex flex-col space-y-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
          <Button 
            size="icon"
            variant="secondary"
            onClick={handleChat}
            className="rounded-xl shadow-lg hover:bg-ui-white text-brand bg-ui-white/95 backdrop-blur-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </Button>
          <Button 
            size="icon"
            variant="secondary"
            onClick={handleFollow}
            className={`rounded-xl shadow-lg transition-all bg-ui-white/95 backdrop-blur-sm ${isFollowing ? 'text-ui-muted hover:bg-error/10 hover:text-error' : 'text-brand hover:bg-ui-white'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0v-1h-1a1 1 0 110-2h1V7a1 1 0 112 0z" />
            </svg>
          </Button>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-ui-text-main group-hover:text-brand transition-colors uppercase tracking-tight">{name}</h3>
          <div className="flex items-center bg-brand-light px-2 py-1 rounded-lg">
            <span className="text-warning mr-1 text-xs">★</span>
            <span className="text-xs font-bold text-brand">{rating}</span>
          </div>
        </div>
        <p className="text-xs font-semibold text-ui-muted mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {country}
        </p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-ui-border">
          <p className="text-xl font-black text-ui-text-main leading-none">
            ${price}
            <span className="text-[10px] text-ui-muted font-medium ml-1">/hour</span>
          </p>
          <div className="text-[10px] text-brand font-bold bg-brand-light px-2 py-1 rounded-md uppercase tracking-wider">
            Available
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuidePreviewCard;
