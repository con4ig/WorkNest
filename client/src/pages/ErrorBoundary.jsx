import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
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
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1>Coś poszło nie tak 😕</h1>
          <p>Wystąpił nieoczekiwany błąd.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Wróć do logowania
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;