import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api.js';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Select } from '../components/ui/Select';

const Icon = {
    ArrowRight: () => <ArrowRight className="h-5 w-5" />,
};

const createRegistrationSchema = (t) =>
    z
        .object({
            email: z
                .string()
                .min(1, { message: t('auth.validation.emailRequired') })
                .email({ message: t('auth.validation.emailInvalid') }),
            username: z
                .string()
                .min(1, { message: t('auth.validation.usernameRequired') }),
            password: z
                .string()
                .min(6, { message: t('auth.validation.passwordMin') }),
            role: z.enum(['admin', 'employee']),
            companyName: z.string().optional(),
            invitationCode: z.string().optional(),
        })
        .superRefine((data, ctx) => {
            if (
                data.role === 'admin' &&
                (!data.companyName || data.companyName.trim().length === 0)
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['companyName'],
                    message: t('auth.validation.companyRequired'),
                });
            }
            if (
                data.role === 'employee' &&
                (!data.invitationCode ||
                    data.invitationCode.trim().length === 0)
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['invitationCode'],
                    message: t('auth.validation.codeRequired'),
                });
            }
        });

export default function Register() {
    const { t } = useTranslation();
    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(createRegistrationSchema(t)),
        defaultValues: {
            role: 'admin',
            email: '',
            username: '',
            password: '',
            companyName: '',
            invitationCode: '',
        },
    });
    const navigate = useNavigate();
    const selectedRole = watch('role', 'admin');
    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const registrationData = {
                email: data.email,
                username: data.username,
                password: data.password,
                role: data.role,
                companyName: data.companyName,
                invitationCode: data.invitationCode,
            };

            // Clean data before sending
            if (registrationData.role === 'admin') {
                delete registrationData.invitationCode;
            } else if (registrationData.role === 'employee') {
                delete registrationData.companyName;
            }

            await api.post('/auth/register', registrationData);

            toast.success(t('auth.register.success'));
            navigate('/login');
        } catch (err) {
            toast.error(
                err.response?.data?.message || t('auth.register.error'),
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row">
            {/* Left Panel - Decorative */}
            <div className="relative hidden overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 p-12 md:flex md:w-1/2">
                <div className="relative z-10 mt-auto">
                    <h2 className="mb-6 text-4xl font-bold text-white">
                        {t('auth.welcome.title')}
                    </h2>
                    <p className="max-w-md text-lg text-emerald-50">
                        {t('auth.welcome.subtitle')}
                    </p>

                    {/* Decorative elements */}
                    <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute bottom-0 left-0 h-96 w-96 -translate-x-1/2 translate-y-1/2 transform rounded-full bg-emerald-800/20 blur-3xl" />
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="flex flex-1 items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md space-y-8">
                    {/* Logo & Header */}
                    <div className="text-center">
                        <Link
                            to="/"
                            className="group mb-6 inline-flex transform flex-col items-center transition-transform duration-300 hover:scale-105"
                        >
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-2xl transition-all group-hover:shadow-2xl group-hover:shadow-emerald-500/50">
                                <span className="text-3xl font-bold text-white">
                                    W
                                </span>
                            </div>
                        </Link>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground">
                            {t('auth.register.title')}
                        </h2>
                        <p className="mt-3 text-base text-gray-500">
                            {t('auth.register.hasAccount')}{' '}
                            <Link
                                to="/login"
                                className="font-medium text-emerald-600 transition-colors hover:text-emerald-500"
                            >
                                {t('auth.register.loginLink')}
                            </Link>
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="mt-8 space-y-8"
                    >
                        <div className="space-y-5">
                            <div>
                                <label
                                    htmlFor="register-email"
                                    className="mb-1.5 block text-sm font-medium text-muted-foreground"
                                >
                                    {t('auth.login.emailLabel')}
                                </label>
                                <div className="group relative">
                                    <input
                                        id="register-email"
                                        {...register('email')}
                                        className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder={t(
                                            'auth.login.emailPlaceholder',
                                        )}
                                    />
                                    {errors.email && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                />
                                            </svg>
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="register-username"
                                    className="mb-1.5 block text-sm font-medium text-muted-foreground"
                                >
                                    {t('auth.register.usernameLabel')}
                                </label>
                                <div className="group relative">
                                    <input
                                        id="register-username"
                                        {...register('username')}
                                        className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        placeholder={t(
                                            'auth.register.usernamePlaceholder',
                                        )}
                                    />
                                    {errors.username && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                />
                                            </svg>
                                            {errors.username.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="register-password"
                                    className="mb-1.5 block text-sm font-medium text-muted-foreground"
                                >
                                    {t('auth.login.passwordLabel')}
                                </label>
                                <div className="group relative">
                                    <input
                                        id="register-password"
                                        {...register('password')}
                                        className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        type="password"
                                        placeholder="********"
                                    />
                                    {errors.password && (
                                        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                            <svg
                                                className="h-4 w-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                />
                                            </svg>
                                            {errors.password.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label
                                    htmlFor="register-role"
                                    className="mb-1.5 block text-sm font-medium text-muted-foreground"
                                >
                                    {t('auth.register.roleLabel')}
                                </label>
                                <Select
                                    id="register-role"
                                    {...register('role')}
                                >
                                    <option value="admin">
                                        {t('auth.register.roleAdmin')}
                                    </option>
                                    <option value="employee">
                                        {t('auth.register.roleEmployee')}
                                    </option>
                                </Select>
                            </div>

                            {selectedRole === 'admin' ? (
                                <div>
                                    <label
                                        htmlFor="register-company"
                                        className="mb-1.5 block text-sm font-medium text-muted-foreground"
                                    >
                                        {t('auth.register.companyLabel')}
                                    </label>
                                    <div className="group relative">
                                        <input
                                            id="register-company"
                                            {...register('companyName')}
                                            className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            placeholder={t(
                                                'auth.register.companyPlaceholder',
                                            )}
                                        />
                                        {errors.companyName && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    />
                                                </svg>
                                                {errors.companyName.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label
                                        htmlFor="register-code"
                                        className="mb-1.5 block text-sm font-medium text-muted-foreground"
                                    >
                                        {t('auth.register.codeLabel')}
                                    </label>
                                    <div className="group relative">
                                        <input
                                            id="register-code"
                                            {...register('invitationCode')}
                                            className="block w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground transition-all duration-200 placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                            placeholder={t(
                                                'auth.register.codePlaceholder',
                                            )}
                                        />
                                        {errors.invitationCode && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
                                                <svg
                                                    className="h-4 w-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                                    />
                                                </svg>
                                                {errors.invitationCode.message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                            {isLoading
                                ? t('auth.register.loading')
                                : t('auth.register.submit')}
                            {!isLoading && <Icon.ArrowRight />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
