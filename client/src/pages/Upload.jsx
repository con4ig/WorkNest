import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, X, Check, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
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
            // Walidacja rozmiaru (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError(t('upload.errors.tooLarge'));
                return;
            }

            // Walidacja typu
            if (!file.type.startsWith('image/')) {
                setError(t('upload.errors.invalidType'));
                return;
            }

            setImage(file);
            setError('');
            setSuccess(false);

            // Podgląd obrazka
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
            const res = await api.put('/users/profile-image', formData);

            setSuccess(true);

            // Odśwież dane użytkownika (w tym zdjęcie)
            await refreshUser();

            setSuccess(true);

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-emerald-50 p-4">
            {/* Floating shapes for decoration */}

            <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
                {/* Back button */}
                <button
                    onClick={() => navigate('/dashboard')}
                    className="absolute left-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-6 text-center sm:mb-8">
                    <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 sm:h-16 sm:w-16">
                        <Camera className="h-7 w-7 text-emerald-600 sm:h-8 sm:w-8" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-gray-800 sm:text-3xl">
                        {t('upload.title')}
                    </h2>
                    <p className="text-sm text-gray-500">
                        {t('upload.subtitle')}
                    </p>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                    {/* Preview area */}
                    <div className="relative">
                        <div className="mb-6 flex justify-center">
                            {preview ? (
                                <div className="group relative">
                                    <img
                                        src={preview}
                                        alt={t('upload.previewAlt')}
                                        className="h-32 w-32 rounded-full border-4 border-emerald-500 object-cover shadow-lg transition-transform group-hover:scale-105 sm:h-40 sm:w-40"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -right-2 -top-2 transform rounded-full bg-red-500 p-2 text-white shadow-lg transition-all hover:scale-110 hover:bg-red-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                    {success && (
                                        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-emerald-500 bg-opacity-90">
                                            <Check className="h-12 w-12 animate-bounce text-white sm:h-16 sm:w-16" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-slate-200 bg-slate-50 transition-colors duration-300 hover:border-emerald-400 hover:bg-emerald-50 sm:h-40 sm:w-40">
                                    <Upload className="h-10 w-10 text-slate-400 sm:h-12 sm:w-12" />
                                </div>
                            )}
                        </div>

                        {/* File input - styled */}
                        <label className="group relative block cursor-pointer">
                            <div className="flex transform items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 sm:text-base">
                                <Upload className="h-5 w-5" />
                                <span>
                                    {preview
                                        ? t('upload.selectAnother')
                                        : t('upload.selectImage')}
                                </span>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={loading}
                            />
                        </label>

                        <p className="mt-2 text-center text-xs text-gray-500">
                            JPG, PNG, GIF • Max 5MB
                        </p>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 shadow-sm duration-300">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-1">
                                    <X className="h-4 w-4 text-red-600" />
                                </div>
                                <p className="text-sm font-medium text-red-800">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4 shadow-sm duration-300">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-emerald-100 p-1">
                                    <Check className="h-4 w-4 text-emerald-600" />
                                </div>
                                <p className="text-sm font-medium text-emerald-800">
                                    {t('upload.successMessage')}
                                    <span className="ml-1 opacity-75">
                                        {t('common.redirecting')}...
                                    </span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {preview && !success && (
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                                type="submit"
                                disabled={loading || !image}
                                className="flex-1 transform rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        {t('common.uploading')}...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="h-5 w-5" />
                                        {t('upload.saveButton')}
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                disabled={loading}
                                className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50 sm:order-first"
                            >
                                {t('common.cancel')}
                            </button>
                        </div>
                    )}
                </form>

                {/* Tips */}
                <div className="mt-8 rounded-xl bg-emerald-50 p-4">
                    <p className="mb-2 text-xs font-medium text-emerald-800">
                        {t('upload.tips.title')}
                    </p>
                    <ul className="space-y-1 text-xs text-emerald-700">
                        <li>• {t('upload.tips.lighting')}</li>
                        <li>• {t('upload.tips.visibility')}</li>
                        <li>• {t('upload.tips.aspectRatio')}</li>
                    </ul>
                </div>
            </div>

            {/* Simple professional background subtle pattern/gradient is handled by parent classes */}
        </div>
    );
}

export default ProfileImageUpload;
