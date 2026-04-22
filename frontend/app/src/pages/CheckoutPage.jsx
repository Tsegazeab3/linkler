import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
    Calendar as CalendarIcon, 
    CreditCard, 
    ShieldCheck, 
    ChevronLeft,
    CheckCircle2
} from "lucide-react";

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { provider, experience, date } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!provider || !date) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold">Session Expired</h2>
                    <p className="text-ui-muted">Please restart your booking process.</p>
                    <Button onClick={() => navigate('/app/guides')}>Back to Guides</Button>
                </div>
            </div>
        );
    }

    const handleConfirmBooking = async () => {
        setLoading(true);
        try {
            await createBooking({
                provider: provider.id,
                experience: experience?.id,
                booking_date: date,
                price: experience?.price || 50.00, // Fallback base price
                currency: experience?.currency || 'USD',
                status: 'pending'
            });
            setIsSuccess(true);
            toast.success("Booking request placed!");
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-ui-bg animate-in zoom-in-95 duration-500">
                <div className="max-w-md w-full bg-ui-white rounded-[3rem] p-10 shadow-2xl text-center space-y-8 border border-ui-border">
                    <div className="w-24 h-24 bg-success-light text-success rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic uppercase tracking-tight">Booking Requested!</h2>
                        <p className="text-ui-text-secondary">Your request for <strong>{date}</strong> has been sent to <strong>{provider.username}</strong>.</p>
                    </div>
                    <div className="bg-ui-bg-alt p-6 rounded-[2rem] border border-ui-border/50 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mb-2">Next Steps</p>
                        <p className="text-xs text-ui-text-main leading-relaxed">The provider will review your request and confirm shortly. You can track the status in your messages or dashboard.</p>
                    </div>
                    <Button 
                        onClick={() => navigate('/app/messages')}
                        className="w-full py-6 rounded-[1.5rem] bg-brand hover:bg-brand-hover font-bold text-sm uppercase tracking-widest shadow-xl"
                    >
                        Go to Messages
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ui-bg p-4 md:p-8 lg:p-12 animate-in fade-in duration-500">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-8">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-ui-muted hover:text-brand font-bold uppercase text-[10px] tracking-widest transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Go Back
                    </button>
                    
                    <h1 className="text-5xl font-black text-ui-text-main italic tracking-tighter uppercase leading-none">Confirm & Pay</h1>
                    
                    <div className="space-y-6">
                        <div className="bg-ui-white p-8 rounded-[2.5rem] border border-ui-border shadow-xl space-y-6">
                            <div className="flex items-center gap-4 pb-6 border-b border-ui-border/50">
                                <div className="w-12 h-12 rounded-2xl bg-brand-light text-brand flex items-center justify-center">
                                    <CreditCard className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Secure Checkout</h3>
                                    <p className="text-xs text-ui-muted font-medium uppercase tracking-widest">Transaction protected by Linkler Shield</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-ui-text-main">Payment Method</p>
                                <div className="p-4 rounded-2xl border-2 border-brand bg-brand/5 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-6 bg-ui-text-main rounded-md" /> {/* Card Mockup */}
                                        <span className="text-sm font-bold">•••• 4242</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-brand">Default</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 px-4 text-success">
                            <ShieldCheck className="w-5 h-5" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Free cancellation up to 24h before trip</p>
                        </div>
                    </div>
                </div>

                <aside className="w-full md:w-[350px] shrink-0">
                    <Card className="rounded-[3rem] border border-ui-border shadow-2xl overflow-hidden bg-ui-white sticky top-12">
                        <CardHeader className="bg-ui-bg-alt/50 p-8 border-b border-ui-border">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-ui-muted mb-4">Trip Summary</CardTitle>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-4 border-white shadow-xl">
                                    <AvatarImage src={provider.profile_picture} />
                                    <AvatarFallback className="bg-brand-light text-brand font-black">{provider.username?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-black italic uppercase text-lg leading-tight">{provider.username}</h3>
                                    <p className="text-xs font-bold text-brand uppercase tracking-widest">Linkler Verified</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {experience && (
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted">Selected Service</p>
                                    <p className="font-bold text-ui-text-main">{experience.title}</p>
                                </div>
                            )}
                            
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted">Booking Date</p>
                                <div className="flex items-center gap-2 font-bold text-ui-text-main">
                                    <CalendarIcon className="w-4 h-4 text-brand" />
                                    <span>{date}</span>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-ui-border space-y-4">
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-ui-muted">Base Price</span>
                                    <span>{experience?.currency || 'USD'} {experience?.price || 50.00}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-bold">
                                    <span className="text-ui-muted">Linkler Fee</span>
                                    <span className="text-success">FREE</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-ui-border">
                                    <span className="text-lg font-black italic uppercase">Total</span>
                                    <span className="text-2xl font-black text-brand">{experience?.currency || 'USD'} {experience?.price || 50.00}</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 pt-0">
                            <Button 
                                onClick={handleConfirmBooking}
                                disabled={loading}
                                className="w-full py-7 rounded-[1.5rem] bg-brand hover:bg-brand-hover text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-brand/30"
                            >
                                {loading ? 'Processing...' : 'Confirm Booking'}
                            </Button>
                        </CardFooter>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
