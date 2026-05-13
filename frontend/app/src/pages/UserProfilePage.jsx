import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    getUserDetail, 
    getTrips, 
    getExperiences, 
    deletePost, 
    deletePostsBatch,
    updatePost,
    getFollowers,
    getFollowing,
    deleteService,
    reportUser,
    blockUser
} from '../services/api';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import TripCard from '../components/TripCard';
import { 
    Trash2, 
    Edit3, 
    Check, 
    X, 
    Settings, 
    Lock, 
    Globe, 
    Compass,
    Users as UsersIcon,
    MoreVertical,
    CheckCircle2,
    Sparkles,
    Save,
    Heart,
    MapPin,
    Clock,
    Plus,
    Camera,
    GripVertical,
    ShieldCheck,
    ChevronRight
} from "lucide-react";

const UserProfilePage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();
    const [user, setUser] = useState(null);
    const [trips, setTrips] = useState([]);
    const [experiences, setExperiences] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('moments');

    // Follower/Following state
    const [isFollowModalOpen, setIsFollowModalOpen] = useState(false);
    const [followModalType, setFollowModalType] = useState('followers'); // 'followers' or 'following'
    const [followList, setFollowList] = useState([]);
    const [followListLoading, setFollowListLoading] = useState(false);

    // Report State
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [isReporting, setIsReporting] = useState(false);

    // Selection & Edit State
    const [isSelectMode, setIsSelectMode] = useState(false);
    const [selectedPosts, setSelectedPosts] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    
    // New Advanced Image Management State
    // List of { type: 'existing'|'new', id?: number, file?: File, preview: string }
    const [orderedMedia, setOrderedMedia] = useState([]);
    const fileInputRef = useRef(null);
    const [draggedIndex, setDragIndex] = useState(null);

    const isOwner = currentUser?.username === username;
    const missingFieldsText = user?.missing_fields?.map(f => f.replace(/_/g, ' ')).join(', ');

    const fetchProfileData = async () => {
        setLoading(true);
        setError(null);
        try {
            const profileRes = await getUserDetail(username);
            const userData = profileRes.data;
            setUser(userData);
            
            const tripsRes = await getTrips('', '', '', '', {}, userData.username);
            setTrips(Array.isArray(tripsRes.data) ? tripsRes.data : (tripsRes.data.results || []));
            
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

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const togglePostSelection = (postId) => {
        setSelectedPosts(prev => 
            prev.includes(postId) 
                ? prev.filter(id => id !== postId) 
                : [...prev, postId]
        );
    };

    const handleDeleteSelected = async () => {
        if (!window.confirm(`Delete ${selectedPosts.length} selected moments?`)) return;
        try {
            await deletePostsBatch(selectedPosts);
            toast.success(`Deleted ${selectedPosts.length} posts`);
            setUser(prev => ({
                ...prev,
                posts: prev.posts.filter(p => !selectedPosts.includes(p.id))
            }));
            setSelectedPosts([]);
            setIsSelectMode(false);
        } catch (err) {
            console.error(err);
            toast.error("Batch delete failed");
        }
    };

    const openEditModal = (post) => {
        setEditingPost(post);
        setEditFormData({
            caption: post.caption || '',
            audience: post.audience || 'public',
            status: post.status || 'published'
        });

        // Initialize ordered media from existing post images
        const existing = (post.images || []).map(img => ({
            type: 'existing',
            id: img.id,
            preview: getMediaUrl(img.image)
        }));
        
        // Also add the main media_file if it's not in images (legacy support)
        if (post.media_file && existing.length === 0) {
            existing.push({
                type: 'existing_main',
                preview: getMediaUrl(post.media_file)
            });
        }

        setOrderedMedia(existing);
        setIsEditModalOpen(true);
    };

    const openFollowModal = async (type) => {
        setFollowModalType(type);
        setIsFollowModalOpen(true);
        setFollowListLoading(true);
        try {
            const res = type === 'followers' ? await getFollowers(username) : await getFollowing(username);
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setFollowList(data);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to load ${type}`);
        } finally {
            setFollowListLoading(false);
        }
    };

    const handleReport = async () => {
        if (!reportReason.trim()) return;
        setIsReporting(true);
        try {
            await reportUser(user.id, reportReason);
            toast.success("User reported. Thank you for helping keep Linkler safe.");
            setIsReportModalOpen(false);
            setReportReason('');
        } catch (err) {
            toast.error("Failed to submit report.");
        } finally {
            setIsReporting(false);
        }
    };

    const handleBlock = async () => {
        if (!window.confirm(`Are you sure you want to block ${user.username}? They won't be able to message you or see your content.`)) return;
        try {
            await blockUser(user.id);
            toast.success(`${user.username} has been blocked.`);
            navigate('/app');
        } catch (err) {
            toast.error("Failed to block user.");
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const newItems = files.map(file => ({
            type: 'new',
            file: file,
            preview: URL.createObjectURL(file)
        }));
        setOrderedMedia(prev => [...prev, ...newItems]);
    };

    const removeMediaItem = (index) => {
        setOrderedMedia(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and Drop Logic
    const onDragStart = (index) => setDragIndex(index);
    const onDragOver = (e) => e.preventDefault();
    const onDrop = (index) => {
        if (draggedIndex === null) return;
        const items = [...orderedMedia];
        const draggedItem = items[draggedIndex];
        items.splice(draggedIndex, 1);
        items.splice(index, 0, draggedItem);
        setOrderedMedia(items);
        setDragIndex(null);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const loadingToast = toast.loading("Updating moment...");
        try {
            const formData = new FormData();
            formData.append('caption', editFormData.caption);
            formData.append('audience', editFormData.audience);
            formData.append('status', editFormData.status);
            
            // Build the image_order and gather new files
            const newFiles = [];
            orderedMedia.forEach((item, idx) => {
                if (item.type === 'existing') {
                    formData.append('image_order', `id:${item.id}`);
                } else if (item.type === 'new') {
                    formData.append('image_order', `file:${newFiles.length}`);
                    newFiles.push(item.file);
                }
            });

            newFiles.forEach(file => {
                formData.append('images', file);
            });
            
            const res = await updatePost(editingPost.id, formData);
            
            setUser(prev => ({
                ...prev,
                posts: prev.posts.map(p => p.id === editingPost.id ? res.data : p)
            }));
            
            toast.success("Post updated successfully", { id: loadingToast });
            setIsEditModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update post", { id: loadingToast });
        }
    };

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
                    <h2 className="text-2xl font-bold text-ui-text-main mb-2">Oops!</h2>
                    <p className="text-ui-text-secondary mb-8">{error || 'User not found'}</p>
                    <button onClick={() => navigate('/app')} className="w-full py-3 bg-brand text-white rounded-xl font-bold">Back to Home</button>
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
        <div className="min-h-screen bg-ui-bg animate-in fade-in duration-500 pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
                {/* Completeness / Verification Alert */}
                {isOwner && (!user?.is_profile_complete || user?.verification_status !== 'verified') && (
                    <Card className="mb-12 rounded-[2.5rem] border-none shadow-xl bg-warning/5 border border-warning/20 p-8 flex flex-col md:flex-row items-center justify-between gap-8 animate-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-warning/10 text-warning rounded-3xl flex items-center justify-center shadow-inner border border-warning/20">
                                <ShieldCheck className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-tight text-ui-text-main">
                                    {!user?.is_profile_complete ? 'Complete Your Profile' : 'Verification Pending'}
                                </h3>
                                <p className="text-sm text-ui-muted font-medium max-w-md mt-1">
                                    {!user?.is_profile_complete 
                                        ? `You're missing: ${missingFieldsText || 'required info'}. Finish setup to unlock all features.`
                                        : "Your documents are under review. A verification badge will appear once approved."
                                    }
                                </p>
                            </div>
                        </div>
                        <Button 
                            onClick={() => navigate(!user?.is_profile_complete ? '/app/complete-profile' : '/app/verify')}
                            className="rounded-2xl bg-warning hover:bg-warning-hover text-ui-text-main font-black uppercase tracking-widest text-[10px] px-10 h-14 shadow-lg shadow-warning/20 transition-all hover:scale-105 active:scale-95"
                        >
                            {!user?.is_profile_complete ? 'Complete Now' : 'Check Documents'}
                        </Button>
                    </Card>
                )}

                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start mb-12 text-center md:text-left gap-6 md:gap-10">
                    <Avatar className="w-28 h-28 md:w-40 md:h-40 border-4 border-ui-white shadow-2xl ring-1 ring-ui-border/30">
                        <AvatarImage src={user.profile_picture} className="object-cover" />
                        <AvatarFallback className="text-4xl bg-brand-light text-brand font-black">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 flex flex-col pt-2 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex flex-col md:flex-row md:items-center gap-3">
                                <h1 className="text-3xl md:text-4xl font-black text-ui-text-main tracking-tighter italic uppercase">{user.username}</h1>
                                {user.is_pro && (
                                    <span className="bg-brand/10 text-brand text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-brand/20 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> Pro Business
                                    </span>
                                )}
                                {user.account_type && user.account_type !== 'traveller' && (
                                    <span className="bg-success/10 text-success text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-success/20">Verified {user.account_type}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 self-center md:self-auto">
                                {isOwner ? (
                                    <Button onClick={() => navigate('/app/settings')} variant="outline" size="sm" className="rounded-xl font-bold text-[10px] uppercase tracking-widest border-ui-border bg-white shadow-sm">
                                        <Settings className="w-3.5 h-3.5 mr-2" /> Edit Profile
                                    </Button>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="icon" className="rounded-xl border-ui-border bg-white shadow-sm h-9 w-9">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl border-ui-border shadow-xl">
                                            <DropdownMenuItem onClick={() => setIsReportModalOpen(true)} className="text-warning font-bold flex items-center gap-2 cursor-pointer focus:bg-warning/5 rounded-xl">
                                                <ShieldCheck className="w-4 h-4" /> Report User
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={handleBlock} className="text-error font-bold flex items-center gap-2 cursor-pointer focus:bg-error/5 rounded-xl">
                                                <X className="w-4 h-4" /> Block User
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-12 mb-8 bg-ui-white/50 backdrop-blur-md p-6 rounded-3xl border border-ui-border/30 shadow-inner">
                            <div className="text-center">
                                <p className="text-2xl font-black text-ui-text-main leading-none">{user.posts_count || 0}</p>
                                <p className="text-[10px] font-black text-ui-muted uppercase tracking-[0.2em] mt-2">Moments</p>
                            </div>
                            <div 
                                className={`text-center border-x border-ui-border/50 px-12 ${(user.show_followers_list || isOwner) ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                                onClick={() => (user.show_followers_list || isOwner) && openFollowModal('followers')}
                            >
                                <p className="text-2xl font-black text-ui-text-main leading-none">{(user.show_followers_list || isOwner) ? (user.followers_count || 0) : '—'}</p>
                                <p className="text-[10px] font-black text-ui-muted uppercase tracking-[0.2em] mt-2">Explorers</p>
                            </div>
                            <div 
                                className={`text-center ${(user.show_followers_list || isOwner) ? 'cursor-pointer hover:opacity-70 transition-opacity' : ''}`}
                                onClick={() => (user.show_followers_list || isOwner) && openFollowModal('following')}
                            >
                                <p className="text-2xl font-black text-ui-text-main leading-none">{(user.show_followers_list || isOwner) ? (user.following_count || 0) : '—'}</p>
                                <p className="text-[10px] font-black text-ui-muted uppercase tracking-[0.2em] mt-2">Following</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {(user.city || user.country) && (
                                <p className="text-xs font-black text-brand flex items-center justify-center md:justify-start gap-2 uppercase tracking-widest">
                                    <MapPin className="w-4 h-4" />
                                    {[user.city, user.country].filter(Boolean).join(', ')}
                                </p>
                            )}
                            {user.bio && <p className="text-ui-text-secondary text-sm md:text-base leading-relaxed max-w-xl font-medium italic opacity-80">"{user.bio}"</p>}
                        </div>
                    </div>
                </div>

                {/* Tabs Section */}
                <div className="border-t border-ui-border/50 pt-8">
                    <Tabs defaultValue="moments" value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                            <TabsList className="bg-ui-bg-alt rounded-2xl p-1 shadow-sm border border-ui-border/30">
                                <TabsTrigger value="moments" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-ui-white data-[state=active]:shadow-md">Moments</TabsTrigger>
                                <TabsTrigger value="trips" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-ui-white data-[state=active]:shadow-md">Trips</TabsTrigger>
                                {user.account_type !== 'traveller' && (
                                    <TabsTrigger value="services" className="rounded-xl px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-ui-white data-[state=active]:shadow-md">Services</TabsTrigger>
                                )}
                            </TabsList>

                            {activeTab === 'moments' && isOwner && user.posts?.length > 0 && (
                                <div className="flex items-center gap-3">
                                    {isSelectMode ? (
                                        <>
                                            <Button onClick={handleDeleteSelected} disabled={selectedPosts.length === 0} variant="destructive" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest px-4 h-10 shadow-lg shadow-error/20">
                                                Delete Selected ({selectedPosts.length})
                                            </Button>
                                            <Button onClick={() => { setIsSelectMode(false); setSelectedPosts([]); }} variant="ghost" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest h-10">
                                                Cancel
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setIsSelectMode(true)} variant="outline" size="sm" className="rounded-xl font-black text-[9px] uppercase tracking-widest px-4 h-10 bg-white shadow-sm border-ui-border">
                                            Select Moments
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        <TabsContent value="moments" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {user.posts && user.posts.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 md:gap-6">
                                    {user.posts.map(post => {
                                        const displayMedia = (post.images && post.images.length > 0) ? post.images[0].image : post.media_file;
                                        const isSelected = selectedPosts.includes(post.id);
                                        
                                        return (
                                            <div 
                                                key={post.id} 
                                                onClick={() => isSelectMode ? togglePostSelection(post.id) : navigate(`/app/posts/${post.id}`, { state: { background: { pathname: `/app/profile/${username}` } } })} 
                                                className={`relative aspect-square group overflow-hidden bg-ui-bg-alt rounded-3xl cursor-pointer shadow-sm transition-all duration-500 ring-offset-4 ${isSelectMode && isSelected ? 'ring-4 ring-brand scale-95 shadow-xl' : 'hover:shadow-2xl'}`}
                                            >
                                                {displayMedia ? (
                                                    displayMedia.toLowerCase().endsWith('.mp4') ? (
                                                        <video src={getMediaUrl(displayMedia)} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={getMediaUrl(displayMedia)} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                    )
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center p-4 text-center bg-gradient-to-br from-brand-light/30 to-accent-indigo/10">
                                                        <p className="text-[10px] md:text-xs font-medium text-ui-text-secondary line-clamp-4 italic">"{post.caption || 'No caption'}"</p>
                                                    </div>
                                                )}
                                                
                                                {/* Edit/Delete Overlay for Owner */}
                                                {!isSelectMode && isOwner && (
                                                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 duration-300">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); openEditModal(post); }}
                                                            className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-ui-text-main shadow-lg hover:bg-brand hover:text-white transition-all"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button 
                                                            onClick={async (e) => { 
                                                                e.stopPropagation(); 
                                                                if(window.confirm("Delete this moment?")) {
                                                                    await deletePost(post.id);
                                                                    setUser(prev => ({...prev, posts: prev.posts.filter(p => p.id !== post.id)}));
                                                                    toast.success("Moment deleted");
                                                                }
                                                            }}
                                                            className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-error shadow-lg hover:bg-error hover:text-white transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}

                                                {/* Selection Checkbox */}
                                                {isSelectMode && (
                                                    <div className={`absolute inset-0 flex items-center justify-center transition-all ${isSelected ? 'bg-brand/20' : 'bg-black/10'}`}>
                                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand border-brand shadow-lg scale-110' : 'border-white bg-transparent'}`}>
                                                            {isSelected && <Check className="w-5 h-5 text-white stroke-[4]" />}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex gap-3 text-white">
                                                        <div className="flex items-center gap-1">
                                                            <Heart className="w-3.5 h-3.5 fill-current" />
                                                            <span className="text-[10px] font-black">{post.likes_count || 0}</span>
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
                                            verification_status: trip.author?.verification_status,
                                            is_following: trip.author?.is_following,
                                            picture: trip.author?.profile_picture,
                                            name: trip.author?.username,
                                            username: trip.author?.username,
                                            bio: trip.author?.bio,
                                            from: trip.origin,
                                            to: trip.destination,
                                            country: trip.destination_country,
                                            region: trip.region,
                                            category: trip.category,
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
                                        <Card key={exp.id} className="rounded-3xl overflow-hidden border border-ui-border/50 shadow-xl bg-white group">
                                            <div className="h-48 overflow-hidden relative bg-ui-bg-alt">
                                                {exp.images?.[0]?.image ? (
                                                    <img src={getMediaUrl(exp.images[0].image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={exp.title} />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-ui-muted">
                                                        <Globe className="w-12 h-12 opacity-20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4 bg-ui-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-brand border border-brand/10 shadow-lg">
                                                    {exp.currency} {exp.price}
                                                </div>
                                                
                                                {/* Edit/Delete for Owner */}
                                                {isOwner && (
                                                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-300">
                                                        <button 
                                                            onClick={() => navigate('/app/dashboard')}
                                                            className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-ui-text-main shadow-lg hover:bg-brand hover:text-white transition-all"
                                                            title="Edit in Dashboard"
                                                        >
                                                            <Edit3 className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                           onClick={async () => {
                                                               if(window.confirm("Delete this service?")) {
                                                                   await deleteService(exp.id);
                                                                   setExperiences(prev => prev.filter(e => e.id !== exp.id));
                                                                   toast.success("Service deleted");
                                                               }
                                                           }}                                                            className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-error shadow-lg hover:bg-error hover:text-white transition-all"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                            <CardContent className="p-6">
                                                <h4 className="font-black text-lg mb-2 italic uppercase tracking-tight group-hover:text-brand transition-colors">{exp.title}</h4>
                                                <p className="text-xs text-ui-text-secondary mt-3 line-clamp-2 italic font-medium opacity-80">"{exp.description}"</p>
                                                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-ui-border/50">
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-ui-muted"><Clock className="w-3 h-3" /> {exp.duration}</div>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-ui-muted"><MapPin className="w-3 h-3" /> {exp.location}</div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                             ) : <EmptyState icon="services" title="No Services" description="No experiences or services listed yet." />}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* Advanced Edit Moment Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] p-0 border-none bg-ui-white shadow-2xl overflow-hidden">
                    <div className="flex flex-col h-[85vh]">
                        <DialogHeader className="p-8 pb-4 border-b border-ui-border/50 shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-ui-text-main">Manage Moment</DialogTitle>
                                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-brand">Reorder, add or remove images</DialogDescription>
                                </div>
                                <Button 
                                    onClick={handleEditSubmit} 
                                    className="rounded-2xl bg-brand text-white font-black uppercase tracking-widest text-xs px-8 h-12 shadow-xl shadow-brand/20"
                                >
                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                </Button>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-8 pt-6 space-y-10">
                            {/* Image Management Section */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted">Visual Gallery</Label>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="rounded-xl border-dashed border-2 border-brand/30 text-brand font-black text-[10px] uppercase tracking-widest hover:bg-brand/5"
                                    >
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Add More
                                    </Button>
                                    <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileChange} accept="image/*,video/*" />
                                </div>

                                <div className="p-6 bg-ui-bg-alt/50 rounded-[2.5rem] border-2 border-ui-border/50 shadow-inner">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {orderedMedia.map((item, index) => (
                                            <div 
                                                key={index}
                                                draggable
                                                onDragStart={() => onDragStart(index)}
                                                onDragOver={onDragOver}
                                                onDrop={() => onDrop(index)}
                                                className={`relative aspect-square rounded-3xl overflow-hidden bg-white border-2 border-ui-border group transition-all duration-300 cursor-move ${draggedIndex === index ? 'opacity-30 scale-90' : 'hover:shadow-xl hover:border-brand/40'}`}
                                            >
                                                <img src={item.preview} className="w-full h-full object-cover" alt="" />
                                                
                                                {/* Item Toolbar */}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                                                        <GripVertical className="w-5 h-5" />
                                                    </div>
                                                    <button 
                                                        onClick={() => removeMediaItem(index)}
                                                        className="p-2 bg-error text-white rounded-xl shadow-lg hover:scale-110 active:scale-95 transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                {/* Badge for New Items */}
                                                {item.type === 'new' && (
                                                    <div className="absolute top-2 left-2 px-2 py-1 bg-success text-white text-[8px] font-black uppercase rounded-lg shadow-md">New</div>
                                                )}
                                                
                                                {/* Position Indicator */}
                                                <div className="absolute bottom-2 left-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">{index + 1}</div>
                                            </div>
                                        ))}
                                        
                                        {orderedMedia.length === 0 && (
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="col-span-full aspect-video rounded-[2rem] bg-white border-2 border-dashed border-ui-border flex flex-col items-center justify-center cursor-pointer hover:bg-brand/5 transition-all group"
                                            >
                                                <Camera className="w-10 h-10 text-ui-muted mb-4 group-hover:scale-110 transition-transform" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted">Upload moments to get started</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted">Caption & Narrative</Label>
                                    <Textarea 
                                        value={editFormData.caption || ''} 
                                        onChange={(e) => setEditFormData({...editFormData, caption: e.target.value})}
                                        placeholder="Tell the story behind these moments..."
                                        className="min-h-[160px] rounded-[1.8rem] bg-ui-bg-alt border-none focus:ring-2 focus:ring-brand/20 font-medium italic p-6"
                                    />
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted">Visibility Settings</Label>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { val: 'public', label: 'Public', desc: 'Anyone on Linkler', icon: Globe },
                                                { val: 'followers', label: 'Followers', desc: 'Only your explorers', icon: UsersIcon },
                                                { val: 'friends', label: 'Friends', desc: 'Mutual connections only', icon: Heart },
                                                { val: 'private', label: 'Private', desc: 'Only you can see this', icon: Lock }
                                            ].map(item => (
                                                <button
                                                    key={item.val}
                                                    type="button"
                                                    onClick={() => setEditFormData({...editFormData, audience: item.val})}
                                                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${editFormData.audience === item.val ? 'border-brand bg-brand/5 shadow-md' : 'border-ui-border hover:bg-ui-bg-alt opacity-70'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${editFormData.audience === item.val ? 'bg-brand text-white shadow-lg' : 'bg-ui-bg-alt text-ui-muted'}`}>
                                                        <item.icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`text-xs font-black uppercase tracking-tight ${editFormData.audience === item.val ? 'text-brand' : 'text-ui-text-main'}`}>{item.label}</p>
                                                        <p className="text-[10px] font-medium text-ui-muted">{item.desc}</p>
                                                    </div>
                                                    {editFormData.audience === item.val && <CheckCircle2 className="w-5 h-5 text-brand" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Follower/Following Modal */}
            <Dialog open={isFollowModalOpen} onOpenChange={setIsFollowModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none bg-ui-white shadow-2xl overflow-hidden">
                    <DialogHeader className="p-8 pb-4 border-b border-ui-border/50">
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-ui-text-main">
                            {followModalType === 'followers' ? 'Explorers' : 'Following'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="max-h-[60vh] overflow-y-auto no-scrollbar p-4">
                        {followListLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                            </div>
                        ) : followList.length > 0 ? (
                            <div className="space-y-2">
                                {followList.map((fUser) => (
                                    <div 
                                        key={fUser.id} 
                                        className="flex items-center justify-between p-3 rounded-2xl hover:bg-ui-bg-alt transition-colors group cursor-pointer"
                                        onClick={() => {
                                            setIsFollowModalOpen(false);
                                            navigate(`/app/profile/${fUser.username}`);
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-12 h-12 border-2 border-ui-white shadow-sm">
                                                <AvatarImage src={fUser.profile_picture} className="object-cover" />
                                                <AvatarFallback className="bg-brand-light text-brand font-black">{fUser.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-ui-text-main text-sm">{fUser.username}</p>
                                                <p className="text-[10px] text-ui-muted uppercase tracking-widest font-black">{fUser.account_type || 'Traveler'}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-ui-muted group-hover:text-brand transition-colors" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <UsersIcon className="w-12 h-12 text-ui-muted/20 mx-auto mb-4" />
                                <p className="text-sm font-medium text-ui-muted italic">No {followModalType} yet.</p>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Report User Modal */}
            <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none bg-ui-white shadow-2xl overflow-hidden">
                    <DialogHeader className="p-8 pb-4 border-b border-ui-border/50">
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-ui-text-main">
                            Report {user?.username}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-bold uppercase tracking-widest text-warning">Help us understand the issue</DialogDescription>
                    </DialogHeader>
                    
                    <div className="p-8 space-y-6">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-ui-muted">Reason for report</Label>
                            <Textarea 
                                value={reportReason}
                                onChange={(e) => setReportReason(e.target.value)}
                                placeholder="Spam, harassment, inappropriate content, etc."
                                className="min-h-[120px] rounded-2xl bg-ui-bg-alt border-none focus:ring-2 focus:ring-warning/20 font-medium italic p-4"
                            />
                        </div>
                        <Button 
                            onClick={handleReport}
                            disabled={isReporting || !reportReason.trim()}
                            className="w-full h-14 rounded-2xl bg-warning hover:bg-warning/90 text-white font-black uppercase tracking-widest"
                        >
                            {isReporting ? 'Submitting...' : 'Submit Report'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const EmptyState = ({ icon, title, description }) => (
    <div className="flex flex-col items-center justify-center py-24 bg-ui-white/50 rounded-[2.5rem] border-2 border-dashed border-ui-border">
        <div className="w-20 h-20 bg-ui-bg-alt text-ui-muted rounded-full flex items-center justify-center mb-6">
            {icon === 'moments' && <Globe className="h-10 w-10 opacity-40" />}
            {icon === 'trips' && <Compass className="h-10 w-10 opacity-40" />}
            {icon === 'services' && <ShieldCheck className="h-10 w-10 opacity-40" />}
        </div>
        <h3 className="text-lg font-black italic uppercase tracking-tighter text-ui-text-main mb-1">{title}</h3>
        <p className="text-ui-text-secondary text-sm font-medium">{description}</p>
    </div>
);

export default UserProfilePage;
