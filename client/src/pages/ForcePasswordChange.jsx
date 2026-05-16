import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export default function ForcePasswordChange() {
    const { t } = useTranslation();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const passwordSchema = useMemo(() => z.object({
        password: z.string().min(6, { message: t('auth.validation.passwordMin') }),
        confirmPassword: z.string().min(1, { message: t('auth.validation.confirmPasswordRequired') }),
    }).refine((data) => data.password === data.confirmPassword, {
        message: t('auth.validation.passwordsMustMatch'),
        path: ["confirmPassword"],
    }), [t]);

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
            toast.success(t('auth.forcePasswordChange.successToast'));
            navigate('/dashboard'); 
            window.location.reload();
        } catch (err) {
            console.error('Change password error:', err);
            toast.error(err.response?.data?.message || t('auth.forcePasswordChange.errorToast'));
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
                    <h2 className="text-2xl font-bold text-white mb-2">{t('auth.forcePasswordChange.title')}</h2>
                    <p className="text-emerald-50 text-sm">
                        {t('auth.forcePasswordChange.subtitle')}
                    </p>
                </div>

                <div className="p-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('auth.forcePasswordChange.newPasswordLabel')}</label>
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all p-3 border"
                                placeholder={t('auth.forcePasswordChange.newPasswordPlaceholder')}
                            />
                            {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('auth.forcePasswordChange.confirmPasswordLabel')}</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full rounded-xl border-slate-200 focus:border-primary focus:ring-primary/20 transition-all p-3 border"
                                placeholder={t('auth.forcePasswordChange.confirmPasswordPlaceholder')}
                            />
                            {errors.confirmPassword && <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? t('auth.forcePasswordChange.loading') : t('auth.forcePasswordChange.submit')}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => {
                                navigate('/');
                                setTimeout(logout, 0);
                            }}
                            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {t('auth.forcePasswordChange.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
