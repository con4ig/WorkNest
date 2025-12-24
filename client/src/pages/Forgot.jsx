import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';

function Forgot() {
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    // JEDEN hook dla JEDNEGO formularza
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const navigate = useNavigate();

    // Logika zostaje w oddzielnych funkcjach dla czytelności
    const handleSendOtp = async (data) => {
        try {
            await api.post('/email/send-otp', { email: data.email });
            setEmail(data.email);
            setStep(2);
        } catch (err) {
            alert(err.response?.data?.message || t('auth.forgot.errors.send'));
        }
    };

    const handleVerifyOtp = async (data) => {
        try {
            const response = await api.post('/email/verify-otp', {
                email: email, // Używamy email zapisanego w stanie
                code: data.otp,
            });
            if (response.data.message === 'Kod poprawny') {
                setStep(3);
            }
        } catch (err) {
            alert(err.response?.data?.message || t('auth.forgot.errors.verify'));
        }
    };

    const handleResetPassword = async (data) => {
        try {
            if (data.newPassword !== data.confirmPassword) {
                alert(t('auth.forgot.passwordMismatch'));
                return;
            }

            await api.post('/auth/reset-password', {
                email: email, // Używamy email zapisanego w stanie
                newPassword: data.newPassword,
            });

            alert(t('auth.forgot.success'));
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || t('auth.forgot.errors.reset'));
        }
    };

    // JEDNA funkcja "master" do obsługi submit
    const onMasterSubmit = (data) => {
        if (step === 1) {
            handleSendOtp(data);
        } else if (step === 2) {
            handleVerifyOtp(data);
        } else if (step === 3) {
            handleResetPassword(data);
        }
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Left Panel - PRZYWRÓCONA TREŚĆ */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-12 md:flex md:w-1/2">
                <div className="relative z-10 mt-auto">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                        {t('auth.forgot.heroTitle')}
                    </h2>
                    <p className="max-w-md text-lg text-emerald-50">
                        {t('auth.forgot.heroSubtitle')}
                    </p>

                    <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-emerald-800/20 blur-3xl" />
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* PRZYWRÓCONE NAGŁÓWKI I LOGO */}
                    <div className="text-center">
                        <div className="mb-2 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                            <span className="text-3xl font-bold text-white">
                                W
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                            {step === 1
                                ? t('auth.forgot.steps.resetTitle')
                                : step === 2
                                  ? t('auth.forgot.steps.verifyTitle')
                                  : t('auth.forgot.steps.changeTitle')}
                        </h2>
                        <p className="mt-3 text-base text-gray-500">
                            {step === 1
                                ? t('auth.forgot.steps.resetDesc')
                                : step === 2
                                  ? t('auth.forgot.steps.verifyDesc')
                                  : t('auth.forgot.steps.changeDesc')}
                        </p>
                    </div>

                    {/* JEDEN FORMULARZ, który owija wszystkie kroki */}
                    <form
                        onSubmit={handleSubmit(onMasterSubmit)}
                        className="mt-8 space-y-6"
                    >
                        {step === 1 && (
                            <>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('auth.login.emailLabel')}
                                    </label>
                                    <input
                                        {...register('email', {
                                            required: t('auth.validation.emailRequired'),
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: t('auth.validation.emailInvalid'),
                                            },
                                        })}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder={t('auth.login.emailPlaceholder')}
                                    />
                                    {errors.email && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    {t('auth.forgot.sendCode')}
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                        {t('auth.forgot.codeLabel')}
                                    </label>
                                    <input
                                        {...register('otp', {
                                            required: t('auth.validation.otpRequired'),
                                            pattern: {
                                                value: /^\d{6}$/,
                                                message: t('auth.validation.otpLength'),
                                            },
                                        })}
                                        maxLength={6}
                                        className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-center text-2xl tracking-widest text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                        placeholder="000000"
                                    />
                                    {errors.otp && (
                                        <p className="mt-2 text-sm text-red-600">
                                            {errors.otp.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    {t('auth.forgot.verifyBtn')}
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                {' '}
                                {/* Dodatkowy div dla zachowania space-y-6 z formularza */}
                                <div className="space-y-5">
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('auth.forgot.newPasswordLabel')}
                                        </label>
                                        <input
                                            type="password"
                                            {...register('newPassword', {
                                                required: t('auth.validation.passwordRequired'),
                                                minLength: {
                                                    value: 8,
                                                    message: t('auth.validation.passwordMin8'),
                                                },
                                            })}
                                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="********"
                                        />
                                        {errors.newPassword && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.newPassword.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                            {t('auth.forgot.confirmPasswordLabel')}
                                        </label>
                                        <input
                                            type="password"
                                            {...register('confirmPassword', {
                                                required: t('auth.validation.confirmRequired'),
                                                validate: (value) =>
                                                    value ===
                                                        watch('newPassword') ||
                                                    t('auth.validation.passwordMismatch'),
                                            })}
                                            className="block w-full rounded-xl border border-gray-300 bg-white px-4 py-3.5 text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                                            placeholder="********"
                                        />
                                        {errors.confirmPassword && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.confirmPassword.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                >
                                    {t('auth.forgot.changeBtn')}
                                    <svg
                                        className="h-5 w-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </form>
                    {/* Koniec JEDNEGO formularza */}

                    <div className="text-center">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-500"
                        >
                            {t('auth.forgot.backToLogin')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Forgot;
