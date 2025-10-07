import Navbar from './components/Navbar.jsx';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 z-0">
          <div className="absolute right-0 top-0 w-1/3 h-1/3 bg-emerald-100/30 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute left-0 bottom-0 w-1/2 h-1/2 bg-teal-100/30 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3" />
        </div>

        {/* Main content */}
        <main className="relative z-10 container mx-auto px-4 py-16">
          {/* Hero section */}
          <div className="max-w-5xl mx-auto text-center mb-20">
            <h1 className="text-6xl font-bold tracking-tight text-gray-900 mb-6">
              Twoja przestrzeń do
              <span className="block text-emerald-600">efektywnej pracy</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Zarządzaj projektami, współpracuj z zespołem i osiągaj cele - wszystko w jednym miejscu
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                Rozpocznij teraz
              </button>
              <button className="px-8 py-3 bg-white text-emerald-600 rounded-lg border border-emerald-200 hover:bg-emerald-50 transition-colors">
                Zobacz demo
              </button>
            </div>
          </div>

          {/* Features grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Zarządzanie Projektami",
                description: "Intuicyjne narzędzia do planowania i śledzenia postępów",
                icon: "📊"
              },
              {
                title: "Współpraca Zespołowa",
                description: "Komunikacja i wymiana wiedzy w czasie rzeczywistym",
                icon: "👥"
              },
              {
                title: "Analityka",
                description: "Szczegółowe raporty i statystyki wydajności",
                icon: "📈"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h2>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats section */}
          <div className="mt-24 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {[
                { value: "10k+", label: "Użytkowników" },
                { value: "50k+", label: "Ukończonych projektów" },
                { value: "99%", label: "Zadowolonych klientów" }
              ].map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold text-emerald-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;