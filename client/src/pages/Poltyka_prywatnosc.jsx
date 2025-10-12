import Navbar from '../components/Navbar';
import { Shield, Mail, Zap } from 'lucide-react';

function PrivacyPolicy() {
  const administrator = {
    nazwa: "",
    adres: "",
    nip: "",
    email: "",
  };

  return (
    <>
      <Navbar />
    <div className="min-h-screen bg-gray-50/50">
      {/* Sekcja Hero dla Dokumentu */}
      <div className="bg-white py-16 lg:py-24 border-b-4 border-emerald-500/50 shadow-lg">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Shield className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
            Polityka Prywatności
          </h1>
          <p className="text-lg text-gray-600">
            Obowiązuje od: 
          </p>
        </div>
      </div>

      {/* Główna treść Polityki */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        
        {/* Sekcja I: Informacje ogólne */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3 mb-4">
            I. Informacje Ogólne
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
            zbieranych od Użytkowników w związku z korzystaniem z serwisu internetowego WorkNest, 
            działającego pod adresem <a href="#" className="text-teal-600 font-medium">[Adres Twojej Strony]</a>.
          </p>
          <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-emerald-600" />
              Administrator Danych Osobowych (ADO)
            </h3>
            <p className="text-gray-700">
              Administratorem danych osobowych jest:
              <br/>
              **{administrator.nazwa}**
              <br/>
              Adres: {administrator.adres}
              <br/>
              NIP: {administrator.nip}
              <br/>
              Kontakt e-mail w sprawach RODO: <a href={`mailto:${administrator.email}`} className="text-teal-600 font-medium">{administrator.email}</a>
            </p>
          </div>
        </section>

        {/* Sekcja II: Podstawy i cele przetwarzania */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3 mb-6">
            II. Cele i Podstawy Przetwarzania Danych
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Dane osobowe przetwarzane są w następujących celach:
          </p>
          
          <ul className="space-y-4">
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-teal-500">
              <strong className="text-gray-900">Udzielenie odpowiedzi na zapytania</strong> (Formularz kontaktowy).
              <p className="text-sm text-gray-600 mt-1">Podstawa prawna: Art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes ADO).</p>
            </li>
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-teal-500">
              <strong className="text-gray-900">Realizacja okresu próbnego/demo</strong> (Formularz "Rozpocznij Test").
              <p className="text-sm text-gray-600 mt-1">Podstawa prawna: Art. 6 ust. 1 lit. b) RODO (działania przed zawarciem umowy).</p>
            </li>
            <li className="p-4 bg-white shadow-md rounded-lg border-l-4 border-teal-500">
              <strong className="text-gray-900">Analityka i optymalizacja</strong> (Pliki cookies).
              <p className="text-sm text-gray-600 mt-1">Podstawa prawna: Art. 6 ust. 1 lit. a) RODO (zgoda użytkownika).</p>
            </li>
          </ul>
        </section>

        {/* Sekcja III: Prawa użytkowników */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3 mb-6">
            III. Prawa Użytkownika
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Każda osoba, której dane dotyczą, ma prawo do:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Dostępu do treści swoich danych oraz ich sprostowania.</li>
            <li>Usunięcia danych ("prawo do bycia zapomnianym").</li>
            <li>Ograniczenia przetwarzania danych.</li>
            <li>Przenoszenia danych.</li>
            <li>Wniesienia sprzeciwu wobec przetwarzania.</li>
            <li>Wniesienia skargi do organu nadzorczego (Prezes Urzędu Ochrony Danych Osobowych – PUODO).</li>
          </ul>
          <p className="text-gray-700 mt-4">
            Wnioski dotyczące praw prosimy kierować na adres e-mail Administratora: <a href={`mailto:${administrator.email}`} className="text-teal-600 font-medium">{administrator.email}</a>.
          </p>
        </section>
        
        {/* Sekcja IV: Cookies */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-3 mb-6">
            IV. Pliki Cookies
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Serwis używa plików cookies. Umożliwiają one prawidłowe działanie Serwisu (cookies niezbędne) oraz służą do celów analitycznych i marketingowych (cookies opcjonalne).
          </p>
          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 flex items-start">
            <Mail className="w-5 h-5 mt-1 mr-3 text-teal-600 flex-shrink-0" />
            <p className="text-gray-700 text-sm">
              Użytkownik ma możliwość zarządzania plikami cookies bezpośrednio w ustawieniach swojej przeglądarki. Wyłączenie plików niezbędnych może utrudnić korzystanie z niektórych funkcji Serwisu.
            </p>
          </div>
        </section>
      </div>

      {/* Kontener pod stopką */}
      <div className="pb-16" /> 
    </div>
    </>
  );
}

export default PrivacyPolicy;