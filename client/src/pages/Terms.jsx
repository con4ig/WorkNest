import Navbar from '../components/Navbar';
import { FileText, Shield, Zap, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

function TermsOfService() {
    const { t } = useTranslation();
    useDocumentMetadata(t('seo.terms.title'), t('seo.terms.description'));
    const administrator = {
        nazwa: t('terms.adminInfo.owner'),
        email: 's.szymon11@interia.pl',
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                {/* Header Section */}
                <header className="border-b border-zinc-200 pb-16 pt-32 dark:border-white/5">
                    <div className="container mx-auto max-w-4xl px-6">
                        <div className="mb-6 flex items-center gap-3 text-teal-600 dark:text-teal-500">
                            <FileText className="h-6 w-6" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {t('terms.title')}
                            </span>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                            {t('terms.title')}
                        </h1>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400">
                            {t('terms.effectiveDate')}
                        </p>
                    </div>
                </header>

                <main className="container mx-auto max-w-4xl px-6 py-20">
                    <div className="grid grid-cols-1 gap-20">
                        {/* Section I: Admin Info */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-teal-600/50">
                                    01
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-teal-500">
                                        {t('terms.section1.title')}
                                    </h2>

                                    <div className="mb-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-white/5 dark:bg-zinc-900/50">
                                        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                            <Zap className="h-4 w-4 text-teal-500" />
                                            {t('terms.adminInfo.title')}
                                        </h3>
                                        <div className="mb-1 text-lg font-medium">
                                            {administrator.nazwa}
                                        </div>
                                        <p className="mb-6 text-zinc-500 dark:text-zinc-400">
                                            {t('terms.adminInfo.description')}
                                        </p>
                                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-500">
                                            <Mail className="h-4 w-4" />
                                            <span className="font-medium">
                                                {administrator.email}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                        {[1, 2, 3].map((i) => (
                                            <p
                                                key={i}
                                                className="leading-relaxed"
                                            >
                                                {i}.{' '}
                                                {t(`terms.section1.point${i}`)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section II: Usage Terms */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-teal-600/50">
                                    02
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-teal-500">
                                        {t('terms.section2.title')}
                                    </h2>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {['tech', 'user'].map((key) => (
                                            <div
                                                key={key}
                                                className="rounded-xl border border-zinc-200 p-6 transition-all hover:bg-zinc-50 dark:border-white/5 dark:hover:bg-white/[0.02]"
                                            >
                                                <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                                                    {key === 'tech' ? (
                                                        <Shield className="h-4 w-4" />
                                                    ) : (
                                                        <Zap className="h-4 w-4" />
                                                    )}
                                                    <h4 className="font-semibold text-zinc-900 dark:text-white">
                                                        {t(
                                                            `terms.section2.${key}.title`,
                                                        )}
                                                    </h4>
                                                </div>
                                                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                                    {t(
                                                        `terms.section2.${key}.description`,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section III: Liability */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-teal-600/50">
                                    03
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-teal-500">
                                        {t('terms.section3.title')}
                                    </h2>

                                    <div className="space-y-4">
                                        {['liability', 'copyright'].map(
                                            (key) => (
                                                <div
                                                    key={key}
                                                    className="flex gap-4 rounded-xl border border-zinc-200 p-6 dark:border-white/5"
                                                >
                                                    <div className="mt-1">
                                                        {key === 'liability' ? (
                                                            <Shield className="h-5 w-5 text-teal-600" />
                                                        ) : (
                                                            <FileText className="h-5 w-5 text-teal-600" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="mb-1 font-semibold text-zinc-900 dark:text-white">
                                                            {t(
                                                                `terms.section3.${key}.title`,
                                                            )}
                                                        </h4>
                                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                            {t(
                                                                `terms.section3.${key}.description`,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section IV: Final Provisions */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-teal-600/50">
                                    04
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-teal-500">
                                        {t('terms.section4.title')}
                                    </h2>
                                    <div className="space-y-3 text-zinc-500 dark:text-zinc-400">
                                        <p>1. {t('terms.section4.point1')}</p>
                                        <p>2. {t('terms.section4.point2')}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}

export default TermsOfService;
