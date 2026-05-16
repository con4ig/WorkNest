import Navbar from '../components/Navbar';
import { Shield, Mail, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../config';

function PrivacyPolicy() {
    const { t } = useTranslation();
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                {/* Header Section */}
                <header className="border-b border-zinc-200 dark:border-white/5 pt-32 pb-16">
                    <div className="container mx-auto max-w-4xl px-6">
                        <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-500">
                            <Shield className="h-6 w-6" />
                            <span className="text-sm font-semibold tracking-wider uppercase">{t('privacy.title')}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            {t('privacy.title')}
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
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
                                <span className="text-emerald-600/50 font-mono text-sm">01</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-emerald-500 transition-colors">
                                        {t('privacy.section1.title')}
                                    </h2>
                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                                            {t('privacy.section1.description', {
                                                url: siteConfig.siteUrl,
                                            })}
                                        </p>
                                        
                                        <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5">
                                            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-emerald-500" />
                                                {t('privacy.section1.ado.title')}
                                            </h3>
                                            <div className="text-lg font-medium mb-1">{siteConfig.administratorName}</div>
                                            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                                                {t('privacy.section1.ado.description')}
                                            </p>
                                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 hover:underline">
                                                <Mail className="h-4 w-4" />
                                                <a href={`mailto:${siteConfig.administratorEmail}`}>
                                                    {siteConfig.administratorEmail}
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
                                <span className="text-emerald-600/50 font-mono text-sm">02</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-emerald-500 transition-colors">
                                        {t('privacy.section2.title')}
                                    </h2>
                                    <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8">
                                        {t('privacy.section2.description')}
                                    </p>
                                    
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="p-6 rounded-xl border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors">
                                                <h4 className="font-semibold mb-2">
                                                    {t(`privacy.section2.point${i}.title`)}
                                                </h4>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                    {t(`privacy.section2.point${i}.description`)}
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
                                <span className="text-emerald-600/50 font-mono text-sm">03</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-emerald-500 transition-colors">
                                        {t('privacy.section3.title')}
                                    </h2>
                                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                                        <p className="text-zinc-600 dark:text-zinc-400 mb-8">{t('privacy.section3.description')}</p>
                                        <ul className="space-y-4 list-none p-0">
                                            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                                                <li key={i} className="flex items-start gap-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-white/5">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                    <span className="text-sm leading-relaxed">{t(`privacy.section3.rights.point${i}`)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <p className="mt-8 text-sm text-zinc-500">
                                            {t('privacy.section3.rights.footer')}{' '}
                                            <a href={`mailto:${siteConfig.administratorEmail}`} className="text-emerald-600 dark:text-emerald-500 font-medium hover:underline">
                                                {siteConfig.administratorEmail}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section IV & V simplified for flow */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="p-8 rounded-2xl border border-zinc-200 dark:border-white/5">
                                <h2 className="text-xl font-semibold mb-4">{t('privacy.section4.title')}</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
                                    {t('privacy.section4.description')}
                                </p>
                            </section>
                            <section className="p-8 rounded-2xl border border-zinc-200 dark:border-white/5">
                                <h2 className="text-xl font-semibold mb-4">{t('privacy.section5.title')}</h2>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
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
