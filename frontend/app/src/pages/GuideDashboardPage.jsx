import React, { useState, useEffect, useRef } from 'react';
import { 
    getGuideDashboardStats, 
    getBookings, 
    updateBookingStatus, 
    getNotifications, 
    markNotificationRead,
    getMyServices,
    deleteService,
    updateService,
    uploadVerificationDoc,
    getGuideAvailability,
    updateGuideAvailability
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
    BarChart3, 
    DollarSign, 
    Calendar as CalendarIcon, 
    Users, 
    CheckCircle2, 
    XCircle, 
    Clock,
    ArrowUpRight,
    ShieldCheck,
    Bell,
    Trash2,
    Edit3,
    Eye,
    TrendingUp,
    ChevronRight,
    ChevronLeft,
    MapPin,
    Save,
    Upload,
    FileText,
    Info,
    GripVertical,
    Plus,
    AlertTriangle
} from "lucide-react";

const GuideDashboardPage = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [myServices, setMyServices] = useState([]);
    const [availability, setAvailability] = useState([]);
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Verification Upload State
    const [idFile, setIdFile] = useState(null);
    const [visaFile, setVisaFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Modals state
    const [selectedDate, setSelectedDate] = useState(null);
    const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [orderedMedia, setOrderedMedia] = useState([]);
    const [draggedIndex, setDragIndex] = useState(null);
    const fileInputRef = useRef(null);

    const [currentMonth, setCurrentMonth] = useState(new Date());

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    const fetchData = async () => {
        if (!user) return;
        try {
            const [statsRes, bookingsRes, notifRes, servicesRes, availRes] = await Promise.all([
                getGuideDashboardStats(),
                getBookings(),
                getNotifications(),
                getMyServices(),
                getGuideAvailability(user.username)
            ]);
            setStats(statsRes.data);
            setBookings(Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data.results || []));
            setNotifications(Array.isArray(notifRes.data) ? notifRes.data : (notifRes.data.results || []));
            setMyServices(Array.isArray(servicesRes.data) ? servicesRes.data : (servicesRes.data.results || []));
            
            // Handle structured response: { manual_availability: [], booked_dates: [] }
            const availData = availRes.data;
            setAvailability(availData.manual_availability || []);
            setBookedDates(availData.booked_dates || []);
        } catch (err) {
            console.error(err);
            if (err.response?.status !== 403) {
                toast.error("Failed to load dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        
        if (user.account_type !== 'guide') {
            navigate('/app');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const handleUpdateStatus = async (id, status) => {
        try {
            const res = await updateBookingStatus(id, status);
            setBookings(bookings.map(b => b.id === id ? res.data : b));
            toast.success(`Booking ${status}`);
            const statsRes = await getGuideDashboardStats();
            setStats(statsRes.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update booking");
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) { console.error(err); }
    };

    const toggleAvailability = async (dateStr) => {
        const existing = availability.find(a => a.date === dateStr);
        try {
            const res = await updateGuideAvailability(user.username, {
                date: dateStr,
                is_available: existing ? !existing.is_available : false,
                reason: 'Marked manually'
            });
            
            if (existing) {
                setAvailability(availability.map(a => a.date === dateStr ? res.data : a));
            } else {
                setAvailability([...availability, res.data]);
            }
            toast.success("Availability updated");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update availability");
        }
    };

    const handleVerificationUpload = async () => {
        if (!idFile && !visaFile) return;
        setUploading(true);
        try {
            if (idFile) {
                const fd = new FormData();
                fd.append('document_type', 'id');
                fd.append('file', idFile);
                await uploadVerificationDoc(fd);
            }
            if (visaFile) {
                const fd = new FormData();
                fd.append('document_type', 'visa');
                fd.append('file', visaFile);
                await uploadVerificationDoc(fd);
            }
            toast.success("Documents uploaded successfully");
            await refreshProfile();
            setIdFile(null);
            setVisaFile(null);
        } catch (err) {
            console.error(err);
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteService = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await deleteService(id);
            setMyServices(myServices.filter(s => s.id !== id));
            toast.success("Service deleted");
        } catch (err) {
            console.error(err);
            toast.error("Delete failed");
        }
    };

    const renderCalendar = () => {
        if (!currentMonth) return null;
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        const monthName = currentMonth.toLocaleString('default', { month: 'long' });

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-ui-text-main">{monthName} {year}</h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-ui-border" onClick={() => setCurrentMonth(new Date(year, month - 1))}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-ui-border" onClick={() => setCurrentMonth(new Date(year, month + 1))}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-ui-muted py-2">{d}</div>
                    ))}
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} />;

                        const dateStr = date.toISOString().split('T')[0];
                        const avail = Array.isArray(availability) ? availability.find(a => a.date === dateStr) : null;

                        // Priority 1: Automated Bookings
                        const isBooked = bookedDates.includes(dateStr);
                        // Priority 2: Manual Blackouts (only if not already booked)
                        const isBlackout = !isBooked && avail && avail.is_available === false;

                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => !isBooked && toggleAvailability(dateStr)}
                                disabled={isBooked}
                                className={`
                                    h-14 rounded-2xl border transition-all flex flex-col items-center justify-center relative group
                                    ${isBooked ? 'bg-brand text-white border-brand shadow-lg cursor-not-allowed' : 
                                      isBlackout ? 'bg-error/10 border-error/30 text-error shadow-inner' : 
                                      'bg-ui-white border-ui-border text-ui-text-main hover:bg-ui-bg-alt'}
                                    ${isToday ? 'ring-2 ring-brand ring-offset-2 ring-offset-ui-bg' : ''}
                                `}
                            >
                                <span className="text-xs font-bold">{date.getDate()}</span>
                                {isBooked ? (
                                    <div className="w-1 h-1 rounded-full bg-white mt-1" />
                                ) : isBlackout && (
                                    <div className="w-1 h-1 rounded-full bg-error mt-1" />
                                )}

                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-brand/5 rounded-2xl pointer-events-none">
                                     <span className="text-[8px] font-black uppercase tracking-tighter text-brand">
                                        {isBooked ? 'Reserved' : (isBlackout ? 'Make Avail' : 'Blackout')}
                                     </span>
                                </div>
                            </button>
                        );
                        })}
                        </div>

                        <div className="bg-ui-bg-alt/50 p-4 rounded-2xl border border-ui-border/50 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-brand shadow-md" />
                        <span className="text-[10px] font-bold uppercase text-ui-muted">Reserved (Booked)</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-error" />
                        <span className="text-[10px] font-bold uppercase text-ui-muted">Blackout (Manual)</span>
                        </div>
                        <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-ui-white border border-ui-border" />
                        <span className="text-[10px] font-bold uppercase text-ui-muted">Available</span>
                        </div>
                        </div>            </div>
        );
    };

    const openEditModal = (service) => {
        setEditingService(service);
        setEditFormData({
            title: service.title,
            description: service.description,
            price: service.price,
            location: service.location,
            duration: service.duration
        });

        // Initialize ordered media from existing service images
        const existing = (service.images || []).map(img => ({
            type: 'existing',
            id: img.id,
            preview: getMediaUrl(img.image)
        }));
        setOrderedMedia(existing);

        setIsEditModalOpen(true);
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
        const loadingToast = toast.loading("Updating listing...");
        try {
            const formData = new FormData();
            Object.keys(editFormData).forEach(key => formData.append(key, editFormData[key]));
            
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

            const res = await updateService(editingService.id, formData);
            setMyServices(myServices.map(s => s.id === editingService.id ? res.data : s));
            toast.success("Listing updated successfully", { id: loadingToast });
            setIsEditModalOpen(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update listing", { id: loadingToast });
        }
    };

    const getBookingsForDate = (dateStr) => {
        return bookings.filter(b => b.booking_date === dateStr);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-linkler-bg)]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
            </div>
        );
    }

    const missingFieldsText = (user?.missing_fields || []).join(', ').replace(/_/g, ' ');

    return (
        <div className="min-h-screen bg-[var(--color-linkler-bg)] p-4 md:p-8 lg:p-12 animate-in fade-in duration-500 pb-24">
            <div className="max-w-6xl mx-auto space-y-8">
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand mb-2">Performance Center</p>
                        <h1 className="text-4xl font-black text-ui-text-main italic tracking-tighter uppercase">Provider Dashboard</h1>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-xl font-bold text-xs uppercase tracking-widest border-ui-border bg-ui-white shadow-sm">
                            Export Report
                        </Button>
                    </div>
                </header>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-ui-white p-1 rounded-2xl border border-ui-border shadow-sm w-fit overflow-x-auto no-scrollbar">
                        <TabsTrigger value="overview" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-brand data-[state=active]:text-white">Overview</TabsTrigger>
                        <TabsTrigger value="bookings" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-brand data-[state=active]:text-white flex gap-2">
                            Bookings {bookings.filter(b => b.status === 'pending').length > 0 && <span className="w-2 h-2 rounded-full bg-warning animate-pulse" />}
                        </TabsTrigger>
                        <TabsTrigger value="posts" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-brand data-[state=active]:text-white">My Listings</TabsTrigger>
                        <TabsTrigger value="calendar" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-brand data-[state=active]:text-white">Calendar</TabsTrigger>
                        <TabsTrigger value="verification" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-brand data-[state=active]:text-white">Verification</TabsTrigger>
                        <TabsTrigger value="notifications" className="rounded-xl px-6 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-brand data-[state=active]:text-white flex gap-2">
                            Alerts {notifications.filter(n => !n.is_read).length > 0 && <span className="bg-error text-[8px] px-1.5 py-0.5 rounded-full text-white font-black">{notifications.filter(n => !n.is_read).length}</span>}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-brand to-brand-hover text-white overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500"><BarChart3 className="w-24 h-24" /></div>
                                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Total Bookings</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-5xl font-black italic">{stats?.total_bookings || 0}</div>
                                    <p className="text-xs font-medium opacity-70 mt-2 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> Growth stable</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-ui-white overflow-hidden relative group border border-ui-border">
                                <div className="absolute top-0 right-0 p-8 text-success opacity-5 group-hover:scale-110 transition-transform duration-500"><DollarSign className="w-24 h-24" /></div>
                                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Net Earnings</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-5xl font-black text-ui-text-main italic">
                                        {stats?.currency || '$'} {stats ? Number(stats.total_earnings || 0).toLocaleString() : '0'}
                                    </div>
                                    <p className="text-xs font-medium text-success mt-2 flex items-center gap-1 font-bold">Auto-sync active</p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-[2.5rem] border-none shadow-xl bg-ui-white overflow-hidden relative group border border-ui-border">
                                <div className="absolute top-0 right-0 p-8 text-accent-indigo opacity-5 group-hover:scale-110 transition-transform duration-500"><Users className="w-24 h-24" /></div>
                                <CardHeader className="pb-2"><CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-ui-muted">Active Listings</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="text-5xl font-black text-ui-text-main italic">{myServices.length}</div>
                                    <p className="text-xs font-medium text-ui-muted mt-2">Promoted to 12k+ users</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <Card className="rounded-[2.5rem] border border-ui-border shadow-lg p-8 space-y-6 bg-ui-white">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-black italic uppercase tracking-wider text-ui-text-main">Top Performing Listing</h3>
                                    <TrendingUp className="w-5 h-5 text-success" />
                                </div>
                                {myServices.length > 0 ? (
                                    <div className="flex items-center gap-6">
                                        <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-4 ring-ui-bg-alt/50 border border-ui-border/30 bg-ui-bg-alt flex items-center justify-center">
                                            {myServices[0].images?.[0]?.image ? (
                                                <img src={getMediaUrl(myServices[0].images[0].image)} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <ShieldCheck className="w-12 h-12 text-ui-muted opacity-20" />
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            <p className="text-sm font-black uppercase tracking-tight line-clamp-1 text-ui-text-main">{myServices[0].title}</p>
                                            <div className="flex gap-4">
                                                <div><p className="text-[10px] font-black text-ui-muted uppercase">Bookings</p><p className="text-xl font-black text-brand">{myServices[0].bookings_count}</p></div>
                                                <div className="border-l border-ui-border pl-4"><p className="text-[10px] font-black text-ui-muted uppercase">Generated</p><p className="text-xl font-black text-success">${myServices[0].total_earnings}</p></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : <p className="text-ui-muted italic">No data yet.</p>}
                            </Card>

                            <Card className="rounded-[2.5rem] border border-ui-border shadow-lg p-8 bg-ui-white flex flex-col justify-center text-center space-y-4">
                                <Bell className="w-12 h-12 text-brand mx-auto opacity-20" />
                                <h3 className="font-black italic uppercase tracking-wider text-ui-text-main text-xl">Recent Notifications</h3>
                                <div className="space-y-2">
                                    {notifications.slice(0, 3).map(n => (
                                        <div key={n.id} className="text-xs py-3 px-4 bg-ui-bg-alt rounded-2xl font-medium text-ui-text-secondary flex items-center justify-between border border-ui-border/30">
                                            <span className="truncate">{n.title}</span>
                                            <span className="text-[9px] uppercase font-black text-ui-muted ml-2">{new Date(n.created_at).toLocaleDateString()}</span>
                                        </div>
                                    ))}
                                    <Button variant="ghost" onClick={() => setActiveTab('notifications')} className="text-[10px] font-black uppercase tracking-widest text-brand mt-2 hover:bg-brand/5">View All Alerts <ChevronRight className="w-3 h-3 ml-1" /></Button>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="bookings" className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black text-ui-text-main italic uppercase tracking-wider">Booking Management</h2>
                            </div>
                            <div className="space-y-4">
                                {bookings.length > 0 ? (
                                    bookings.map(booking => (
                                        <BookingCard key={booking.id} booking={booking} onUpdateStatus={handleUpdateStatus} />
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-ui-white/50 rounded-[2.5rem] border-2 border-dashed border-ui-border">
                                        <p className="text-ui-muted font-bold italic">No bookings found yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="posts" className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {myServices.map(service => (
                                <Card key={service.id} className="rounded-[2.5rem] overflow-hidden border border-ui-border shadow-xl bg-ui-white group">
                                    <div className="h-48 overflow-hidden relative bg-ui-bg-alt">
                                        {service.images?.[0]?.image ? (
                                            <img src={getMediaUrl(service.images[0].image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={service.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-ui-muted">
                                                <ShieldCheck className="w-12 h-12 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <Button size="icon" variant="secondary" className="h-10 w-10 rounded-xl bg-white/90 backdrop-blur-md shadow-lg" onClick={() => openEditModal(service)}><Edit3 className="w-4 h-4" /></Button>
                                            <Button size="icon" variant="destructive" className="h-10 w-10 rounded-xl shadow-lg" onClick={() => handleDeleteService(service.id)}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-8">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="min-w-0">
                                                <h3 className="font-black text-xl italic uppercase tracking-tighter truncate text-ui-text-main mb-1">{service.title}</h3>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${service.listing_type === 'service' ? 'bg-indigo-500 text-white' : 'bg-brand text-white'}`}>
                                                    {service.listing_type === 'service' ? 'Essential' : 'Experience'}
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-brand/10 text-brand border border-brand/20">
                                                {service.category}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-ui-border/50">
                                            <div className="p-4 bg-ui-bg-alt rounded-2xl text-center shadow-inner">
                                                <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Bookings</p>
                                                <p className="text-2xl font-black text-brand italic">{service.bookings_count}</p>
                                            </div>
                                            <div className="p-4 bg-ui-bg-alt rounded-2xl text-center shadow-inner">
                                                <p className="text-[10px] font-black uppercase text-ui-muted mb-1">Earnings</p>
                                                <p className="text-2xl font-black text-success italic">${service.total_earnings}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="calendar" className="animate-in slide-in-from-bottom-4 duration-500">
                        <Card className="rounded-[3rem] border border-ui-border shadow-2xl overflow-hidden bg-ui-white">
                            <CardContent className="p-10">
                                {renderCalendar()}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="verification" className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-4xl mx-auto space-y-8">
                            <Card className="rounded-[2.5rem] border-none shadow-2xl bg-ui-white p-10">
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 pb-10 border-b border-ui-border/50">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-inner ${user?.verification_status === 'verified' ? 'bg-success/10 text-success border border-success/20' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                            {user?.verification_status === 'verified' ? <ShieldCheck className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mb-1">Account Status</p>
                                            <h2 className="text-3xl font-black italic uppercase tracking-tight text-ui-text-main">
                                                {user?.verification_status === 'verified' ? 'Fully Verified' : (user?.verification_status === 'pending' ? 'Verification Pending' : 'Action Required')}
                                            </h2>
                                        </div>
                                    </div>
                                    {user?.verification_status === 'verified' && (
                                        <div className="bg-success/10 border border-success/30 px-6 py-3 rounded-2xl flex items-center gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-success" />
                                            <span className="text-xs font-black uppercase tracking-widest text-success">Active Badge</span>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="font-black italic uppercase tracking-wider text-ui-text-main">Update Legal Documents</h3>
                                        <p className="text-sm text-ui-text-secondary font-medium">You can update your identification files at any time. Our team will review them within 24 hours.</p>
                                        
                                        <div className="space-y-4">
                                            <div className="p-6 rounded-2xl bg-ui-bg-alt border border-ui-border flex items-center justify-between group hover:border-brand/40 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <FileText className="w-5 h-5 text-ui-muted" />
                                                    <span className="text-xs font-bold text-ui-text-main uppercase">Gov. Issued ID</span>
                                                </div>
                                                <Label className="cursor-pointer">
                                                    <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-4 py-2 rounded-xl hover:bg-brand hover:text-white transition-all">Replace</span>
                                                    <input type="file" className="hidden" onChange={(e) => setIdFile(e.target.files[0])} />
                                                </Label>
                                            </div>
                                            {idFile && <p className="text-[10px] font-bold text-success animate-in fade-in">Selected: {idFile.name}</p>}

                                            <div className="p-6 rounded-2xl bg-ui-bg-alt border border-ui-border flex items-center justify-between group hover:border-brand/40 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <Upload className="w-5 h-5 text-ui-muted" />
                                                    <span className="text-xs font-bold text-ui-text-main uppercase">Residency / Visa</span>
                                                </div>
                                                <Label className="cursor-pointer">
                                                    <span className="text-[10px] font-black text-brand uppercase tracking-widest bg-brand/10 px-4 py-2 rounded-xl hover:bg-brand hover:text-white transition-all">Replace</span>
                                                    <input type="file" className="hidden" onChange={(e) => setVisaFile(e.target.files[0])} />
                                                </Label>
                                            </div>
                                            {visaFile && <p className="text-[10px] font-bold text-success animate-in fade-in">Selected: {visaFile.name}</p>}
                                        </div>

                                        {(idFile || visaFile) && (
                                            <Button 
                                                onClick={handleVerificationUpload}
                                                disabled={uploading}
                                                className="w-full py-7 rounded-2xl bg-brand text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-brand/20 mt-4"
                                            >
                                                {uploading ? 'Processing...' : 'Save & Submit Updates'}
                                            </Button>
                                        )}
                                    </div>

                                    <div className="bg-brand/5 rounded-3xl p-8 border border-brand/10 flex flex-col justify-center gap-6">
                                        <div className="flex items-center gap-3 text-brand">
                                            <Info className="w-5 h-5" />
                                            <p className="text-[10px] font-black uppercase tracking-widest">Verification FAQ</p>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-xs font-black uppercase text-ui-text-main mb-1">Why do I need this?</p>
                                                <p className="text-[11px] text-ui-text-secondary leading-relaxed font-medium">To comply with UAE tourism laws and ensure client safety, all guides must have verified identification.</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase text-ui-text-main mb-1">Is my data safe?</p>
                                                <p className="text-[11px] text-ui-text-secondary leading-relaxed font-medium">Documents are stored on encrypted servers and only visible to authorized Linkler safety officers.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="notifications" className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-2xl mx-auto space-y-4">
                            {notifications.length > 0 ? (
                                notifications.map(notif => (
                                    <Card key={notif.id} className={`rounded-[2rem] border transition-all ${notif.is_read ? 'bg-ui-white/60 opacity-60 border-ui-border' : 'bg-ui-white border-brand shadow-lg ring-1 ring-brand/10'}`} onClick={() => handleMarkRead(notif.id)}>
                                        <CardContent className="p-6 flex items-center justify-between gap-6">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${notif.type.includes('request') ? 'bg-warning/10 text-warning' : 'bg-brand/10 text-brand'}`}>
                                                    <Bell className="w-5 h-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black uppercase tracking-tight text-ui-text-main truncate">{notif.title}</h4>
                                                    <p className="text-xs text-ui-text-secondary font-medium leading-relaxed">{notif.message}</p>
                                                </div>
                                            </div>
                                            {!notif.is_read && <div className="w-2 h-2 bg-brand rounded-full shrink-0 shadow-lg shadow-brand/20" />}
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-ui-white/50 rounded-[2.5rem] border-2 border-dashed border-ui-border">
                                    <p className="text-ui-muted font-bold italic">Inbox is empty.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Day Detail Modal */}
            <Dialog open={isDayDetailOpen} onOpenChange={setIsDayDetailOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-10 border-none bg-ui-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter text-ui-text-main">Schedule: {selectedDate}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-6 max-h-[50vh] overflow-y-auto no-scrollbar">
                        {selectedDate && getBookingsForDate(selectedDate).length > 0 ? (
                            getBookingsForDate(selectedDate).map(booking => (
                                <div key={booking.id} className="p-5 bg-ui-bg-alt rounded-2xl border border-ui-border space-y-4 shadow-inner text-ui-text-main">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10 border-2 border-ui-white shadow-sm">
                                                <AvatarImage src={booking.user_details?.profile_picture} />
                                                <AvatarFallback className="bg-brand-light text-brand font-bold">{booking.user_details?.username?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-black">@{booking.user_details?.username}</p>
                                                <p className="text-[10px] font-bold text-ui-muted uppercase">{booking.status}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black italic">${booking.price}</p>
                                        </div>
                                    </div>
                                    {booking.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <Button size="sm" className="flex-1 rounded-xl bg-success text-white font-black uppercase text-[9px] h-10 shadow-md shadow-success/20" onClick={() => handleUpdateStatus(booking.id, 'confirmed')}>Accept</Button>
                                            <Button size="sm" variant="ghost" className="flex-1 rounded-xl text-error font-black uppercase text-[9px] h-10 hover:bg-error/5" onClick={() => handleUpdateStatus(booking.id, 'cancelled')}>Decline</Button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-ui-muted italic font-medium">No activity scheduled.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Edit Service Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-3xl rounded-[2.5rem] p-0 border-none bg-ui-white shadow-2xl overflow-hidden">
                    <div className="flex flex-col h-[85vh]">
                        <DialogHeader className="p-8 pb-4 border-b border-ui-border/50 shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter text-ui-text-main">Edit Listing</DialogTitle>
                                    <DialogDescription className="text-xs font-bold uppercase tracking-widest text-brand">Reorder, add or remove images</DialogDescription>
                                </div>
                                <Button 
                                    onClick={handleEditSubmit}
                                    className="rounded-2xl bg-brand text-white font-black uppercase tracking-widest text-xs px-8 h-12 shadow-xl shadow-brand/20 hover:bg-brand-hover transition-all"
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
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {orderedMedia.map((item, index) => (
                                        <div
                                            key={index}
                                            draggable
                                            onDragStart={() => onDragStart(index)}
                                            onDragOver={onDragOver}
                                            onDrop={() => onDrop(index)}
                                            className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-move transition-all group ${draggedIndex === index ? 'opacity-30 scale-95' : 'opacity-100 hover:border-brand/50 shadow-sm hover:shadow-md'}`}
                                        >
                                            <img src={item.preview} className="w-full h-full object-cover" alt="" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <GripVertical className="text-white w-6 h-6" />
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeMediaItem(index); }}
                                                className="absolute top-2 right-2 p-1.5 bg-error/90 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                            {item.type === 'new' && (
                                                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-success text-white text-[8px] font-black uppercase rounded-md shadow-lg">New</div>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square rounded-2xl border-2 border-dashed border-ui-border flex flex-col items-center justify-center gap-2 text-ui-muted hover:border-brand/40 hover:text-brand transition-all hover:bg-brand/5"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-ui-bg-alt flex items-center justify-center">
                                            <Plus className="w-5 h-5" />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Add Media</span>
                                    </button>
                                </div>
                            </div>

                            <form className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Service Title</Label>
                                            <Input 
                                                value={editFormData.title || ''} 
                                                onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                                                className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Price ($)</Label>
                                                <Input 
                                                    type="number"
                                                    value={editFormData.price || ''} 
                                                    onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                                                    className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Duration</Label>
                                                <Input 
                                                    value={editFormData.duration || ''} 
                                                    onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                                                    className="h-14 rounded-2xl bg-ui-bg-alt border-none font-bold text-ui-text-main shadow-inner focus-visible:ring-brand"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[11px] font-black uppercase tracking-[0.2em] text-ui-muted ml-1">Description</Label>
                                            <Textarea 
                                                value={editFormData.description || ''} 
                                                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                                                className="min-h-[160px] rounded-[1.5rem] bg-ui-bg-alt border-none font-medium italic text-ui-text-secondary shadow-inner focus-visible:ring-brand"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

const BookingCard = ({ booking, onUpdateStatus }) => (
    <div className="bg-ui-white border border-ui-border rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all group">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14 border-2 border-ui-border shadow-sm">
                    <AvatarImage src={booking.user_details?.profile_picture} />
                    <AvatarFallback className="bg-brand-light text-brand font-bold uppercase">{booking.user_details?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h3 className="font-bold text-ui-text-main text-lg italic uppercase tracking-tighter">@{booking.user_details?.username}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[10px] font-black text-ui-muted uppercase tracking-widest">
                            <CalendarIcon className="w-3 h-3" /> {booking.booking_date}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-ui-border/50" />
                        <span className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {booking.experience_details?.title || 'General Service'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2">
                <div className="text-right">
                    <p className="text-xl font-black text-ui-text-main italic">${booking.price}</p>
                    <StatusBadge status={booking.status} />
                </div>
                
                {booking.status === 'pending' && (
                    <div className="flex gap-2 mt-2">
                        <Button 
                            size="sm" 
                            className="rounded-xl bg-success hover:bg-success-hover text-white font-black uppercase text-[10px] h-10 px-6 shadow-lg shadow-success/20 transition-all active:scale-95"
                            onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Accept
                        </Button>
                        <Button 
                            size="sm" 
                            variant="ghost"
                            className="rounded-xl text-error hover:bg-error/10 font-black uppercase text-[10px] h-10 px-6"
                            onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Decline
                        </Button>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-warning/10 text-warning border-warning/20',
        confirmed: 'bg-success/20 text-success border-success/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]',
        cancelled: 'bg-error/10 text-error border-error/20',
        completed: 'bg-ui-bg-alt text-ui-muted border-ui-border'
    };
    
    return (
        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${styles[status] || styles.pending}`}>
            {status}
        </span>
    );
};

export default GuideDashboardPage;
