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

    const passwordSchema = useMemo(
        () =>
            z
                .object({
                    password: z
                        .string()
                        .min(6, { message: t('auth.validation.passwordMin') }),
                    confirmPassword: z.string().min(1, {
                        message: t('auth.validation.confirmPasswordRequired'),
                    }),
                })
                .refine((data) => data.password === data.confirmPassword, {
                    message: t('auth.validation.passwordsMustMatch'),
                    path: ['confirmPassword'],
                }),
        [t],
    );

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
            await api.post('/auth/change-password', {
                newPassword: data.password,
            });
            toast.success(t('auth.forcePasswordChange.successToast'));
            navigate('/dashboard');
            window.location.reload();
        } catch (err) {
            console.error('Change password error:', err);
            toast.error(
                err.response?.data?.message ||
                    t('auth.forcePasswordChange.errorToast'),
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-white">
                        {t('auth.forcePasswordChange.title')}
                    </h2>
                    <p className="text-sm text-emerald-50">
                        {t('auth.forcePasswordChange.subtitle')}
                    </p>
                </div>

                <div className="p-8">
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <div>
                            <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                {t('auth.forcePasswordChange.newPasswordLabel')}
                            </label>
                            <input
                                {...register('password')}
                                type="password"
                                className="w-full rounded-xl border border-slate-200 p-3 transition-all focus:border-primary focus:ring-primary/20"
                                placeholder={t(
                                    'auth.forcePasswordChange.newPasswordPlaceholder',
                                )}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-muted-foreground">
                                {t(
                                    'auth.forcePasswordChange.confirmPasswordLabel',
                                )}
                            </label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                className="w-full rounded-xl border border-slate-200 p-3 transition-all focus:border-primary focus:ring-primary/20"
                                placeholder={t(
                                    'auth.forcePasswordChange.confirmPasswordPlaceholder',
                                )}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full transform rounded-xl bg-emerald-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {isLoading
                                ? t('auth.forcePasswordChange.loading')
                                : t('auth.forcePasswordChange.submit')}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                navigate('/');
                                setTimeout(logout, 0);
                            }}
                            className="text-sm text-slate-400 transition-colors hover:text-slate-600"
                        >
                            {t('auth.forcePasswordChange.logout')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
