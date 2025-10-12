import Navbar from './components/Navbar.jsx';
import demo from './assets/demo.png'; // Import zrzutu ekranu lub wideo demo
import { Zap, Users, TrendingUp, CheckCircle, Quote, Rocket, ShieldCheck } from 'lucide-react';

function App() {
  // Nie zmieniam logiki ani treści
  const features = [
    {
      title: "Zarządzanie Projektami",
      description: "Intuicyjne narzędzia do planowania, przypisywania zadań i śledzenia postępów w czasie rzeczywistym.",
      icon: Zap
    },
    {
      title: "Współpraca Zespołowa",
      description: "Komunikacja, udostępnianie dokumentów i wymiana wiedzy w jednym, zorganizowanym hubie.",
      icon: Users
    },
    {
      title: "Analityka i Raporty",
      description: "Szczegółowe statystyki wydajności i wizualne raporty do optymalizacji procesów HR.",
      icon: TrendingUp
    }
  ];

  // Przywrócono pierwotne, większe wartości
  const stats = [
    { value: "15k+", label: "Aktywnych Użytkowników" },
    { value: "70k+", label: "Pomyślnie Zarządzanych Projektów" },
    { value: "99.8%", label: "Wskaźnik Zadowolenia Klientów" }
  ];

  const finalCtaButton = "px-12 py-4 text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl shadow-2xl shadow-emerald-500/50 hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.03]";


  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Navbar pozostaje bez zmian (przyjmujemy, że jest już w stylu Emerald/Teal z poprzedniego kroku) */}
      <Navbar /> 

      <div className="relative overflow-hidden pt-12">
        {/* Bajeranckie Tło (Green/Teal) */}
        <div className="absolute inset-0 z-0 opacity-50">
          <div className="absolute right-0 top-0 w-[450px] h-[450px] bg-emerald-200/50 rounded-full blur-[150px] transform translate-x-1/3 -translate-y-1/3" />
          <div className="absolute left-0 bottom-0 w-[550px] h-[550px] bg-teal-200/50 rounded-full blur-[180px] transform -translate-x-1/2 translate-y-1/2" />
        </div>

        {/* Główna zawartość */}
        <main className="relative z-10 container mx-auto px-4 py-16 lg:py-24">
          
          {/* 1. Sekcja Hero - PRZYWRÓCONY DUŻY NAGŁÓWEK */}
          <div className="max-w-6xl mx-auto text-center mb-24">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-3">
                SYSTEM HR NEXT-GEN
            </p>
            {/* PRZYWRÓCONO: text-7xl lg:text-8xl */}
            <h1 className="text-7xl lg:text-8xl font-extrabold tracking-tighter text-gray-900 mb-8 leading-tight">
              Odkryj nowy wymiar
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-500">
                efektywności w Twoim HR
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 font-light">
              Zarządzaj zespołem, automatyzuj procesy i osiągaj cele strategiczne — 
              kompleksowe narzędzie, które rewolucjonizuje pracę w Twojej organizacji.
            </p>
            <div className="flex gap-6 justify-center">
              <button className="px-10 py-4 text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl shadow-2xl shadow-emerald-500/50 hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-[1.03]">
                <CheckCircle className="w-5 h-5 mr-2 inline-block" />
                Rozpocznij Bezpłatny Okres Próbny
              </button>
              <button className="px-10 py-4 text-lg font-bold bg-white text-emerald-600 rounded-xl border-2 border-emerald-200 hover:bg-emerald-50 transition-colors duration-300 shadow-lg">
                Zobacz demo
              </button>
            </div>
          </div>

          {/* 2. Sekcja Statystyk - PRZYWRÓCONE DUŻE CYFRY */}
          <div className="mb-32 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-9 shadow-2xl shadow-emerald-600/40">
            <div className="grid md:grid-cols-3 gap-8 text-center divide-x divide-emerald-500">
              {stats.map((stat, index) => (
                <div key={index} className="px-6">
                  {/* PRZYWRÓCONO: text-6xl */}
                  <div className="text-3xl font-extrabold text-white mb-2 tracking-tighter">
                    {stat.value}
                  </div>
                  <div className="text-emerald-200 text-lg font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* 3. Sekcja Wizualna / Feature Spotlight */}
          <div className="mb-32 py-16">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
              {/* Opis */}
              <div className="lg:w-1/2 text-left">
                <p className="text-sm font-semibold text-teal-600 uppercase tracking-widest mb-3">
                  PŁYNNA INTEGRACJA
                </p>
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                  Zautomatyzuj HR i skup się na rozwoju
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  WorkNest to nie tylko narzędzie, to Twój cyfrowy asystent. Uprość onboarding, zarządzanie urlopami i ocenę wydajności dzięki intuicyjnemu interfejsowi.
                </p>
                <ul className="space-y-4">
                  {[
                    "Szybki dostęp do danych pracownika",
                    "Bezpieczne przechowywanie dokumentacji",
                    "Automatyczne powiadomienia i alerty"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start text-lg text-gray-700">
                      <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1 mr-3" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Mockup / Zrzut ekranu (symulacja) */}
              <div className="lg:w-1/2 p-4 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/50 to-teal-100/50 rounded-3xl -rotate-2 transform scale-105 shadow-xl"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-semibold text-gray-900">Panel Zarządzania</span>
                    <div className="h-3 w-16 bg-emerald-400 rounded-full"></div>
                  </div>
                  <div className="aspect-video bg-gray-100 rounded-xl flex items-center justify-center border-4 border-emerald-500/20">
                    <img src={demo} alt="demo photo" />
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* 4. Sekcja Funkcji - Grid Cards */}
          <div className="text-center max-w-4xl mx-auto mb-16">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                  KLUCZOWE NARZĘDZIA
              </p>
              <h2 className="text-4xl font-bold text-gray-900">
                  Wszystko, czego potrzebuje Twój HR
              </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-32">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 hover:shadow-emerald-300/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Ikona w eleganckim kółku */}
                <div className="w-16 h-16 mb-6 rounded-full bg-emerald-50 flex items-center justify-center border-4 border-emerald-200/50">
                    <feature.icon className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h2>
                <p className="text-gray-600 text-base">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          
          {/* 5. Sekcja Zaufania / Testimoniale */}
          <div className="mb-32 bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
             <div className="text-center max-w-4xl mx-auto mb-12">
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                    CO MÓWIĄ NASI KLIENCI?
                </p>
                <h2 className="text-4xl font-bold text-gray-900">
                    Zaufaj liderom branży
                </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Testimonial 1 */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-emerald-100 shadow-inner">
                <Quote className="w-8 h-8 text-emerald-400 mb-4" />
                <p className="text-xl italic text-gray-700 mb-4">
                  "Wdrożenie WorkNest skróciło czas onboardingu o 40%. Interfejs jest intuicyjny, a wsparcie techniczne na najwyższym poziomie."
                </p>
                <div className="font-semibold text-gray-900">- Anna Kowalska, Dyrektor HR w TechCorp</div>
              </div>

              {/* Testimonial 2 */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-emerald-100 shadow-inner">
                <Quote className="w-8 h-8 text-emerald-400 mb-4" />
                <p className="text-xl italic text-gray-700 mb-4">
                  "Przejrzyste raporty analityczne pozwalają nam podejmować lepsze decyzje. To narzędzie, które faktycznie napędza produktywność zespołu."
                </p>
                <div className="font-semibold text-gray-900">- Piotr Nowak, Menedżer Projektów w GlobalSoft</div>
              </div>
            </div>
          </div>
          
          {/* 6. Sekcja Końcowego Wezwania do Akcji (Final CTA) */}
          <div className="text-center py-20 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-4 border-emerald-200/50 shadow-2xl shadow-emerald-200/50">
            <Rocket className="w-12 h-12 text-emerald-600 mx-auto mb-6" />
            <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
              Gotowy na rewolucję w zarządzaniu HR?
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              Dołącz do tysięcy firm, które już dziś zwiększają swoją efektywność z WorkNest.
            </p>
            <button className={finalCtaButton}>
              <CheckCircle className="w-6 h-6 mr-2 inline-block" />
              Rozpocznij Test Już Teraz!
            </button>
          </div>
          
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-800 py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} WorkNest. Wszelkie prawa zastrzeżone.</p>
            <div className="mt-2 text-sm">
                <a href="#" className="hover:text-emerald-400 mx-2">Polityka Prywatności</a>
                <span className="text-gray-600">|</span>
                <a href="#" className="hover:text-emerald-400 mx-2">Regulamin</a>
            </div>
        </div>
      </footer>
    </div>
  );
}

export default App;