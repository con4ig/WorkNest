import Navbar from '../components/Navbar';
import { FileText, Calendar, DollarSign, Shield, Zap } from 'lucide-react';

function TermsOfService() {
    // Dane Administratora - PAMIĘTAJ O ICH UZUPEŁNIENIU
    const administrator = {
        nazwa: '[Nazwa Twojej Firmy/Imię i Nazwisko]',
        adres: '[Pełny adres siedziby/zamieszkania]',
        nip: '[Numer NIP]',
        email: '[kontakt@worknest.pl]',
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50/50">
                {/* Sekcja Hero dla Dokumentu */}
                <div className="border-b-4 border-teal-500/50 bg-white py-16 shadow-lg lg:py-24">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-teal-600" />
                        <h1 className="mb-4 text-4xl font-extrabold text-gray-900 lg:text-5xl">
                            Regulamin Świadczenia Usług Drogą Elektroniczną
                        </h1>
                        <p className="text-lg text-gray-600">
                            Obowiązuje od: [Data, np. 12 października 2025 r.]
                        </p>
                    </div>
                </div>

                {/* Główna treść Regulaminu */}
                <div className="container mx-auto max-w-4xl px-4 py-16">
                    {/* Sekcja I: Postanowienia Ogólne */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 1. Postanowienia Ogólne
                        </h2>
                        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
                            <h3 className="mb-2 flex items-center text-xl font-semibold text-gray-800">
                                <Zap className="mr-2 h-5 w-5 text-emerald-600" />
                                Informacje o Usługodawcy
                            </h3>
                            <p className="text-gray-700">
                                Usługodawcą (Administratorem) Serwisu WorkNest
                                jest:
                                <br />
                                **{administrator.nazwa}**
                                <br />
                                Adres: {administrator.adres}
                                <br />
                                NIP: {administrator.nip}
                            </p>
                        </div>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            1. Regulamin określa zasady korzystania z Serwisu
                            WorkNest, w tym prawa i obowiązki Usługodawcy oraz
                            Użytkowników.
                        </p>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            2. Serwis WorkNest świadczy usługi w zakresie
                            **[UZUPEŁNIĆ: np. platformy SaaS do zarządzania
                            zespołem i projektami]**.
                        </p>
                        <p className="leading-relaxed text-gray-700">
                            3. Korzystanie z Serwisu jest równoznaczne z
                            akceptacją niniejszego Regulaminu.
                        </p>
                    </section>

                    {/* Sekcja II: Warunki Świadczenia Usług */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 2. Warunki Świadczenia Usług
                        </h2>
                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Calendar className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    Rejestracja i Umowa
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Do korzystania z Serwisu wymagana jest
                                    rejestracja konta. Umowa o świadczenie usług
                                    drogą elektroniczną zostaje zawarta z chwilą
                                    aktywacji konta.
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Shield className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    Wymagania Techniczne
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Dostęp do Serwisu wymaga urządzenia z
                                    dostępem do Internetu oraz aktualnej
                                    przeglądarki internetowej (zalecane: Chrome,
                                    Firefox, Safari) z włączoną obsługą
                                    JavaScript i Cookies.
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Zap className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    Obowiązki Użytkownika
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Użytkownik zobowiązuje się do korzystania z
                                    Serwisu zgodnie z prawem, niniejszym
                                    Regulaminem i dobrymi obyczajami, a w
                                    szczególności do niewprowadzania treści o
                                    charakterze bezprawnym.
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja III: Płatności i Odpowiedzialność */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 3. Opłaty i Odpowiedzialność
                        </h2>
                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <DollarSign className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    Zasady Płatności
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Korzystanie z Serwisu jest odpłatne zgodnie
                                    z aktualnym cennikiem dostępnym na stronie
                                    **[LINK DO CENNIKA]**. Opłaty pobierane są
                                    cyklicznie (**[UZUPEŁNIĆ:
                                    miesięcznie/rocznie]**) z góry.
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Shield className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    Odpowiedzialność Usługodawcy
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Usługodawca nie ponosi odpowiedzialności za
                                    szkody wynikłe z nieprawidłowego korzystania
                                    z Serwisu przez Użytkownika lub za utratę
                                    danych spowodowaną działaniem siły wyższej
                                    lub niezawinionym przez Usługodawcę.
                                    **[UZUPEŁNIĆ: należy doprecyzować zakres
                                    odpowiedzialności]**
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <FileText className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    Prawa Autorskie
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Wszelkie prawa do Serwisu, w tym majątkowe
                                    prawa autorskie, prawa własności
                                    intelektualnej do jego nazwy, domeny, stron
                                    internetowych Serwisu, a także do wzorców,
                                    formularzy, logo należą do Usługodawcy.
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja IV: Reklamacje i Zakończenie Umowy */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 4. Reklamacje i Zakończenie Umowy
                        </h2>
                        <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                            Reklamacje
                        </h3>
                        <p className="mb-4 leading-relaxed text-gray-700">
                            1. Użytkownik może złożyć reklamację dotyczącą
                            niewykonania lub nienależytego wykonania usługi.
                        </p>
                        <p className="mb-6 leading-relaxed text-gray-700">
                            2. Reklamacje należy składać pisemnie na adres
                            siedziby Usługodawcy lub drogą elektroniczną na
                            adres: **{administrator.email}**.
                        </p>
                        <h3 className="mb-3 text-2xl font-semibold text-gray-800">
                            Rozwiązanie Umowy
                        </h3>
                        <p className="mb-4 leading-relaxed text-gray-700">
                            3. Użytkownik ma prawo wypowiedzieć umowę w dowolnym
                            momencie z zachowaniem okresu wypowiedzenia
                            **[UZUPEŁNIĆ: np. 30 dni]**.
                        </p>
                        <p className="leading-relaxed text-gray-700">
                            4. Usługodawca ma prawo rozwiązać umowę ze skutkiem
                            natychmiastowym w przypadku rażącego naruszenia
                            Regulaminu przez Użytkownika, w szczególności w
                            przypadku wprowadzania treści bezprawnych.
                        </p>
                    </section>

                    {/* Sekcja V: Postanowienia Końcowe */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 5. Postanowienia Końcowe
                        </h2>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            1. W sprawach nieuregulowanych niniejszym
                            Regulaminem mają zastosowanie przepisy prawa
                            polskiego, w szczególności Kodeksu Cywilnego oraz
                            ustawy o świadczeniu usług drogą elektroniczną.
                        </p>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            2. Usługodawca zastrzega sobie prawo do zmiany
                            Regulaminu. O zmianach Użytkownicy zostaną
                            poinformowani drogą elektroniczną.
                        </p>
                        <p className="leading-relaxed text-gray-700">
                            3. Ewentualne spory wynikłe z umowy będą
                            rozstrzygane przez sąd właściwy dla siedziby
                            Usługodawcy.
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
