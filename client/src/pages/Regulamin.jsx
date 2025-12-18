import Navbar from '../components/Navbar';
import { FileText, Shield, Zap } from 'lucide-react';

function TermsOfService() {
    const administrator = {
        nazwa: 'Szymon Wira',
        email: 's.szymon11@interia.pl',
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
                            Regulamin Serwisu WorkNest
                        </h1>
                        <p className="text-lg text-gray-600">
                            Obowiązuje od: 5.11.2025r.
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
                                Informacje o Właścicielu Serwisu
                            </h3>
                            <p className="text-gray-700">
                                Właścicielem i administratorem serwisu WorkNest
                                jest:
                                <br />
                                **{administrator.nazwa}**
                                <br />
                                E-mail: {administrator.email}
                            </p>
                        </div>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            1. Niniejszy regulamin określa zasady korzystania z
                            serwisu WorkNest, który jest projektem portfolio i
                            ma charakter demonstracyjny.
                        </p>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            2. Serwis WorkNest jest platformą demonstracyjną,
                            prezentującą możliwości technologiczne i
                            funkcjonalne, a nie komercyjną usługą.
                        </p>
                        <p className="leading-relaxed text-gray-700">
                            3. Korzystanie z Serwisu jest równoznaczne z
                            akceptacją niniejszego Regulaminu.
                        </p>
                    </section>

                    {/* Sekcja II: Warunki Korzystania */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 2. Warunki Korzystania
                        </h2>
                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Shield className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    Wymagania Techniczne
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Dostęp do Serwisu wymaga urządzenia z
                                    dostępem do Internetu oraz aktualnej
                                    przeglądarki internetowej.
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-emerald-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Zap className="mr-2 h-5 w-5 text-emerald-600" />{' '}
                                    Obowiązki Użytkownika
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Użytkownik zobowiązuje się do korzystania z
                                    Serwisu w sposób zgodny z prawem i dobrymi
                                    obyczajami, a w szczególności do
                                    nieumieszczania w nim treści o charakterze
                                    bezprawnym, obraźliwym lub naruszającym
                                    prawa osób trzecich.
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja III: Odpowiedzialność */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 3. Odpowiedzialność
                        </h2>
                        <ul className="space-y-4">
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <Shield className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    Wyłączenie Odpowiedzialności
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Serwis jest udostępniany w celach
                                    demonstracyjnych "tak jak jest". Właściciel
                                    serwisu nie ponosi odpowiedzialności za
                                    jakiekolwiek szkody wynikające z jego
                                    użytkowania, w tym za utratę danych.
                                    Użytkownik korzysta z serwisu na własne
                                    ryzyko.
                                </p>
                            </li>
                            <li className="rounded-lg border-l-4 border-teal-500 bg-white p-4 shadow-md">
                                <strong className="flex items-center text-gray-900">
                                    <FileText className="mr-2 h-5 w-5 text-teal-600" />{' '}
                                    Prawa Autorskie
                                </strong>
                                <p className="mt-1 text-sm text-gray-600">
                                    Wszelkie prawa do Serwisu, w tym do jego
                                    kodu, wyglądu i treści, należą do
                                    Właściciela serwisu.
                                </p>
                            </li>
                        </ul>
                    </section>

                    {/* Sekcja IV: Postanowienia Końcowe */}
                    <section className="mb-12">
                        <h2 className="mb-6 border-l-4 border-teal-500 pl-3 text-3xl font-bold text-gray-900">
                            § 4. Postanowienia Końcowe
                        </h2>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            1. W sprawach nieuregulowanych niniejszym
                            Regulaminem mają zastosowanie przepisy prawa
                            polskiego.
                        </p>
                        <p className="mb-3 leading-relaxed text-gray-700">
                            2. Właściciel serwisu zastrzega sobie prawo do
                            zmiany Regulaminu w dowolnym czasie.
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
