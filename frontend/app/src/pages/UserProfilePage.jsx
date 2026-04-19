import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getUserDetail, getTrips, getExperiences } from '../services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TripCard from '../components/TripCard';

const UserProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('moments');

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError(null);
            try {
                const profileRes = await getUserDetail(username);
                const userData = profileRes.data;
                setUser(userData);
                
                // Fetch trips for this user specifically
                const tripsRes = await getTrips('', '', '', '', {}, userData.username);
                setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : (tripsRes.data.results || []));
                
                // Fetch experiences (services) if they are a guide/service
                if (userData.account_type !== 'traveller') {
                    const expRes = await getExperiences('', '', '', '', {}, userData.username);
                    setExperiences(Array.isArray(expRes.data) ? expRes.data : (expRes.data.results || []));
                }
            } catch (err) {
                console.error('UserProfilePage: Fetch error:', err);
                setError(err.response?.data?.detail || err.message || 'Failed to load user profile.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchProfileData();
    }, [username]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ui-bg">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand mb-4"></div>
                    <p className="text-ui-text-secondary text-sm font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-ui-bg">
                <div className="max-w-md w-full bg-ui-white p-8 rounded-3xl shadow-xl border border-ui-border text-center">
                    <div className="w-20 h-20 bg-error-light text-error rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-ui-text-main mb-2">Oops!</h2>
                    <p className="text-ui-text-secondary mb-8">{error || 'User not found'}</p>
                    <div className="flex flex-col gap-3">
                        <button onClick={() => window.location.reload()} className="w-full py-3 bg-brand text-white rounded-xl font-bold shadow-lg hover:bg-brand-hover transition-all">Try Again</button>
                        <button onClick={() => navigate('/app')} className="w-full py-3 bg-ui-bg-alt text-ui-text-main rounded-xl font-bold border border-ui-border hover:bg-ui-border/30 transition-all">Back to Home</button>
                    </div>
                </div>
            </div>
        );
    }

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    return (
        <div className="min-h-screen bg-ui-bg animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-12 text-center md:text-left gap-6 md:gap-10">
                    <Avatar className="w-28 h-28 md:w-40 md:h-40 border-4 border-ui-white shadow-2xl">
                        <AvatarImage src={user.profile_picture} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-brand-light text-brand">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 flex flex-col pt-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
                            <h1 className="text-3xl md:text-4xl font-black text-ui-text-main tracking-tight italic">{user.username}</h1>
                            {user.account_type && user.account_type !== 'traveller' && (
                                <span className="bg-brand/10 text-brand text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-[0.2em] border border-brand/20">{user.account_type}</span>
                            )}
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-8 mb-6">
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-ui-text-main">{user.posts_count || 0}</span>
                                <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-1">Posts</span>
                            </div>
                            <div className="flex flex-col border-l border-ui-border pl-8">
                                <span className="text-xl font-black text-ui-text-main">{user.followers_count || 0}</span>
                                <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-1">Followers</span>
                            </div>
                            <div className="flex flex-col border-l border-ui-border pl-8">
                                <span className="text-xl font-black text-ui-text-main">{user.following_count || 0}</span>
                                <span className="text-[10px] font-bold text-ui-muted uppercase tracking-widest mt-1">Following</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {(user.city || user.country) && (
                                <p className="text-sm font-bold text-brand flex items-center justify-center md:justify-start gap-1.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {[user.city, user.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {user.bio && <p className="text-ui-text-secondary text-sm md:text-base leading-relaxed max-w-xl">{user.bio}</p>}
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="border-t border-ui-border pt-6">
                    <Tabs defaultValue="moments" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-10 bg-ui-bg-alt rounded-2xl p-1">
                            <TabsTrigger value="moments" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-ui-white data-[state=active]:shadow-md">Moments</TabsTrigger>
                            <TabsTrigger value="trips" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-ui-white data-[state=active]:shadow-md">Trips</TabsTrigger>
                            {user.account_type !== 'traveller' && (
                                <TabsTrigger value="services" className="rounded-xl font-bold text-xs uppercase tracking-widest data-[state=active]:bg-ui-white data-[state=active]:shadow-md">Services</TabsTrigger>
                            )}
                        </TabsList>

                        <TabsContent value="moments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {user.posts && user.posts.length > 0 ? (
                                <div className="grid grid-cols-3 gap-1 md:gap-4 lg:gap-6">
                                    {user.posts.map(post => {
                                        const displayMedia = (post.images && post.images.length > 0) ? post.images[0].image : post.media_file;
                                        
                                        return (
                                            <div key={post.id} onClick={() => navigate(`/app/posts/${post.id}`, { state: { background: { pathname: `/app/profile/${username}` } } })} className="relative aspect-square group overflow-hidden bg-ui-bg-alt rounded-xl cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
                                                {displayMedia ? (
                                                    displayMedia.toLowerCase().endsWith('.mp4') ? (
                                                        <video src={getMediaUrl(displayMedia)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={getMediaUrl(displayMedia)} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    )
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-brand-light/30 to-accent-indigo/10">
                                                        <p className="text-[10px] md:text-xs font-medium text-ui-text-secondary line-clamp-4 italic">"{post.caption || 'No caption'}"</p>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                                                    <div className="flex gap-4 text-white scale-90 group-hover:scale-100 transition-transform duration-300">
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                            <span className="font-black text-sm">{post.likes_count || 0}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l4-4V5a2 2 0 012-2h6a2 2 0 012 2v10z"/></svg>
                                                            <span className="font-black text-sm">{post.comments_count || 0}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : <EmptyState icon="moments" title="No Moments Shared" description="This explorer hasn't posted any photos yet." />}
                        </TabsContent>

                        <TabsContent value="trips" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {trips.length > 0 ? (
                                <div className="space-y-6">
                                    {trips.map(trip => (
                                        <TripCard key={trip.id} trip={{
                                            ...trip,
                                            user_id: trip.author?.id,
                                            is_following: trip.author?.is_following,
                                            picture: trip.author?.profile_picture,
                                            name: trip.author?.username,
                                            username: trip.author?.username,
                                            bio: trip.author?.bio,
                                            from: trip.origin,
                                            to: trip.destination,
                                            country: trip.destination_country,
                                            dates: `${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}`
                                        }} />
                                    ))}
                                </div>
                            ) : <EmptyState icon="trips" title="No Trips Posted" description="This explorer hasn't planned any trips yet." />}
                        </TabsContent>

                        <TabsContent value="services" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {experiences.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {experiences.map(exp => (
                                        <Card key={exp.id} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                                            <img src={exp.images?.[0]?.image || 'https://images.unsplash.com/photo-1440778303588-435521a205bc?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80'} className="w-full h-48 object-cover" alt={exp.title} />
                                            <CardContent className="p-4">
                                                <h4 className="font-bold text-lg mb-1">{exp.title}</h4>
                                                <p className="text-brand font-black">${exp.price} {exp.currency}</p>
                                                <p className="text-xs text-ui-muted mt-2 line-clamp-2">{exp.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                             ) : <EmptyState icon="services" title="No Services" description="No experiences or services listed yet." />}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-24 bg-ui-white/50 rounded-[2.5rem] border-2 border-dashed border-ui-border">
        <div className="w-20 h-20 bg-ui-bg-alt text-ui-muted rounded-full flex items-center justify-center mb-6">
            {icon === 'moments' && <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            {icon === 'trips' && <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
            {icon === 'services' && <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
        </div>
        <h3 className="text-lg font-bold text-ui-text-main mb-1">{title}</h3>
        <p className="text-ui-text-secondary text-sm">{description}</p>
    </div>
);

export default UserProfilePage;
