import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadVerificationDoc } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
    ShieldCheck, 
    FileText, 
    Upload, 
    CheckCircle2, 
    AlertCircle,
    Info
} from "lucide-react";

const GuideVerificationPage = () => {
    const [idFile, setIdFile] = useState(null);
    const [visaFile, setVisaFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitted, setIsSuccess] = useState(false);
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const handleUpload = async () => {
        if (!idFile || !visaFile) {
            toast.error("Required Documents", {
                description: "Please upload both your ID and Residency/Visa documentation."
            });
            return;
        }

        setLoading(true);
        try {
            // Upload ID
            const idFormData = new FormData();
            idFormData.append('document_type', 'id');
            idFormData.append('file', idFile);
            await uploadVerificationDoc(idFormData);

            // Upload Visa
            const visaFormData = new FormData();
            visaFormData.append('document_type', 'visa');
            visaFormData.append('file', visaFile);
            await uploadVerificationDoc(visaFormData);

            setIsSuccess(true);
            toast.success("Documents submitted!", {
                description: "Our team will review your application within 24-48 hours."
            });
            await refreshProfile();
        } catch (err) {
            console.error(err);
            toast.error("Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isSubmitted || user?.verification_status === 'pending') {
        return (
            <div className="min-h-screen bg-ui-bg flex items-center justify-center p-4">
                <Card className="max-w-md w-full rounded-[3rem] p-10 text-center space-y-8 border-none shadow-2xl bg-ui-white">
                    <div className="w-24 h-24 bg-brand/10 text-brand rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <ShieldCheck className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black italic uppercase tracking-tight">Verification Pending</h2>
                        <p className="text-ui-text-secondary text-sm">Your application is currently under review by our safety team.</p>
                    </div>
                    <div className="bg-ui-bg-alt p-6 rounded-[2rem] border border-ui-border/50 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-ui-muted mb-2 italic">Timeline</p>
                        <p className="text-xs text-ui-text-main leading-relaxed font-medium">Verified status usually takes 24 hours. You will receive a notification once your "Verified" badge is active.</p>
                    </div>
                    <Button 
                        onClick={() => navigate('/app')}
                        className="w-full py-6 rounded-[1.5rem] bg-brand hover:bg-brand-hover font-bold text-sm uppercase tracking-widest shadow-xl"
                    >
                        Return Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-ui-bg flex items-center justify-center p-4 md:p-8">
            <Card className="max-w-2xl w-full rounded-[3rem] border-none shadow-2xl overflow-hidden bg-ui-white">
                <CardHeader className="p-10 pb-6 text-center">
                    <div className="w-16 h-16 bg-brand-light text-brand rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <CardTitle className="text-4xl font-black italic uppercase tracking-tighter text-ui-text-main leading-none">Become a Verified Guide</CardTitle>
                    <CardDescription className="text-sm font-medium text-ui-muted mt-3">
                        To protect our community, all providers in the UAE must submit legal documentation before accepting bookings.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-10 pt-4 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ID Upload */}
                        <div className={`p-8 rounded-[2rem] border-2 border-dashed transition-all relative group ${idFile ? 'border-success bg-success/5' : 'border-ui-border bg-ui-bg-alt hover:border-brand/30'}`}>
                            <div className="flex flex-col items-center text-center">
                                {idFile ? <CheckCircle2 className="w-8 h-8 text-success mb-2" /> : <FileText className="w-8 h-8 text-ui-muted mb-2 group-hover:text-brand transition-colors" />}
                                <p className="text-[10px] font-black uppercase tracking-widest text-ui-text-main">Gov. Issued ID</p>
                                <p className="text-[9px] text-ui-muted mt-1">Passport or Emirates ID</p>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setIdFile(e.target.files[0])}
                                    accept="image/*,.pdf"
                                />
                                {idFile && <p className="text-[8px] font-bold text-success mt-2 truncate max-w-full">{idFile.name}</p>}
                            </div>
                        </div>

                        {/* Visa Upload */}
                        <div className={`p-8 rounded-[2rem] border-2 border-dashed transition-all relative group ${visaFile ? 'border-success bg-success/5' : 'border-ui-border bg-ui-bg-alt hover:border-brand/30'}`}>
                            <div className="flex flex-col items-center text-center">
                                {visaFile ? <CheckCircle2 className="w-8 h-8 text-success mb-2" /> : <Upload className="w-8 h-8 text-ui-muted mb-2 group-hover:text-brand transition-colors" />}
                                <p className="text-[10px] font-black uppercase tracking-widest text-ui-text-main">Residency / Visa</p>
                                <p className="text-[9px] text-ui-muted mt-1">Valid UAE Residence Visa</p>
                                <input 
                                    type="file" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={(e) => setVisaFile(e.target.files[0])}
                                    accept="image/*,.pdf"
                                />
                                {visaFile && <p className="text-[8px] font-bold text-success mt-2 truncate max-w-full">{visaFile.name}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-4 p-6 bg-brand/5 rounded-[2rem] border border-brand/10">
                        <Info className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-brand">Legal Compliance</p>
                            <p className="text-[11px] text-ui-text-secondary leading-relaxed font-medium">All guide services operating in the UAE are subject to local licensing regulations. By submitting, you confirm your legal right to operate within these jurisdictions.</p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-10 border-t border-ui-border/50">
                    <Button 
                        onClick={handleUpload}
                        disabled={loading || !idFile || !visaFile}
                        className="w-full h-16 rounded-[1.5rem] bg-brand hover:bg-brand-hover text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-brand/20"
                    >
                        {loading ? "Uploading Documents..." : "Submit Application"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default GuideVerificationPage;
