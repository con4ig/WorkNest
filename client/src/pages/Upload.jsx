import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import api from '../services/api.js';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

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
        <div className="flex h-full flex-col space-y-6 overflow-y-auto px-6 pb-6 pt-6 md:px-8 md:pt-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 border-b border-border pb-6 md:flex-row md:items-end">
                <div>
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="mr-2 md:hidden"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                            {t('upload.title')}
                        </h1>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('upload.subtitle')}
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                    <Button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>
                            {t('common.cancel', { defaultValue: 'Wróć' })}
                        </span>
                    </Button>
                </div>
            </div>

            <div className="mx-auto w-full max-w-xl">
                {/* Upload Form Card */}
                <Card className="border-border shadow-sm">
                    <CardContent className="p-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Camera className="h-5 w-5" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-foreground">
                                    {t('upload.cardTitle')}
                                </h2>
                                <p className="text-xs text-muted-foreground">
                                    {t('upload.cardSubtitle')}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleUpload} className="space-y-6">
                            <div className="flex flex-col items-center justify-center">
                                {/* Image Preview/Uploader */}
                                {preview ? (
                                    <div className="group relative mb-6">
                                        <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-background shadow-sm ring-2 ring-border transition-transform duration-300 group-hover:scale-105 sm:h-48 sm:w-48">
                                            <img
                                                src={preview}
                                                alt={t('upload.previewAlt')}
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="icon"
                                                    className="rounded-full shadow-sm"
                                                    onClick={handleRemoveImage}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="group relative mb-6 flex h-40 w-40 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/20 transition-all hover:border-primary/50 hover:bg-primary/5 sm:h-48 sm:w-48">
                                        <Upload className="mb-2 h-8 w-8 text-muted-foreground transition-transform group-hover:scale-110 group-hover:text-primary" />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            {t('upload.selectImage')}
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            disabled={loading}
                                        />
                                    </label>
                                )}

                                {/* Info text */}
                                <div className="text-center">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        JPG, PNG, GIF • MAX 5MB
                                    </p>
                                </div>
                            </div>

                            {/* Status Messages */}
                            <div className="space-y-4">
                                {error && (
                                    <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-sm font-medium text-destructive">
                                        <div className="flex items-center justify-center gap-2">
                                            <X className="h-4 w-4" />
                                            {error}
                                        </div>
                                    </div>
                                )}

                                {success && (
                                    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-500">
                                        <div className="rounded-full bg-emerald-500/20 p-2">
                                            <Check className="h-5 w-5" />
                                        </div>
                                        <p className="text-center text-sm font-medium tracking-tight">
                                            {t('upload.successMessage')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row">
                                {preview && !success ? (
                                    <>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1"
                                        >
                                            {loading && (
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                            )}
                                            <Upload className="mr-2 h-4 w-4" />
                                            {t('upload.saveButton')}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleRemoveImage}
                                            disabled={loading}
                                            className="flex-1"
                                        >
                                            {t('common.cancel')}
                                        </Button>
                                    </>
                                ) : !preview ? (
                                    <label className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                        <Camera className="h-4 w-4" />
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
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default ProfileImageUpload;
