import React from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { createDM } from '../services/api';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const ExperiencePreviewCard = ({ experience }) => {
  const { id, title, description, price, currency, location, country, region, duration, images, user, user_username, rating, review_count, listing_type, category } = experience;
  const { handleOpenChat } = useOutletContext();
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/app/${listing_type === 'service' ? 'essentials' : 'experiences'}/${id}`);
  };

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const handleChat = async (e) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await createDM(user);
      handleOpenChat(res.data, 'dm');
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  const displayImage = getMediaUrl(images && images.length > 0 
    ? images[0].image 
    : 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80');

  return (
    <Card 
        onClick={handleCardClick}
        className="rounded-[20px] overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-ui-border/50 cursor-pointer"
    >
      <div className="relative h-48 bg-ui-bg-alt">
        <img src={displayImage} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        
        {/* Listing Type Badge */}
        <div className="absolute top-3 left-3">
            <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md border ${listing_type === 'service' ? 'bg-indigo-500/90 text-white border-indigo-400' : 'bg-brand/90 text-white border-brand-light'}`}>
                {listing_type === 'service' ? '🛠️ Essential' : '🏹 Experience'}
            </div>
        </div>

        <div className="absolute top-3 right-3 translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
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
        </div>
      </div>
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-lg font-bold text-ui-text-main group-hover:text-brand transition-colors uppercase tracking-tight line-clamp-1">{title}</h3>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[10px] text-brand font-bold bg-brand-light px-2 py-1 rounded-md uppercase tracking-wider">
              {duration}
            </div>
            <div className="flex items-center bg-warning/10 px-2 py-0.5 rounded-lg border border-warning/20">
              <span className="text-warning mr-1 text-[10px]">★</span>
              <span className="text-[10px] font-bold text-warning">{rating > 0 ? rating : 'New'}</span>
              {review_count > 0 && (
                <span className="text-[8px] text-ui-muted ml-0.5">({review_count})</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs font-semibold text-ui-muted mb-3 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {region} • {country} • {location}
        </p>
        <p className="text-xs text-ui-text-secondary line-clamp-2 mb-4 h-8">
            {description}
        </p>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-ui-border">
          <p className="text-xl font-black text-ui-text-main leading-none">
            {currency === 'USD' ? '$' : currency}{price}
          </p>
          <div className="flex items-center text-[10px] font-bold text-ui-muted">
            by <span className="ml-1 text-brand hover:underline">@{user_username}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExperiencePreviewCard;
