import { useState } from 'react';
import { Camera, Upload, X, Check, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';

function ProfileImageUpload() {
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
                setError('Plik jest za duży. Maksymalny rozmiar to 5MB.');
                return;
            }

            // Walidacja typu
            if (!file.type.startsWith('image/')) {
                setError('Wybierz plik graficzny (jpg, png, itp.)');
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
            setError('Wybierz zdjęcie');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', image);

        try {
            const res = await api.put('/users/profile-image', formData);

            console.log('Sukces:', res.data);

            setSuccess(true);

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } catch (err) {
            console.error('Błąd uploadu:', err);
            setError('Nie udało się zaktualizować zdjęcia. Spróbuj ponownie.');
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
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="animate-blob absolute left-20 top-20 h-64 w-64 rounded-full bg-emerald-200 opacity-20 mix-blend-multiply blur-xl filter"></div>
                <div className="animate-blob animation-delay-2000 absolute right-20 top-40 h-64 w-64 rounded-full bg-emerald-300 opacity-20 mix-blend-multiply blur-xl filter"></div>
                <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-1/2 h-64 w-64 rounded-full bg-emerald-100 opacity-20 mix-blend-multiply blur-xl filter"></div>
            </div>

            <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                {/* Back button */}
                <button
                    onClick={() => (window.location.href = '/dashboard')}
                    className="absolute left-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                        <Camera className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h2 className="mb-2 text-3xl font-bold text-gray-800">
                        Zmień zdjęcie profilowe
                    </h2>
                    <p className="text-sm text-gray-500">
                        Dodaj lub zaktualizuj swój awatar
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
                                        alt="Podgląd"
                                        className="h-40 w-40 rounded-full border-4 border-emerald-500 object-cover shadow-lg transition-transform group-hover:scale-105"
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
                                            <Check className="h-16 w-16 animate-bounce text-white" />
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-dashed border-gray-300 bg-gray-50">
                                    <Upload className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                        </div>

                        {/* File input - styled */}
                        <label className="group relative block cursor-pointer">
                            <div className="flex transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg group-hover:from-emerald-600 group-hover:to-emerald-700">
                                <Upload className="h-5 w-5" />
                                <span className="font-medium">
                                    {preview
                                        ? 'Wybierz inne zdjęcie'
                                        : 'Wybierz zdjęcie'}
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
                        <div className="animate-shake rounded-lg border-l-4 border-red-500 bg-red-50 p-4">
                            <div className="flex items-center gap-2">
                                <X className="h-5 w-5 flex-shrink-0 text-red-500" />
                                <p className="text-sm font-medium text-red-700">
                                    {error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Success message */}
                    {success && (
                        <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
                            <div className="flex items-center gap-2">
                                <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                                <p className="text-sm font-medium text-emerald-700">
                                    Zdjęcie zostało zaktualizowane!
                                    Przekierowywanie...
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    {preview && !success && (
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading || !image}
                                className="flex-1 transform rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 font-medium text-white shadow-md transition-all hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg disabled:transform-none disabled:cursor-not-allowed disabled:from-gray-300 disabled:to-gray-400"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Wysyłanie...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <Check className="h-5 w-5" />
                                        Zapisz zdjęcie
                                    </span>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    (window.location.href = '/dashboard')
                                }
                                disabled={loading}
                                className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                            >
                                Anuluj
                            </button>
                        </div>
                    )}
                </form>

                {/* Tips */}
                <div className="mt-8 rounded-xl bg-emerald-50 p-4">
                    <p className="mb-2 text-xs font-medium text-emerald-800">
                        💡 Wskazówki:
                    </p>
                    <ul className="space-y-1 text-xs text-emerald-700">
                        <li>• Użyj zdjęcia z dobrym oświetleniem</li>
                        <li>• Twarz powinna być wyraźnie widoczna</li>
                        <li>• Kwadratowe zdjęcia wyglądają najlepiej</li>
                    </ul>
                </div>
            </div>

            <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
        </div>
    );
}

export default ProfileImageUpload;
