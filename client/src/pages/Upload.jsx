import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import api from '../services/api.js';

function ProfileImageUpload() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError(t('upload.errors.tooLarge'));
                return;
            }
            if (!file.type.startsWith('image/')) {
                setError(t('upload.errors.invalidType'));
                return;
            }
            setImage(file);
            setError('');
            setSuccess(false);

            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!image) {
            setError(t('upload.errors.noImage'));
            return;
        }
        setLoading(true);
        setError('');
        const formData = new FormData();
        formData.append('image', image);
        try {
            await api.put('/users/profile-image', formData);
            setSuccess(true);
            await refreshUser();
            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);
        } catch (err) {
            setError(t('upload.errors.uploadFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        setPreview(null);
        setError('');
        setSuccess(false);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-background p-4 overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
            <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
            
            <div className="relative w-full max-w-xl">
                {/* Main Card */}
                <div className="animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 p-6 shadow-2xl backdrop-blur-xl sm:rounded-[2.5rem] sm:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="group absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-foreground transition-all hover:bg-muted active:scale-95 shadow-sm border border-border/50 sm:left-8 sm:top-8"
                    >
                        <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                    </button>

                    {/* Content Wrapper */}
                    <div className="relative z-10 flex flex-col items-center">
                        {/* Header Section */}
                        <div className="mb-10 text-center">
                            <div className="mb-4 inline-flex h-16 w-16 sm:mb-6 sm:h-20 sm:w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary border border-primary/20 shadow-inner group transition-transform hover:rotate-3">
                                <Camera className="h-8 w-8 sm:h-10 sm:w-10 transition-transform group-hover:scale-110" />
                            </div>
                            <h2 className="mb-2 text-2xl font-black tracking-tighter text-foreground sm:text-4xl">
                                {t('upload.title')}
                            </h2>
                            <p className="max-w-[280px] mx-auto text-sm font-medium leading-relaxed text-muted-foreground/60 italic">
                                {t('upload.subtitle')}
                            </p>
                        </div>

                        <form onSubmit={handleUpload} className="w-full space-y-8">
                            {/* Preview/Drop Zone */}
                            <div className="relative flex justify-center">
                                {preview ? (
                                    <div className="group relative">
                                        <div className="relative h-40 w-40 sm:h-48 sm:w-48 overflow-hidden rounded-full border-4 border-primary/30 shadow-2xl shadow-primary/20 transition-transform group-hover:scale-[1.02]">
                                            <img
                                                src={preview}
                                                alt={t('upload.previewAlt')}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                        </div>
                                        
                                        <button
                                            type="button"
                                            onClick={handleRemoveImage}
                                            className="absolute -right-1 -top-1 flex h-10 w-10 transform items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-xl transition-all hover:scale-110 hover:bg-destructive/90 active:scale-95"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                        
                                        {success && (
                                            <div className="animate-in fade-in zoom-in-50 duration-300 absolute inset-0 flex items-center justify-center rounded-full bg-primary/80 backdrop-blur-sm">
                                                <div className="flex flex-col items-center">
                                                    <Check className="h-16 w-16 animate-bounce text-primary-foreground" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-primary-foreground">Success</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <label className="group relative z-10 flex h-40 w-40 cursor-pointer items-center justify-center rounded-full border-4 border-dashed border-border/50 bg-muted/20 transition-all hover:border-primary/50 hover:bg-primary/5 sm:h-48 sm:w-48">
                                        <div className="flex flex-col items-center gap-2">
                                            <Upload className="h-12 w-12 text-muted-foreground/40 transition-transform group-hover:scale-110 group-hover:text-primary/60" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{t('upload.selectImage')}</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            disabled={loading}
                                        />
                                    </label>
                                )}
                            </div>

                            {/* Info text */}
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30">
                                    JPG, PNG, GIF • MAX 5MB
                                </p>
                            </div>

                            {/* Status Messages */}
                            <div className="space-y-4">
                                {error && (
                                    <div className="animate-in slide-in-from-top-2 duration-300 rounded-2xl border border-destructive/20 bg-destructive/10 p-5 text-center shadow-inner">
                                        <div className="flex items-center justify-center gap-3">
                                            <X className="h-5 w-5 text-destructive" />
                                            <p className="text-sm font-bold text-destructive">
                                                {error}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="animate-in slide-in-from-top-2 duration-300 rounded-2xl border border-primary/20 bg-primary/10 p-5 text-center shadow-inner">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Check className="h-5 w-5 text-primary" />
                                                <p className="text-sm font-bold text-primary">
                                                    {t('upload.successMessage')}
                                                </p>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary/60">
                                                {t('common.redirecting')}...
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-4">
                                {preview && !success ? (
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 rounded-2xl bg-primary px-6 py-3 font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:bg-primary/90 hover:translate-y-[-2px] active:scale-95 disabled:opacity-50 sm:px-8 sm:py-4 text-xs sm:text-sm"
                                        >
                                            {loading ? (
                                                <div className="flex items-center justify-center gap-3">
                                                    <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                                                    {t('common.uploading')}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2">
                                                    <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    {t('upload.saveButton')}
                                                </div>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => navigate('/dashboard')}
                                            disabled={loading}
                                            className="flex-1 rounded-2xl border border-border/50 bg-muted/50 px-6 py-3 font-black uppercase tracking-widest text-foreground transition-all hover:bg-muted active:scale-95 sm:px-8 sm:py-4 text-xs sm:text-sm"
                                        >
                                            {t('common.cancel')}
                                        </button>
                                    </div>
                                ) : !preview ? (
                                    <label className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl bg-primary px-6 py-3 font-black uppercase tracking-widest text-primary-foreground shadow-2xl shadow-primary/30 transition-all hover:bg-primary/90 hover:translate-y-[-2px] active:scale-95 sm:px-8 sm:py-4 text-xs sm:text-sm">
                                        <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                                        {t('upload.selectImage')}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                ) : null}
                            </div>
                        </form>

                        {/* Tips Section */}
                        <div className="mt-8 w-full rounded-3xl border border-border/20 bg-muted/10 p-5 backdrop-blur-sm sm:mt-12 sm:p-8">
                            <h4 className="mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                                {t('upload.tips.title')}
                            </h4>
                            <div className="grid grid-cols-1 gap-4 text-xs font-bold sm:grid-cols-3">
                                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-background/50 border border-border/10">
                                    <span className="text-primary italic opacity-60">01</span>
                                    <span className="text-muted-foreground/80 leading-relaxed text-[11px]">{t('upload.tips.lighting')}</span>
                                </div>
                                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-background/50 border border-border/10">
                                    <span className="text-primary italic opacity-60">02</span>
                                    <span className="text-muted-foreground/80 leading-relaxed text-[11px]">{t('upload.tips.visibility')}</span>
                                </div>
                                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-background/50 border border-border/10">
                                    <span className="text-primary italic opacity-60">03</span>
                                    <span className="text-muted-foreground/80 leading-relaxed text-[11px]">{t('upload.tips.aspectRatio')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfileImageUpload;
