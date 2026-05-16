import Navbar from '../components/Navbar.jsx';
import demo from '../assets/demo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import toast from 'react-hot-toast';
import { useTranslation, Trans } from 'react-i18next';
import {
    Zap,
    Users,
    Rocket,
    ShieldCheck,
    Layout,
    Play,
    Lock,
    Loader2,
} from 'lucide-react';

function Landing() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { demoLogin } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const features = [
        {
            title: t('landing.features.Management.Title'),
            description: t('landing.features.Management.Desc'),
            icon: Zap,
        },
        {
            title: t('landing.features.Collaboration.Title'),
            description: t('landing.features.Collaboration.Desc'),
            icon: Users,
        },
        {
            title: t('landing.features.Analytics.Title'),
            description: t('landing.features.Analytics.Desc'),
            icon: Play,
        },
    ];

    const values = [
        {
            value: t('landing.values.Intuitive.Title'),
            label: t('landing.values.Intuitive.Desc'),
            icon: Layout,
        },
        {
            value: t('landing.values.Fast.Title'),
            label: t('landing.values.Fast.Desc'),
            icon: Zap,
        },
        {
            value: t('landing.values.Secure.Title'),
            label: t('landing.values.Secure.Desc'),
            icon: Lock,
        },
    ];

    return (
        <div className="min-h-screen select-none bg-background text-foreground transition-colors duration-300">
            <Navbar />

            <div className="relative overflow-hidden pt-12">
                <div className="pointer-events-none absolute inset-0 z-0 opacity-40 dark:opacity-30">
                    <div className="absolute right-0 top-0 h-[450px] w-[450px] -translate-y-1/3 translate-x-1/3 rounded-full bg-primary/20 blur-[150px]" />
                    <div className="absolute bottom-0 left-0 h-[550px] w-[550px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/15 blur-[180px]" />
                </div>

                <main className="container relative z-10 mx-auto px-4 py-16 lg:py-24">
                    {/* Hero */}
                    <div className="mx-auto mb-16 max-w-screen-2xl px-4 text-center md:mb-24">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary md:text-sm">
                            {t('landing.hero.Badge')}
                        </p>
                        <h1 className="mb-6 text-3xl font-extrabold leading-tight tracking-tighter text-foreground sm:text-4xl md:mb-8 md:text-6xl lg:text-7xl xl:text-8xl">
                            <Trans i18nKey="landing.hero.Title">
                                Discover a new dimension of
                                <span className="block text-primary">
                                    efficiency in your HR
                                </span>
                            </Trans>
                        </h1>
                        <p className="mx-auto mb-8 max-w-3xl px-4 text-base font-light text-muted-foreground sm:text-lg md:mb-10 md:text-xl lg:text-2xl">
                            {t('landing.hero.Subtitle')}
                        </p>
                        <div className="flex justify-center px-4">
                            <button
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        await demoLogin();
                                        navigate('/dashboard');
                                    } catch (err) {
                                        toast.error(t('landing.hero.LoginError') || 'Demo login error');
                                        console.error(err);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading}
                                className={`flex items-center justify-center gap-2 rounded-xl px-8 py-3 text-base font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all duration-300 md:px-10 md:py-4 md:text-lg ${
                                    isLoading
                                        ? 'cursor-not-allowed bg-muted text-muted-foreground'
                                        : 'bg-primary hover:scale-[1.02] hover:bg-primary/90'
                                }`}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                                        {t('landing.hero.Loading')}
                                    </>
                                ) : (
                                    t('landing.hero.Cta')
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Values */}
                    <div className="mx-4 mb-16 rounded-2xl border border-border bg-card p-6 shadow-xl shadow-primary/5 md:mb-32 md:rounded-3xl md:p-9">
                        <div className="grid gap-6 divide-y divide-border text-center md:grid-cols-3 md:gap-8 md:divide-x md:divide-y-0">
                            {values.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center px-4 py-4 md:px-6 md:py-0"
                                >
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <item.icon className="h-7 w-7" aria-hidden="true" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-bold text-foreground">
                                        {item.value}
                                    </h3>
                                    <p className="text-sm font-medium text-muted-foreground md:text-base">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feature Spotlight */}
                    <div className="mb-32 py-16">
                        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row">
                            <div className="text-left lg:w-1/2">
                                <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-primary">
                                    {t('landing.integration.Badge')}
                                </p>
                                <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground lg:text-5xl">
                                    {t('landing.integration.Title')}
                                </h2>
                                <p className="mb-8 text-xl text-muted-foreground">
                                    {t('landing.integration.Desc')}
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        t('landing.integration.List.1'),
                                        t('landing.integration.List.2'),
                                        t('landing.integration.List.3'),
                                    ].map((item, i) => (
                                        <li
                                            key={i}
                                            className="flex items-start text-lg text-foreground/80"
                                        >
                                            <ShieldCheck className="mr-3 mt-1 h-6 w-6 flex-shrink-0 text-primary" aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative p-4 lg:w-1/2">
                                <div className="absolute inset-0 -rotate-2 scale-105 transform rounded-3xl bg-primary/5 shadow-xl"></div>
                                <div className="relative rounded-3xl border border-border bg-card p-8 shadow-2xl">
                                    <div className="mb-6 flex items-center justify-between">
                                        <span className="text-xl font-semibold text-foreground">
                                            {t('landing.integration.PanelLabel') || 'Management Panel'}
                                        </span>
                                        <div className="h-3 w-16 rounded-full bg-primary"></div>
                                    </div>
                                    <div className="overflow-hidden rounded-xl border border-primary/20 bg-muted">
                                        <img
                                            src={demo}
                                            alt={t('landing.integration.DemoAlt', { defaultValue: 'WorkNest dashboard preview' })}
                                            loading="lazy"
                                            className="h-auto w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="mx-auto mb-16 max-w-4xl text-center">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                            {t('landing.features.Title')}
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-foreground">
                            {t('landing.features.Subtitle')}
                        </h2>
                    </div>
                    <div className="mx-auto mb-32 grid max-w-7xl gap-8 md:grid-cols-3">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="rounded-3xl border border-border bg-card p-8 shadow-xl transition-transform duration-300 hover:-translate-y-1 dark:shadow-none"
                            >
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/10">
                                    <feature.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                                </div>
                                <h2 className="mb-3 text-2xl font-bold text-foreground">
                                    {feature.title}
                                </h2>
                                <p className="text-base text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* How It Works */}
                    <div className="mb-32 rounded-3xl border border-border bg-card p-12 shadow-xl dark:shadow-none">
                        <div className="mx-auto mb-12 max-w-4xl text-center">
                            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-primary">
                                {t('landing.howItWorks.Badge')}
                            </p>
                            <h2 className="text-4xl font-bold tracking-tight text-foreground">
                                {t('landing.howItWorks.Title')}
                            </h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-3">
                            {[1, 2, 3].map((step) => (
                                <div
                                    key={step}
                                    className="rounded-2xl border border-border bg-muted/30 p-8 text-center transition-colors hover:bg-muted/50"
                                >
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                                        {step}
                                    </div>
                                    <h3 className="mb-3 text-xl font-bold text-foreground">
                                        {t(`landing.howItWorks.Step${step}.Title`)}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t(`landing.howItWorks.Step${step}.Desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            <footer className="mt-16 border-t border-border bg-muted/30 pt-8 pb-12 sm:pb-14">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} WorkNest. {t('landing.footer.Rights')}
                    </p>
                    <div className="mt-2 text-sm">
                        <Link
                            to="/polityka-prywatnosci"
                            className="mx-2 hover:text-primary focus-visible:text-primary focus-visible:underline focus-visible:outline-none"
                        >
                            {t('landing.footer.Privacy')}
                        </Link>
                        <span className="text-muted-foreground/50">|</span>
                        <Link
                            to="/regulamin"
                            className="mx-2 hover:text-primary focus-visible:text-primary focus-visible:underline focus-visible:outline-none"
                        >
                            {t('landing.footer.Terms')}
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Landing;
