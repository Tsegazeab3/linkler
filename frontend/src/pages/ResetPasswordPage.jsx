import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { confirmPasswordReset } from '../services/api';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, Eye, EyeOff } from "lucide-react";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!token) {
            toast.error("Invalid reset link. Missing token.");
            navigate('/signin');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        setLoading(true);
        try {
            await confirmPasswordReset(token, password);
            setSuccess(true);
            toast.success("Password reset successfully!");
            setTimeout(() => navigate('/signin'), 3000);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Failed to reset password. Link may be expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--color-linkler-bg)] p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-ui-white rounded-[2rem] shadow-xl border border-ui-border">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-ui-text-main italic tracking-tight">Reset Password</h1>
                    <p className="mt-2 text-sm text-ui-text-secondary">
                        Enter your new secure password below.
                    </p>
                </div>

                {success ? (
                    <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-success-light text-success rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="font-medium text-ui-text-main">
                            Password updated! Redirecting to login...
                        </p>
                        <Button asChild className="w-full h-12 rounded-xl font-bold">
                            <Link to="/signin">Login Now</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-ui-muted ml-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted transition-colors" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 pl-12 pr-12 border-ui-border rounded-xl focus-visible:ring-brand"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowPassword(!showPassword)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand transition-colors"
                                      tabIndex={-1}
                                    >
                                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-ui-muted ml-1">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ui-muted transition-colors" />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="h-12 pl-12 pr-12 border-ui-border rounded-xl focus-visible:ring-brand"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      className="absolute right-4 top-1/2 -translate-y-1/2 text-ui-muted hover:text-brand transition-colors"
                                      tabIndex={-1}
                                    >
                                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading || !token}
                            className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-brand/20 transition-all active:scale-95"
                        >
                            {loading ? "Updating..." : "Reset Password"}
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
