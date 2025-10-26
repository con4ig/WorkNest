import { useState } from 'react';
import { Camera, Upload, X, Check, ArrowLeft } from 'lucide-react';
import axios from 'axios';

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
      
      const res = await axios.put('/api/users/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      {/* Floating shapes for decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Back button */}
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <Camera className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Zmień zdjęcie profilowe
          </h2>
          <p className="text-gray-500 text-sm">
            Dodaj lub zaktualizuj swój awatar
          </p>
        </div>

        <form onSubmit={handleUpload} className="space-y-6">
          {/* Preview area */}
          <div className="relative">
            <div className="flex justify-center mb-6">
              {preview ? (
                <div className="relative group">
                  <img 
                    src={preview} 
                    alt="Podgląd" 
                    className="w-40 h-40 rounded-full object-cover border-4 border-emerald-500 shadow-lg transition-transform group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all transform hover:scale-110"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {success && (
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500 bg-opacity-90 rounded-full">
                      <Check className="w-16 h-16 text-white animate-bounce" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-40 h-40 rounded-full border-4 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <Upload className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>

            {/* File input - styled */}
            <label className="relative block cursor-pointer group">
              <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:scale-105 group-hover:from-emerald-600 group-hover:to-emerald-700">
                <Upload className="w-5 h-5" />
                <span className="font-medium">
                  {preview ? 'Wybierz inne zdjęcie' : 'Wybierz zdjęcie'}
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

            <p className="text-xs text-gray-500 text-center mt-2">
              JPG, PNG, GIF • Max 5MB
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-shake">
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p className="text-emerald-700 text-sm font-medium">
                  Zdjęcie zostało zaktualizowane! Przekierowywanie...
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
                className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 px-6 rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Wysyłanie...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-5 h-5" />
                    Zapisz zdjęcie
                  </span>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => window.location.href = '/dashboard'}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Anuluj
              </button>
            </div>
          )}
        </form>

        {/* Tips */}
        <div className="mt-8 p-4 bg-emerald-50 rounded-xl">
          <p className="text-xs text-emerald-800 font-medium mb-2">💡 Wskazówki:</p>
          <ul className="text-xs text-emerald-700 space-y-1">
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