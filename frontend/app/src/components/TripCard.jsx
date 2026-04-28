import React, { useState } from 'react';
import { Link, useOutletContext, useNavigate } from 'react-router-dom';
import { followUser, unfollowUser, createDM } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDirector } from '../context/DirectorContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

const LocationPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-ui-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-ui-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block mr-1 text-ui-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TripCard = ({ trip, isExpanded }) => {
  const { 
    picture, name, username, bio, from, to, country, region, dates, message, id, user_id, 
    is_following: initialIsFollowing, image: tripImage, category, verification_status,
    max_travelers, current_travelers 
  } = trip;
  
  const seatsLeft = (max_travelers || 4) - (current_travelers || 1);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Mobile focus states
  const [mobileFocus, setMobileFocus] = useState('none'); // 'image', 'text', or 'none'

  const { handleOpenChat } = useOutletContext();
  const { triggerAction } = useDirector();
  const [isPending, setIsPending] = useState(false);

  const handleFollow = async (e) => {
    e.stopPropagation();
    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
      } else {
        await followUser(username);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  const handleConnectRequest = async (e) => {
    e.stopPropagation();
    setIsPending(true);
    if (typeof triggerAction === 'function') triggerAction('action:connect-requested');
  };

  const getMediaUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  const commonImgSrc = getMediaUrl(tripImage || picture);

  const toggleMobileImage = (e) => {
    if (window.innerWidth >= 768) return;
    setMobileFocus(mobileFocus === 'image' ? 'none' : 'image');
  };

  const toggleMobileText = (e) => {
    if (window.innerWidth >= 768) return;
    // Don't toggle if we clicked a link or button
    if (e.target.closest('button') || e.target.closest('a')) return;
    setMobileFocus(mobileFocus === 'text' ? 'none' : 'text');
  };

  return (
    <div className={`relative rounded-[3rem] max-w-4xl w-full mx-auto my-2 overflow-hidden shadow-2xl bg-ui-white border border-ui-border transition-all duration-700 ease-in-out ${isExpanded ? 'scale-[1.01] ring-8 ring-brand/5' : ''}`}>
      
      {/* 
         Fixed height of 450px for desktop to ensure arrows fit.
         Mobile layout is flex-col, h-[70vh] for swipability.
      */}
      <div className="flex flex-col md:grid md:grid-cols-5 h-[70vh] md:h-[450px] relative overflow-hidden">
        
        {/* Trip Image Section */}
        <div 
          className={`
            relative overflow-hidden shrink-0 transition-all duration-700 ease-in-out cursor-pointer z-0
            /* Desktop Layout */
            md:col-span-2 md:h-full
            /* Mobile Layout */
            w-full
            ${mobileFocus === 'image' ? 'h-[85%]' : (mobileFocus === 'text' ? 'h-[15%]' : 'h-1/2')}
          `}
          onClick={toggleMobileImage}
        >
          {tripImage ? (
            <img
                src={getMediaUrl(tripImage)}
                alt={`${name}'s trip`}
                className="w-full h-full object-cover md:cursor-zoom-in"
                onClick={(e) => {
                    if (window.innerWidth >= 768 && !isExpanded) {
                        setIsZoomed(true);
                    }
                }}
            />
          ) : picture ? (
            <img
                src={getMediaUrl(picture)}
                alt={`${name}'s profile`}
                className="w-full h-full object-cover md:cursor-zoom-in"
                onClick={(e) => {
                    if (window.innerWidth >= 768 && !isExpanded) {
                        setIsZoomed(true);
                    }
                }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-light to-accent-indigo/10 flex items-center justify-center p-12">
                <Avatar className="w-32 h-32 md:w-48 md:h-48 border-8 border-ui-white shadow-2xl shrink-0 ring-1 ring-ui-border/50">
                    <AvatarFallback className="text-5xl md:text-7xl bg-white text-brand font-black">{username?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </div>
          )}
          
          {/* Action Overlay */}
          <div className="absolute top-6 right-6 z-20">
            {user?.id !== user_id && (
                <Button 
                    id="trip-connect"
                    onClick={handleConnectRequest}
                    disabled={isPending}
                    className={`px-6 py-3 rounded-full font-black uppercase tracking-tighter text-xs shadow-2xl transition-all active:scale-95 border-4 border-white ${isPending ? 'bg-ui-muted text-white cursor-default' : 'bg-brand text-white hover:bg-brand-hover'}`}
                >
                    {isPending ? 'Pending' : 'Connect'}
                </Button>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div 
          className={`
            transition-all duration-700 ease-in-out z-10 overflow-hidden flex flex-col bg-ui-white
            /* Desktop Layout: Ensure full height and specific column span */
            ${isExpanded ? 'md:absolute md:inset-0 md:w-full md:z-30 md:h-full shadow-none' : 'md:col-span-3 md:relative md:border-l md:border-ui-border/50 md:h-full md:shadow-[-20px_0_60px_rgba(0,0,0,0.1)]'}
            /* Mobile Layout: Dynamic height */
            w-full flex-grow cursor-pointer
            ${mobileFocus === 'text' ? 'h-[85%]' : (mobileFocus === 'image' ? 'h-[15%]' : 'h-1/2')}
          `}
          onClick={toggleMobileText}
        >
          
          {!isExpanded ? (
            /* Normal View - High Stability */
            <div className="p-8 md:p-10 flex flex-col h-full animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
              <div className="mb-4">
                <Link to={`/app/profile/${username}`} onClick={(e) => e.stopPropagation()}>
                  <h2 className="text-2xl md:text-3xl font-black text-ui-text-main mb-1 hover:text-brand transition-colors italic tracking-tighter uppercase leading-tight">{name}</h2>
                </Link>
                <div className="flex items-center justify-between">
                    <Link to={`/app/profile/${username}`} onClick={(e) => e.stopPropagation()}>
                        <p className="text-sm font-bold text-brand">@{username}</p>
                    </Link>
                    <div className="md:hidden text-[8px] font-black text-ui-muted uppercase tracking-[0.2em] animate-pulse">
                        {mobileFocus === 'text' ? 'Tap to collapse' : 'Tap for details'}
                    </div>
                </div>
              </div>
              
              <div className="border-t border-ui-border pt-4 mt-auto flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-[9px] uppercase tracking-[0.3em] text-ui-muted">Discovery</h3>
                  <div className="flex gap-2">
                    <span id="trip-seats-left" className="text-[9px] font-black uppercase tracking-widest bg-success/10 text-success px-3 py-1 rounded-full border border-success/20 animate-pulse">
                        {seatsLeft > 0 ? `${seatsLeft} Seats Left` : 'Full'}
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-brand/10 text-brand px-3 py-1 rounded-full border border-brand/20">
                        {region} • {country}
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-ui-bg-alt rounded-2xl border border-ui-border text-center shadow-inner">
                        <p className="text-[9px] font-black text-ui-muted uppercase tracking-widest mb-1">Departure</p>
                        <p className="text-xs font-bold text-ui-text-main">{from}</p>
                    </div>
                    <div className="p-3 bg-ui-bg-alt rounded-2xl border border-ui-border text-center shadow-inner">
                        <p className="text-[9px] font-black text-ui-muted uppercase tracking-widest mb-1">Arrival</p>
                        <p className="text-xs font-bold text-ui-text-main">{to}</p>
                    </div>
                </div>

                <div className="flex items-center justify-center py-2 bg-ui-bg-alt rounded-2xl">
                  <CalendarIcon />
                  <p className="text-[9px] font-black uppercase tracking-widest text-ui-text-secondary ml-2">{dates}</p>
                </div>
                
                <p className="text-xs text-ui-text-secondary font-medium bg-ui-white p-4 rounded-[1.5rem] border-2 border-dashed border-ui-border italic leading-relaxed text-center shadow-sm">
                "{message}"
                </p>
              </div>
            </div>
          ) : (
            /* Profile Expansion View - Covers whole box and scrollable */
            <div className="p-10 h-full flex flex-col animate-in slide-in-from-right-12 duration-700 bg-ui-white/95 backdrop-blur-3xl overflow-y-auto no-scrollbar shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-10 mb-10 pb-10 border-b border-ui-border shrink-0">
                  <Avatar className="w-24 h-24 md:w-40 md:h-40 border-8 border-ui-white shadow-2xl shrink-0 ring-1 ring-ui-border/50">
                      <AvatarImage src={getMediaUrl(picture)} className="object-cover" />
                      <AvatarFallback className="text-5xl bg-brand-light text-brand font-bold">{username?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center md:text-left pt-2">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                        <h2 className="text-3xl md:text-4xl font-black text-ui-text-main italic tracking-tighter uppercase">{name}</h2>
                        {verification_status === 'verified' && (
                            <div className="bg-success/10 text-success p-1 rounded-full" title="Verified Explorer">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.172a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        )}
                        <span className="bg-brand/10 text-brand text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-brand/20">Explorer</span>
                      </div>
                      
                      <div className="flex items-center justify-center md:justify-start gap-12 mb-8">
                          <div className="text-center"><p className="text-3xl font-black text-ui-text-main leading-none">32</p><p className="text-[10px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-2">Posts</p></div>
                          <div className="text-center border-x border-ui-border/50 px-12"><p className="text-3xl font-black text-ui-text-main leading-none">1.2k</p><p className="text-[10px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-2">Followers</p></div>
                          <div className="text-center"><p className="text-3xl font-black text-ui-text-main leading-none">480</p><p className="text-[10px] font-bold text-ui-muted uppercase tracking-[0.2em] mt-2">Following</p></div>
                      </div>

                      <p className="text-sm text-ui-text-secondary leading-relaxed max-w-2xl mb-8 italic font-medium">
                          {bio || "Passionate traveler exploring the hidden gems of the world. Always looking for new adventures and cultural experiences."}
                      </p>

                      {/* Unified Connect Button is already in the Action Overlay above */}
                  </div>
              </div>

              <div className="space-y-12">
                  <div className="bg-ui-white/80 backdrop-blur-sm rounded-[2.5rem] p-8 border border-ui-border shadow-sm">
                      <h3 className="text-lg font-black text-ui-text-main italic mb-8 uppercase tracking-widest flex items-center gap-2">
                          <InfoIcon /> Trip Strategy Details
                      </h3>
                      <div className="space-y-8 text-left">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Where are you starting from?</p>
                                <div className="flex items-center gap-2 text-ui-text-main">
                                    <LocationPinIcon />
                                    <p className="text-sm font-bold">{from}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">What is your final destination?</p>
                                <div className="flex items-center gap-2 text-ui-text-main">
                                    <LocationPinIcon />
                                    <p className="text-sm font-bold">{to} ({country})</p>
                                </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Planned Dates</p>
                                <div className="flex items-center gap-2 text-ui-text-main">
                                    <CalendarIcon />
                                    <p className="text-sm font-bold">{dates}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Adventure Style</p>
                                <div className="px-3 py-1 bg-brand/5 border border-brand/20 rounded-full inline-block">
                                    <p className="text-xs font-black text-brand uppercase">{category || 'Universal Explorer'}</p>
                                </div>
                            </div>
                          </div>
                          <div className="space-y-3 pt-4 border-t border-ui-border/50">
                              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Personal Message:</p>
                              <div className="bg-ui-bg-alt/30 p-5 rounded-2xl border border-ui-border/50 relative">
                                  <p className="text-sm text-ui-text-secondary leading-relaxed italic font-medium">"{message}"</p>
                              </div>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-ui-muted mb-8">Shared Moments</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[1, 2, 3, 4].map(i => (
                              <div key={i} className="aspect-square rounded-[2rem] bg-ui-bg-alt overflow-hidden group/item relative cursor-pointer shadow-xl border border-ui-border/50">
                                  <img src={`https://images.unsplash.com/photo-${1500000000000 + i*9000}?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80`} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" alt="" />
                                  <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                      <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  
                  <div className="pb-6">
                    {/* Simplified view for presentation */}
                  </div>
              </div>
            </div>
          )}

        </div>
      </div>
      
      {/* Zoom Modal */}
      {isZoomed && commonImgSrc && (
        <div className="fixed inset-0 z-[1000] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setIsZoomed(false)}>
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <img src={commonImgSrc} alt="Zoomed view" className="w-full h-full object-contain rounded-lg" />
            <button className="absolute -top-12 right-0 text-white hover:text-brand transition-colors" onClick={(e) => { e.stopPropagation(); setIsZoomed(false); }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripCard;
