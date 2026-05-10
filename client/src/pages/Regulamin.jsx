import Navbar from '../components/Navbar';
import { FileText, Shield, Zap, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function TermsOfService() {
    const { t } = useTranslation();
    const administrator = {
        nazwa: t('terms.adminInfo.owner'),
        email: 's.szymon11@interia.pl',
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
                {/* Header Section */}
                <header className="border-b border-zinc-200 dark:border-white/5 pt-32 pb-16">
                    <div className="container mx-auto max-w-4xl px-6">
                        <div className="flex items-center gap-3 mb-6 text-teal-600 dark:text-teal-500">
                            <FileText className="h-6 w-6" />
                            <span className="text-sm font-semibold tracking-wider uppercase">{t('terms.title')}</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Regulamin Serwisu
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 text-lg">
                            {t('terms.effectiveDate')}
                        </p>
                    </div>
                </header>

                <main className="container mx-auto max-w-4xl px-6 py-20">
                    <div className="grid grid-cols-1 gap-20">
                        {/* Section I: Admin Info */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="text-teal-600/50 font-mono text-sm">01</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-teal-500 transition-colors">
                                        {t('terms.section1.title')}
                                    </h2>
                                    
                                    <div className="p-8 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 mb-8">
                                        <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-teal-500" />
                                            {t('terms.adminInfo.title')}
                                        </h3>
                                        <div className="text-lg font-medium mb-1">{administrator.nazwa}</div>
                                        <p className="text-zinc-500 dark:text-zinc-400 mb-6">
                                            {t('terms.adminInfo.description')}
                                        </p>
                                        <div className="flex items-center gap-2 text-teal-600 dark:text-teal-500">
                                            <Mail className="h-4 w-4" />
                                            <span className="font-medium">{administrator.email}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3 text-zinc-600 dark:text-zinc-400">
                                        {[1, 2, 3].map((i) => (
                                            <p key={i} className="leading-relaxed">
                                                {i}. {t(`terms.section1.point${i}`)}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section II: Usage Terms */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="text-teal-600/50 font-mono text-sm">02</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-teal-500 transition-colors">
                                        {t('terms.section2.title')}
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['tech', 'user'].map((key) => (
                                            <div key={key} className="p-6 rounded-xl border border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-all">
                                                <div className="flex items-center gap-2 mb-3 text-emerald-600 dark:text-emerald-500">
                                                    {key === 'tech' ? <Shield className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                                                    <h4 className="font-semibold text-zinc-900 dark:text-white">
                                                        {t(`terms.section2.${key}.title`)}
                                                    </h4>
                                                </div>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                                    {t(`terms.section2.${key}.description`)}
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
                                <span className="text-teal-600/50 font-mono text-sm">03</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-teal-500 transition-colors">
                                        {t('terms.section3.title')}
                                    </h2>
                                    
                                    <div className="space-y-4">
                                        {['liability', 'copyright'].map((key) => (
                                            <div key={key} className="p-6 rounded-xl border border-zinc-200 dark:border-white/5 flex gap-4">
                                                <div className="mt-1">
                                                    {key === 'liability' ? <Shield className="h-5 w-5 text-teal-600" /> : <FileText className="h-5 w-5 text-teal-600" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold mb-1 text-zinc-900 dark:text-white">
                                                        {t(`terms.section3.${key}.title`)}
                                                    </h4>
                                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                        {t(`terms.section3.${key}.description`)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section IV: Final Provisions */}
                        <section className="group">
                            <div className="flex items-baseline gap-6">
                                <span className="text-teal-600/50 font-mono text-sm">04</span>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-semibold mb-6 group-hover:text-teal-500 transition-colors">
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
