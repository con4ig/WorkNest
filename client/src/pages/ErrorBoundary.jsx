import React from 'react';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Zaktualizuj stan, aby następny render pokazał interfejs awaryjny.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('🔴 Error Boundary caught:', error, errorInfo);

    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  render() {
    const { t } = this.props;

    if (this.state.hasError) {
      return (
        <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
          {/* Dekoracyjne elementy tła */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          </div>

          {/* Główna karta */}
          <div className="relative w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 px-8 py-12 sm:px-12 sm:py-16 border border-slate-100">
              {/* Ikona błędu z animacją */}
              <div className="flex justify-center mb-8">
                <div className="relative">
                  {/* Outer ring - pulsujący efekt */}
                  <div className="absolute inset-0 rounded-full bg-red-100 animate-ping opacity-75"></div>
                  
                  {/* Main icon container */}
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 ring-8 ring-red-50">
                    <svg
                      className="h-10 w-10 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Treść */}
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  {t('common.errorBoundary.title')}
                </h2>

                <p className="text-base text-slate-600 leading-relaxed max-w-md mx-auto">
                  {t('common.errorBoundary.description')}
                </p>
              </div>

              {/* Przycisk akcji */}
              <div className="mt-10">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="group relative w-full flex justify-center items-center gap-2 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/20 hover:shadow-xl hover:shadow-slate-900/30 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <span>{t('common.errorBoundary.button')}</span>
                  <svg 
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>

              {/* Dodatkowa informacja */}
              <p className="mt-6 text-center text-sm text-slate-500">
                {t('common.errorBoundary.contactSupport')}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);