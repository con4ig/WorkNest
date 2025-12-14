import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const passwordSchema = z.object({
    password: z.string().min(6, { message: 'Hasło musi mieć co najmniej 6 znaków' }),
    confirmPassword: z.string().min(6, { message: 'Potwierdzenie hasła jest wymagane' }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Hasła muszą być identyczne",
    path: ["confirmPassword"],
});

export default function ForcePasswordChange() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(passwordSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            await api.post('/auth/change-password', { newPassword: data.password });
            toast.success('Hasło zostało zmienione. Możesz teraz w pełni korzystać z konta.');
            // Po zmianie hasła przekieruj do dashboardu
            // Opcjonalnie można przeładować usera, ale API zazwyczaj nie zwraca nowego tokena przy zmianie hasła w tym endpointcie
            // Zakładamy, że stary token jest wciąż ważny (chyba, że backend inwaliduje)
            // Backend w naszym przypadku tylko update'uje usera.
            navigate('/dashboard'); 
             window.location.reload(); // Wymuś odświeżenie kontekstu usera (zeby mustChangePassword zniknelo z pamieci)
        } catch (err) {
            console.error('Change password error:', err);
            toast.error(err.response?.data?.message || 'Błąd zmiany hasła');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Zmiana hasła wymagana</h2>
                    <p className="text-emerald-50 text-sm">
                        Ze względów bezpieczeństwa musisz zmienić swoje hasło przed pierwszym logowaniem.
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nowe hasło</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all p-3 border"
                                placeholder="Nowe silne hasło"
                            />
                            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Potwierdź hasło</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full rounded-xl border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all p-3 border"
                                placeholder="Powtórz nowe hasło"
                            />
                            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Zmienianie...' : 'Zmień hasło i zaloguj'}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <button 
                            onClick={logout}
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Wyloguj się
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
