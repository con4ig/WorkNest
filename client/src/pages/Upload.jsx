import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ProfileImageUpload() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      console.log('Sukces:', res.data);
      alert('Zdjęcie profilowe zostało zaktualizowane!');
      
      // Przeładuj stronę aby odświeżyć avatar w Dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      console.error('Błąd uploadu:', err);
      setError(
        err.response?.data?.message || 
        'Nie udało się zaktualizować zdjęcia. Spróbuj ponownie.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Zmień zdjęcie profilowe
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Podgląd obrazka */}
          {preview && (
            <div className="flex justify-center mb-4">
              <img 
                src={preview} 
                alt="Podgląd" 
                className="w-32 h-32 rounded-full object-cover border-4 border-emerald-600"
              />
            </div>
          )}

          {/* Input pliku */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wybierz zdjęcie
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              disabled={loading}
            />
          </div>

          {/* Komunikat błędu */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Przyciski */}
          <div className="flex gap-3">
            <button 
              type="submit" 
              disabled={loading || !image}
              className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Wysyłanie...' : 'Zmień zdjęcie'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileImageUpload;