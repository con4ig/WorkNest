import Navbar from '../components/Navbar';
import { FileText, Calendar, DollarSign, Shield, Zap } from 'lucide-react';

function TermsOfService() {
  // Dane Administratora - PAMIĘTAJ O ICH UZUPEŁNIENIU
  const administrator = {
    nazwa: "[Nazwa Twojej Firmy/Imię i Nazwisko]",
    adres: "[Pełny adres siedziby/zamieszkania]",
    nip: "[Numer NIP]",
    email: "[kontakt@worknest.pl]",
  };

  return (

    <>
    <Navbar />
    <div className="min-h-screen bg-gray-50/50">
      {/* Sekcja Hero dla Dokumentu */}
      <div className="bg-white py-16 lg:py-24 border-b-4 border-teal-500/50 shadow-lg">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <FileText className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Regulamin Świadczenia Usług Drogą Elektroniczną
          </h1>
          <p className="text-lg text-gray-600">
            Obowiązuje od: [Data, np. 12 października 2025 r.]
          </p>
        </div>
      </div>

      {/* Główna treść Regulaminu */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* Sekcja I: Postanowienia Ogólne */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-teal-500 pl-3 mb-6">
            § 1. Postanowienia Ogólne
          </h2>
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200 mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-600" />
              Informacje o Usługodawcy
            </h3>
            <p className="text-gray-700">
              Usługodawcą (Administratorem) Serwisu WorkNest jest:
              <br/>
              **{administrator.nazwa}**
              <br/>
              Adres: {administrator.adres}
              <br/>
              NIP: {administrator.nip}
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed mb-3">
            1. Regulamin określa zasady korzystania z Serwisu WorkNest, w tym prawa i obowiązki Usługodawcy oraz Użytkowników.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            2. Serwis WorkNest świadczy usługi w zakresie **[UZUPEŁNIĆ: np. platformy SaaS do zarządzania zespołem i projektami]**.
          </p>
          <p className="text-gray-700 leading-relaxed">
            3. Korzystanie z Serwisu jest równoznaczne z akceptacją niniejszego Regulaminu.
          </p>
        </section>

        {/* Sekcja II: Warunki Świadczenia Usług */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-teal-500 pl-3 mb-6">
            § 2. Warunki Świadczenia Usług
          </h2>
          <ul className="space-y-4">
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-emerald-500">
              <strong className="text-gray-900 flex items-center"><Calendar className="w-5 h-5 mr-2 text-emerald-600" /> Rejestracja i Umowa</strong>
              <p className="text-sm text-gray-600 mt-1">
                Do korzystania z Serwisu wymagana jest rejestracja konta. Umowa o świadczenie usług drogą elektroniczną zostaje zawarta z chwilą aktywacji konta.
              </p>
            </li>
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-emerald-500">
              <strong className="text-gray-900 flex items-center"><Shield className="w-5 h-5 mr-2 text-emerald-600" /> Wymagania Techniczne</strong>
              <p className="text-sm text-gray-600 mt-1">
                Dostęp do Serwisu wymaga urządzenia z dostępem do Internetu oraz aktualnej przeglądarki internetowej (zalecane: Chrome, Firefox, Safari) z włączoną obsługą JavaScript i Cookies.
              </p>
            </li>
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-emerald-500">
              <strong className="text-gray-900 flex items-center"><Zap className="w-5 h-5 mr-2 text-emerald-600" /> Obowiązki Użytkownika</strong>
              <p className="text-sm text-gray-600 mt-1">
                Użytkownik zobowiązuje się do korzystania z Serwisu zgodnie z prawem, niniejszym Regulaminem i dobrymi obyczajami, a w szczególności do niewprowadzania treści o charakterze bezprawnym.
              </p>
            </li>
          </ul>
        </section>

        {/* Sekcja III: Płatności i Odpowiedzialność */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-teal-500 pl-3 mb-6">
            § 3. Opłaty i Odpowiedzialność
          </h2>
          <ul className="space-y-4">
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-teal-500">
              <strong className="text-gray-900 flex items-center"><DollarSign className="w-5 h-5 mr-2 text-teal-600" /> Zasady Płatności</strong>
              <p className="text-sm text-gray-600 mt-1">
                Korzystanie z Serwisu jest odpłatne zgodnie z aktualnym cennikiem dostępnym na stronie **[LINK DO CENNIKA]**. Opłaty pobierane są cyklicznie (**[UZUPEŁNIĆ: miesięcznie/rocznie]**) z góry.
              </p>
            </li>
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-teal-500">
              <strong className="text-gray-900 flex items-center"><Shield className="w-5 h-5 mr-2 text-teal-600" /> Odpowiedzialność Usługodawcy</strong>
              <p className="text-sm text-gray-600 mt-1">
                Usługodawca nie ponosi odpowiedzialności za szkody wynikłe z nieprawidłowego korzystania z Serwisu przez Użytkownika lub za utratę danych spowodowaną działaniem siły wyższej lub niezawinionym przez Usługodawcę.
                **[UZUPEŁNIĆ: należy doprecyzować zakres odpowiedzialności]**
              </p>
            </li>
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-teal-500">
              <strong className="text-gray-900 flex items-center"><FileText className="w-5 h-5 mr-2 text-teal-600" /> Prawa Autorskie</strong>
              <p className="text-sm text-gray-600 mt-1">
                Wszelkie prawa do Serwisu, w tym majątkowe prawa autorskie, prawa własności intelektualnej do jego nazwy, domeny, stron internetowych Serwisu, a także do wzorców, formularzy, logo należą do Usługodawcy.
              </p>
            </li>
          </ul>
        </section>

        {/* Sekcja IV: Reklamacje i Zakończenie Umowy */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-teal-500 pl-3 mb-6">
            § 4. Reklamacje i Zakończenie Umowy
          </h2>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Reklamacje</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            1. Użytkownik może złożyć reklamację dotyczącą niewykonania lub nienależytego wykonania usługi.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            2. Reklamacje należy składać pisemnie na adres siedziby Usługodawcy lub drogą elektroniczną na adres: **{administrator.email}**.
          </p>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">Rozwiązanie Umowy</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            3. Użytkownik ma prawo wypowiedzieć umowę w dowolnym momencie z zachowaniem okresu wypowiedzenia **[UZUPEŁNIĆ: np. 30 dni]**.
          </p>
          <p className="text-gray-700 leading-relaxed">
            4. Usługodawca ma prawo rozwiązać umowę ze skutkiem natychmiastowym w przypadku rażącego naruszenia Regulaminu przez Użytkownika, w szczególności w przypadku wprowadzania treści bezprawnych.
          </p>
        </section>

        {/* Sekcja V: Postanowienia Końcowe */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-teal-500 pl-3 mb-6">
            § 5. Postanowienia Końcowe
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            1. W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy prawa polskiego, w szczególności Kodeksu Cywilnego oraz ustawy o świadczeniu usług drogą elektroniczną.
          </p>
          <p className="text-gray-700 leading-relaxed mb-3">
            2. Usługodawca zastrzega sobie prawo do zmiany Regulaminu. O zmianach Użytkownicy zostaną poinformowani drogą elektroniczną.
          </p>
          <p className="text-gray-700 leading-relaxed">
            3. Ewentualne spory wynikłe z umowy będą rozstrzygane przez sąd właściwy dla siedziby Usługodawcy.
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