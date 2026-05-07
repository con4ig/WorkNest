import Navbar from '../components/Navbar';
import { Shield, Mail, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { siteConfig } from '../config'; // Importuj konfigurację

function PrivacyPolicy() {
    const { t } = useTranslation();
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 transition-colors duration-300">
                {/* Sekcja Hero dla Dokumentu */}
                <div className="border-b-4 border-emerald-500/50 bg-white dark:bg-zinc-900 py-16 shadow-lg lg:py-24 transition-colors">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <Shield className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
                        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 dark:text-white lg:text-5xl">
                            {t('privacy.title')}
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            {t('privacy.effectiveDate', {
                                date: siteConfig.effectiveDate,
                            })}
                        </p>
                    </div>
                </div>

                {/* Główna treść Polityki */}
                <div className="container mx-auto max-w-4xl px-4 py-16">
                    {/* Sekcja I: Informacje ogólne */}
                    <section className="mb-12">
                        <h2 className="mb-4 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('privacy.section1.title')}
                        </h2>
                        <p className="mb-4 leading-relaxed text-gray-700">
                            {t('privacy.section1.description', {
                                url: siteConfig.siteUrl,
                            })}
                        </p>
                        <div className="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-900/10 p-6">
<h3 className="mb-2 flex items-center text-xl font-semibold text-gray-800 dark:text-gray-100">
                                <Zap className="mr-2 h-5 w-5 text-emerald-600" />
                                {t('privacy.section1.ado.title')}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300">
                                {t('privacy.section1.ado.description')}
                                <br />
                                **{siteConfig.administratorName}**
                                <br />
                                {t('privacy.section1.ado.contact')}{' '}
                                <a
                                    href={`mailto:${siteConfig.administratorEmail}`}
                                    className="font-medium text-teal-600"
                                >
                                    {siteConfig.administratorEmail}
                                </a>
                            </p>
                        </div>
                    </section>

                    {/* Sekcja II: Podstawy i cele przetwarzania */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('privacy.section2.title')}
                        </h2>
                        <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
                            {t('privacy.section2.description')}
                        </p>

                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white dark:bg-zinc-900 p-4 shadow-md border dark:border-white/5">
                                <strong className="text-gray-900 dark:text-white">
                                    {t('privacy.section2.point1.title')}
                                </strong>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t('privacy.section2.point1.description')}
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white dark:bg-zinc-900 p-4 shadow-md border dark:border-white/5">
                                <strong className="text-gray-900 dark:text-white">
                                    {t('privacy.section2.point2.title')}
                                </strong>
                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    {t('privacy.section2.point2.description')}
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja III: Prawa użytkowników */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('privacy.section3.title')}
                        </h2>
                        <p className="mb-6 leading-relaxed text-gray-700 dark:text-gray-300">
                            {t('privacy.section3.description')}
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700 dark:text-gray-300">
                            <li>{t('privacy.section3.rights.point1')}</li>
                            <li>{t('privacy.section3.rights.point2')}</li>
                            <li>{t('privacy.section3.rights.point3')}</li>
                            <li>{t('privacy.section3.rights.point4')}</li>
                            <li>{t('privacy.section3.rights.point5')}</li>
                            <li>{t('privacy.section3.rights.point6')}</li>
                            <li>{t('privacy.section3.rights.point7')}</li>
                        </ul>
                        <p className="mt-4 text-gray-700 dark:text-gray-300">
                            {t('privacy.section3.rights.footer')}{' '}
                            <a
                                href={`mailto:${siteConfig.administratorEmail}`}
                                className="font-medium text-teal-600"
                            >
                                {siteConfig.administratorEmail}
                            </a>
                            .
                        </p>
                    </section>

                    {/* Sekcja IV: Cookies */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('privacy.section4.title')}
                        </h2>
                        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                            {t('privacy.section4.description')}
                        </p>
                        <div className="flex items-start rounded-lg border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-900/10 p-4">
                            <Mail className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-teal-600" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                {t('privacy.section4.manage')}
                            </p>
                        </div>
                    </section>
                    {/* Sekcja V: Postanowienia końcowe */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900 dark:text-white">
                            {t('privacy.section5.title')}
                        </h2>
                        <p className="mb-4 leading-relaxed text-gray-700 dark:text-gray-300">
                            {t('privacy.section5.description')}
                        </p>
                    </section>
                </div>

                {/* Kontener pod stopką */}
                <div className="pb-16" />
            </div>
        </>
    );
}

export default PrivacyPolicy;
