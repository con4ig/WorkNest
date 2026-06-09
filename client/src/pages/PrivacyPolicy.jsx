import Navbar from '../components/Navbar';
import { Shield, Mail, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../config';
import useDocumentMetadata from '../hooks/useDocumentMetadata';

function PrivacyPolicy() {
    const { t } = useTranslation();
    useDocumentMetadata(t('seo.privacy.title'), t('seo.privacy.description'));
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                {/* Header Section */}
                <header className="border-b border-zinc-200 pb-16 pt-32 dark:border-white/5">
                    <div className="container mx-auto max-w-4xl px-6">
                        <div className="mb-6 flex items-center gap-3 text-emerald-600 dark:text-emerald-500">
                            <Shield className="h-6 w-6" />
                            <span className="text-sm font-semibold uppercase tracking-wider">
                                {t('privacy.title')}
                            </span>
                        </div>
                        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
                            {t('privacy.title')}
                        </h1>
                        <p className="text-lg text-zinc-500 dark:text-zinc-400">
                            {t('privacy.effectiveDate', {
                                date: siteConfig.effectiveDate,
                            })}
                        </p>
                    </div>
                </header>

                <main className="container mx-auto max-w-4xl px-6 py-20">
                    <div className="grid grid-cols-1 gap-20">
                        {/* Section I */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-emerald-600/50">
                                    01
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-emerald-500">
                                        {t('privacy.section1.title')}
                                    </h2>
                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="mb-8 leading-relaxed text-zinc-600 dark:text-zinc-400">
                                            {t('privacy.section1.description', {
                                                url: siteConfig.siteUrl,
                                            })}
                                        </p>

                                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-8 dark:border-white/5 dark:bg-zinc-900/50">
                                            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                                <Zap className="h-4 w-4 text-emerald-500" />
                                                {t(
                                                    'privacy.section1.ado.title',
                                                )}
                                            </h3>
                                            <div className="mb-1 text-lg font-medium">
                                                {siteConfig.administratorName}
                                            </div>
                                            <p className="mb-6 text-zinc-500 dark:text-zinc-400">
                                                {t(
                                                    'privacy.section1.ado.description',
                                                )}
                                            </p>
                                            <div className="flex items-center gap-2 text-emerald-600 hover:underline dark:text-emerald-500">
                                                <Mail className="h-4 w-4" />
                                                <a
                                                    href={`mailto:${siteConfig.administratorEmail}`}
                                                >
                                                    {
                                                        siteConfig.administratorEmail
                                                    }
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section II */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-emerald-600/50">
                                    02
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-emerald-500">
                                        {t('privacy.section2.title')}
                                    </h2>
                                    <p className="mb-8 leading-relaxed text-zinc-600 dark:text-zinc-400">
                                        {t('privacy.section2.description')}
                                    </p>

                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div
                                                key={i}
                                                className="rounded-xl border border-zinc-200 p-6 transition-colors hover:bg-zinc-50 dark:border-white/5 dark:hover:bg-white/[0.02]"
                                            >
                                                <h4 className="mb-2 font-semibold">
                                                    {t(
                                                        `privacy.section2.point${i}.title`,
                                                    )}
                                                </h4>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {t(
                                                        `privacy.section2.point${i}.description`,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section III */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="font-mono text-sm text-emerald-600/50">
                                    03
                                </span>
                                <div className="flex-1">
                                    <h2 className="mb-6 text-2xl font-semibold transition-colors group-hover:text-emerald-500">
                                        {t('privacy.section3.title')}
                                    </h2>
                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
                                            {t('privacy.section3.description')}
                                        </p>
                                        <ul className="list-none space-y-4 p-0">
                                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/5 dark:bg-zinc-900/30"
                                                >
                                                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                                    <span className="text-sm leading-relaxed">
                                                        {t(
                                                            `privacy.section3.rights.point${i}`,
                                                        )}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-8 text-sm text-zinc-500">
                                            {t(
                                                'privacy.section3.rights.footer',
                                            )}{' '}
                                            <a
                                                href={`mailto:${siteConfig.administratorEmail}`}
                                                className="font-medium text-emerald-600 hover:underline dark:text-emerald-500"
                                            >
                                                {siteConfig.administratorEmail}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section IV & V simplified for flow */}
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                            <section className="rounded-2xl border border-zinc-200 p-8 dark:border-white/5">
                                <h2 className="mb-4 text-xl font-semibold">
                                    {t('privacy.section4.title')}
                                </h2>
                                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    {t('privacy.section4.description')}
                                </p>
                            </section>
                            <section className="rounded-2xl border border-zinc-200 p-8 dark:border-white/5">
                                <h2 className="mb-4 text-xl font-semibold">
                                    {t('privacy.section5.title')}
                                </h2>
                                <p className="text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                                    {t('privacy.section5.description')}
                                </p>
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}

export default PrivacyPolicy;
