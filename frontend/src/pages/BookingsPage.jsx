import React, { useState, useEffect } from 'react';
import { getBookings, createDM } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
    Calendar as CalendarIcon, 
    ChevronLeft, 
    ChevronRight, 
    MessageCircle, 
    MapPin, 
    Clock, 
    CheckCircle2,
    XCircle,
    Loader2
} from "lucide-react";
import { toast } from 'sonner';

const BookingsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { handleOpenChat } = useOutletContext() || {};
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const getMediaUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `http://localhost:8000${url}`;
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            const res = await getBookings();
            setBookings(Array.isArray(res.data) ? res.data : (res.data.results || []));
        } catch (err) {
            console.error(err);
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleChat = async (providerId) => {
        try {
            const res = await createDM(providerId);
            if (handleOpenChat) handleOpenChat(res.data, 'dm');
        } catch (err) {
            console.error(err);
        }
    };

    const renderCalendar = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-ui-text-main">
                        {currentMonth.toLocaleString('default', { month: 'long' })} {year}
                    </h3>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-ui-border" onClick={() => setCurrentMonth(new Date(year, month - 1))}>
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-ui-border" onClick={() => setCurrentMonth(new Date(year, month + 1))}>
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-ui-muted py-2">{d}</div>
                    ))}
                    {days.map((date, idx) => {
                        if (!date) return <div key={`empty-${idx}`} />;
                        
                        const dateStr = date.toISOString().split('T')[0];
                        const dayBookings = bookings.filter(b => b.booking_date === dateStr);
                        const hasConfirmed = dayBookings.some(b => b.status === 'confirmed');
                        const hasPending = dayBookings.some(b => b.status === 'pending');
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <button
                                key={dateStr}
                                onClick={() => { setSelectedDate(dateStr); setIsDetailOpen(true); }}
                                className={`
                                    aspect-square rounded-2xl border transition-all flex flex-col items-center justify-center relative group
                                    ${hasConfirmed ? 'bg-brand text-white border-brand shadow-lg' : 
                                      hasPending ? 'bg-warning/10 border-warning/30 text-warning' : 
                                      'bg-ui-white border-ui-border text-ui-text-main hover:bg-ui-bg-alt'}
                                    ${isToday ? 'ring-2 ring-brand ring-offset-2 ring-offset-ui-bg' : ''}
                                `}
                            >
                                <span className="text-sm font-black">{date.getDate()}</span>
                                {(hasConfirmed || hasPending) && (
                                    <div className={`w-1 h-1 rounded-full mt-1 ${hasConfirmed ? 'bg-white' : 'bg-warning'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const selectedDateBookings = selectedDate ? bookings.filter(b => b.booking_date === selectedDate) : [];

    return (
        <div className="min-h-screen p-4 lg:p-8 animate-in fade-in duration-500">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-ui-text-main leading-none">My Bookings</h1>
                    <p className="text-ui-muted font-black uppercase tracking-[0.3em] text-[10px] mt-3">Your schedule and service history</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="rounded-[3rem] border border-ui-border shadow-2xl overflow-hidden bg-ui-white p-8">
                        {renderCalendar()}
                    </Card>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-ui-muted ml-1">Upcoming Events</h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand opacity-20" /></div>
                        ) : bookings.filter(b => new Date(b.booking_date) >= new Date()).length > 0 ? (
                            bookings
                                .filter(b => new Date(b.booking_date) >= new Date())
                                .sort((a, b) => new Date(a.booking_date) - new Date(b.booking_date))
                                .map(booking => (
                                    <Card 
                                        key={booking.id} 
                                        onClick={() => {
                                            const expId = booking.experience_details?.id;
                                            const type = booking.experience_details?.listing_type === 'service' ? 'essentials' : 'experiences';
                                            if (expId) {
                                                navigate(`/app/${type}/${expId}`);
                                            } else {
                                                navigate(`/app/guides/${booking.provider?.username}`);
                                            }
                                        }}
                                        className="rounded-3xl border border-ui-border shadow-md bg-ui-white overflow-hidden hover:shadow-xl transition-all group cursor-pointer"
                                    >
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-10 h-10 border border-ui-border">
                                                        <AvatarFallback className="bg-brand-light text-brand font-black">{booking.provider?.username?.charAt(0).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="text-xs font-black uppercase tracking-tight text-ui-text-main group-hover:text-brand transition-colors">@{booking.provider?.username}</p>
                                                        <p className="text-[9px] font-bold text-ui-muted uppercase">{booking.experience_details?.title || 'Private Service'}</p>
                                                    </div>
                                                </div>
                                                <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                                    booking.status === 'confirmed' ? 'bg-success/10 text-success border-success/20' : 
                                                    booking.status === 'cancelled' ? 'bg-error/10 text-error border-error/20' : 
                                                    'bg-warning/10 text-warning border-warning/20'
                                                }`}>
                                                    {booking.status}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 pt-4 border-t border-ui-border/50">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-ui-text-secondary">
                                                    <CalendarIcon className="w-3.5 h-3.5 text-brand" />
                                                    {booking.booking_date}
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 ml-auto text-[9px] font-black uppercase tracking-widest hover:text-brand"
                                                    onClick={(e) => { e.stopPropagation(); handleChat(booking.provider.id); }}
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Chat
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                        ) : (
                            <div className="text-center py-12 bg-ui-bg-alt rounded-[2rem] border-2 border-dashed border-ui-border">
                                <p className="text-xs font-bold text-ui-muted italic">No upcoming bookings.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] p-8 border-none bg-ui-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter">Schedule: {selectedDate}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        {selectedDateBookings.length > 0 ? (
                            selectedDateBookings.map(b => (
                                <div key={b.id} className="p-5 rounded-2xl bg-ui-bg-alt border border-ui-border flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${b.status === 'confirmed' ? 'bg-success' : 'bg-warning'}`} />
                                        <div>
                                            <p className="font-bold text-sm text-ui-text-main">{b.experience_details?.title || 'Service'}</p>
                                            <p className="text-[10px] text-ui-muted font-black uppercase tracking-widest">with @{b.provider?.username}</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => { setIsDetailOpen(false); handleChat(b.provider.id); }}>
                                        <MessageCircle className="w-4 h-4 text-brand" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center py-8 text-ui-muted font-medium italic text-sm">No activity scheduled for this date.</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingsPage;
