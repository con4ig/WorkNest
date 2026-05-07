import Navbar from '../components/Navbar';
import { FileText, Shield, Zap } from 'lucide-react';
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
            <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 transition-colors duration-300">
                {/* Sekcja Hero dla Dokumentu */}
                <div className="border-b-4 border-teal-500/50 bg-white dark:bg-zinc-900 py-16 shadow-lg lg:py-24 transition-colors">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-teal-600" />
                        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white lg:text-5xl">
                            {t('terms.title')}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {t('terms.effectiveDate')}
                        </p>
                    </div>
                </div>

                {/* Główna treść Regulaminu */}
                <div className="container mx-auto max-w-4xl px-4 py-16">
                    {/* Sekcja I: Postanowienia Ogólne */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('terms.section1.title')}
                        </h2>
                        <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 p-6">
                            <h3 className="mb-2 flex items-center text-xl font-semibold text-gray-800 dark:text-gray-100">
                                <Zap className="mr-2 h-5 w-5 text-emerald-600" />
                                {t('terms.adminInfo.title')}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                {t('terms.adminInfo.description')}
                                <br />
                                **{administrator.nazwa}**
                                <br />
                                E-mail: {administrator.email}
                            </p>
                        </div>
                        <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
                            1. {t('terms.section1.point1')}
                        </p>
                        <p className="mb-3 leading-relaxed text-gray-700 dark:text-gray-300">
                            2. {t('terms.section1.point2')}
                        </p>
                        <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                            3. {t('terms.section1.point3')}
                        </p>
                    </section>

                    {/* Sekcja II: Warunki Korzystania */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('terms.section2.title')}
                        </h2>
                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white dark:bg-zinc-900 p-4 shadow-md border dark:border-white/5">
                                <strong className="flex items-center text-gray-900 dark:text-white">
                                    <Shield className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    {t('terms.section2.tech.title')}
                                </strong>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t('terms.section2.tech.description')}
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white dark:bg-zinc-900 p-4 shadow-md border dark:border-white/5">
                                <strong className="flex items-center text-gray-900 dark:text-white">
                                    <Zap className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    {t('terms.section2.user.title')}
                                </strong>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t('terms.section2.user.description')}
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja III: Odpowiedzialność */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('terms.section3.title')}
                        </h2>
                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white dark:bg-zinc-900 p-4 shadow-md border dark:border-white/5">
                                <strong className="flex items-center text-gray-900 dark:text-white">
                                    <Shield className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    {t('terms.section3.liability.title')}
                                </strong>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t('terms.section3.liability.description')}
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white dark:bg-zinc-900 p-4 shadow-md border dark:border-white/5">
                                <strong className="flex items-center text-gray-900 dark:text-white">
                                    <FileText className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    {t('terms.section3.copyright.title')}
                                </strong>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t('terms.section3.copyright.description')}
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja IV: Postanowienia Końcowe */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            {t('terms.section4.title')}
                        </h2>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            1. {t('terms.section4.point1')}
                        </p>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            2. {t('terms.section4.point2')}
                        </p>
                    </section>
                </div>

                {/* Kontener pod stopką */}
                <div className="pb-16" />
            </div>
        </>
    );
}

export default TermsOfService;
