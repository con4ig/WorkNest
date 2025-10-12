import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';

const Icon = {
 ArrowRight: () => (
    <ArrowRight className="w-5 h-5" />
  ),
};

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

const onSubmit = async (data) => {
  try {
    await axios.post('/api/auth/login', data, { withCredentials: true });
    
    navigate('/dashboard');
  } catch (err) {
    alert(err.response?.data?.message || 'Błąd logowania');
  }
};

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Panel - Decorative */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-emerald-500 to-teal-600 p-12 relative overflow-hidden">
        <div className="relative z-10 mt-auto">
          <h2 className="text-4xl font-bold text-white mb-6">
            Witaj w WorkNest
          </h2>
          <p className="text-emerald-50 text-lg max-w-md">
            Platforma, która pomoże Ci zarządzać projektami i zespołem w jednym miejscu.
          </p>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>
      </div>

      {/* Right Panel - Login Form */}
      
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Logo & Header */}
          <div className="text-center">
            <Link to="/" className="inline-flex flex-col items-center group mb-6 transition-transform duration-300 transform hover:scale-105">
              <div className="inline-flex items-center  shadow-2xl justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/50">
                <span className="text-white text-3xl font-bold">W</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Zaloguj się do konta
            </h2>
            <p className="mt-3 text-base text-gray-500">
              Nie masz jeszcze konta?{' '}
              <Link to="/register" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
                Zarejestruj się za darmo
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Adres email
                </label>
                <div className="relative group">
                  <input
                    {...register('email', { 
                      required: 'Email jest wymagany',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Nieprawidłowy format email"
                      }
                    })}
                    className="block w-full px-4 py-3.5 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    placeholder="jan.kowalski@firma.pl"
                  />
                  {errors.email && 
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      {errors.email.message}
                    </p>
                  }
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hasło
                </label>
                <div className="relative group">
                  <input
                    {...register('password', { 
                      required: 'Hasło jest wymagane',
                    })}
                    className="block w-full px-4 py-3.5 text-gray-900 placeholder:text-gray-400 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200"
                    type="password"
                    placeholder="********"
                  />
                  {errors.password && 
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                      </svg>
                      {errors.password.message}
                    </p>
                  }
                </div>
              </div>
            </div>

<div className="flex justify-between items-center">
  <span className="text-sm text-gray-500">Masz problem z logowaniem?</span>
  <Link
    to="/forgot-password"
    className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
  >
    Odzyskaj dostęp do konta
  </Link>
</div>


            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 px-4 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-sm"
            >
              Zaloguj się
              <Icon.ArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}