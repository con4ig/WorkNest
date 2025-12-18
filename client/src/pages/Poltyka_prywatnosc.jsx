import Navbar from '../components/Navbar';
import { Shield, Mail, Zap } from 'lucide-react';
import { siteConfig } from '../config'; // Importuj konfigurację

function PrivacyPolicy() {
    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50">
                {/* Sekcja Hero dla Dokumentu */}
                <div className="border-b-4 border-emerald-500/50 bg-white py-16 shadow-lg lg:py-24">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <Shield className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
                        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 lg:text-5xl">
                            Polityka Prywatności
                        </h1>
                        <p className="text-lg text-gray-600">
                            Obowiązuje od: {siteConfig.effectiveDate}
                        </p>
                    </div>
                </div>

                {/* Główna treść Polityki */}
                <div className="container mx-auto max-w-4xl px-4 py-16">
                    {/* Sekcja I: Informacje ogólne */}
                    <section className="mb-12">
                        <h2 className="mb-4 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900">
                            I. Informacje Ogólne
                        </h2>
                        <p className="mb-4 leading-relaxed text-gray-700">
                            Niniejsza Polityka Prywatności określa zasady
                            przetwarzania i ochrony danych osobowych zbieranych
                            od Użytkowników w związku z korzystaniem z serwisu
                            internetowego WorkNest, działającego pod adresem{' '}
                            <a href="#" className="font-medium text-teal-600">
                                {siteConfig.siteUrl}
                            </a>
                            .
                        </p>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                            <h3 className="mb-2 flex items-center text-xl font-semibold text-gray-800">
                                <Zap className="mr-2 h-5 w-5 text-emerald-600" />
                                Administrator Danych Osobowych (ADO)
                            </h3>
                            <p className="text-gray-700">
                                Administratorem Twoich danych osobowych jest:
                                <br />
                                **{siteConfig.administratorName}**
                                <br />
                                Kontakt e-mail w sprawach RODO:{' '}
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
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900">
                            II. Cele i Podstawy Przetwarzania Danych
                        </h2>
                        <p className="mb-6 leading-relaxed text-gray-700">
                            Twoje dane osobowe przetwarzane są w następujących
                            celach:
                        </p>

                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="text-gray-900">
                                    Rejestracja i prowadzenie konta w serwisie
                                    WorkNest
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Podstawa prawna: Art. 6 ust. 1 lit. b) RODO
                                    (niezbędność do wykonania umowy o
                                    świadczenie usług drogą elektroniczną).
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="text-gray-900">
                                    Obsługa zapytań i zgłoszeń
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Podstawa prawna: Art. 6 ust. 1 lit. f) RODO
                                    (prawnie uzasadniony interes administratora,
                                    polegający na komunikacji z użytkownikami).
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja III: Prawa użytkowników */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900">
                            III. Twoje Prawa
                        </h2>
                        <p className="mb-6 leading-relaxed text-gray-700">
                            Posiadasz prawo do:
                        </p>
                        <ul className="ml-4 list-inside list-disc space-y-2 text-gray-700">
                            <li>
                                Dostępu do treści swoich danych oraz ich
                                sprostowania.
                            </li>
                            <li>
                                Usunięcia danych ("prawo do bycia zapomnianym").
                            </li>
                            <li>Ograniczenia przetwarzania danych.</li>
                            <li>Przenoszenia danych.</li>
                            <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
                            <li>
                                Wniesienia skargi do organu nadzorczego (Prezes
                                Urzędu Ochrony Danych Osobowych – PUODO).
                            </li>
                            <li>
                                Cofnięcia zgody na przetwarzanie danych w
                                dowolnym momencie, jeśli przetwarzanie odbywa
                                się na podstawie zgody.
                            </li>
                        </ul>
                        <p className="mt-4 text-gray-700">
                            Wnioski dotyczące Twoich praw prosimy kierować na
                            adres e-mail Administratora:{' '}
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
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900">
                            IV. Pliki Cookies
                        </h2>
                        <p className="mb-4 leading-relaxed text-gray-700">
                            Serwis WorkNest wykorzystuje pliki cookies
                            (ciasteczka) wyłącznie w celu zapewnienia
                            prawidłowego działania strony (logowanie, utrzymanie
                            sesji). Pliki cookies to małe pliki tekstowe,
                            przechowywane na Twoim urządzeniu końcowym (np.
                            komputerze, tablecie, smartfonie).
                        </p>
                        <div className="flex items-start rounded-lg border border-teal-200 bg-teal-50 p-4">
                            <Mail className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-teal-600" />
                            <p className="text-sm text-gray-700">
                                Możesz zarządzać plikami cookies z poziomu
                                ustawień swojej przeglądarki internetowej.
                                Pamiętaj, że ograniczenie stosowania plików
                                cookies może wpłynąć na niektóre funkcjonalności
                                dostępne w serwisie.
                            </p>
                        </div>
                    </section>
                    {/* Sekcja V: Postanowienia końcowe */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-emerald-500 pl-3 text-3xl font-bold text-gray-900">
                            V. Postanowienia Końcowe
                        </h2>
                        <p className="mb-4 leading-relaxed text-gray-700">
                            Zastrzegamy sobie prawo do wprowadzania zmian w
                            Polityce Prywatności. O wszelkich zmianach będziemy
                            informować poprzez publikację nowej treści Polityki
                            Prywatności na tej stronie. Zmiany wchodzą w życie z
                            dniem ich publikacji.
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
