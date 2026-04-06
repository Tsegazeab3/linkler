import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestPasswordReset } from '../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email.trim()) {
            toast.error("Email required", {
                description: "Please enter your email address to continue."
            });
            return;
        }

        setLoading(true);
        try {
            await requestPasswordReset(email);
            setSubmitted(true);
            toast.success("Reset link sent if account exists!");
        } catch (err) {
            console.error(err);
            // Even on error, we might want to show success to prevent email enumeration,
            // but for local testing, generic error is fine if it's a real network error.
            toast.error("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-ui-white rounded-[2rem] shadow-xl border border-ui-border">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-ui-text-main italic tracking-tight">Forgot Password?</h1>
                    <p className="mt-2 text-sm text-ui-text-secondary">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                {submitted ? (
                    <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-success-light text-success rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="font-medium text-ui-text-main">
                            Check your email for a reset link. It will expire in 30 minutes.
                        </p>
                        <Button asChild className="w-full h-12 rounded-xl font-bold">
                            <Link to="/signin">Back to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-ui-muted ml-1">
                                Email Address
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-12 border-ui-border rounded-xl focus-visible:ring-brand"
                            />
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-brand/20 transition-all active:scale-95"
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <div className="text-center">
                            <Link to="/signin" className="text-sm font-bold text-brand hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
