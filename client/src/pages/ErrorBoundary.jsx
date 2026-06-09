import React from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('🔴 Error Boundary caught:', error, errorInfo);

        if (
            error.message?.includes('401') ||
            error.message?.includes('Unauthorized')
        ) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    render() {
        const { t } = this.props;

        if (this.state.hasError) {
            return (
                <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12 transition-colors duration-300 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 sm:px-6 lg:px-8">
                    {/* Decorative background elements */}
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -right-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-red-100 opacity-30 mix-blend-multiply blur-xl filter dark:bg-red-900/20 dark:mix-blend-normal"></div>
                        <div className="absolute -bottom-40 -left-40 h-80 w-80 animate-pulse rounded-full bg-slate-100 opacity-30 mix-blend-multiply blur-xl filter dark:bg-slate-800/20 dark:mix-blend-normal"></div>
                    </div>

                    {/* Main card */}
                    <div className="relative w-full max-w-lg">
                        <div className="rounded-3xl border border-slate-100 bg-white px-8 py-12 shadow-2xl shadow-slate-200/50 dark:border-white/5 dark:bg-zinc-900 dark:shadow-black/50 sm:px-12 sm:py-16">
                            {/* Error icon with animation */}
                            <div className="mb-8 flex justify-center">
                                <div className="relative">
                                    {/* Outer ring - pulsing effect */}
                                    <div className="absolute inset-0 animate-ping rounded-full bg-red-100 opacity-75 dark:bg-red-900/20"></div>

                                    {/* Main icon container */}
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 ring-8 ring-red-50 dark:from-red-900/30 dark:to-red-800/30 dark:ring-red-900/10">
                                        <svg
                                            className="h-10 w-10 text-red-600 dark:text-red-500"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                                    {t('common.errorBoundary.title')}
                                </h2>

                                <p className="mx-auto max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-400">
                                    {t('common.errorBoundary.description')}
                                </p>
                            </div>

                            {/* Przycisk akcji */}
                            <div className="mt-10">
                                <button
                                    type="button"
                                    onClick={() =>
                                        (window.location.href = '/login')
                                    }
                                    className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:from-white dark:to-zinc-200 dark:text-black dark:shadow-white/5 dark:hover:shadow-white/10 dark:focus:ring-white dark:focus:ring-offset-zinc-900"
                                >
                                    <span>
                                        {t('common.errorBoundary.button')}
                                    </span>
                                    <svg
                                        className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
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
                            </div>

                            {/* Dodatkowa informacja */}
                            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-500">
                                {t('common.errorBoundary.contactSupport')}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

const ErrorBoundaryWithTranslation = withTranslation()(ErrorBoundary);
export default ErrorBoundaryWithTranslation;
