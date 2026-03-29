import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { Toaster } from 'react-hot-toast';
import './styles/main.css';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    minHeight: '100vh', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    background: '#0d0d14', color: '#f0f0ff', fontFamily: 'Outfit, sans-serif',
                    padding: '40px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{ color: '#ef4444', marginBottom: '12px' }}>Something went wrong</h2>
                    <pre style={{
                        background: '#1e1e38', padding: '16px', borderRadius: '12px',
                        color: '#ff6b35', fontSize: '0.85rem', maxWidth: '700px',
                        overflowX: 'auto', textAlign: 'left', whiteSpace: 'pre-wrap',
                    }}>
                        {this.state.error?.message || 'Unknown error'}
                    </pre>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '24px', padding: '12px 28px', borderRadius: '12px',
                            background: 'linear-gradient(135deg,#ff6b35,#f7c948)',
                            color: '#fff', border: 'none', cursor: 'pointer',
                            fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem',
                        }}
                    >
                        🔄 Reload App
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

ReactDOM.createRoot(document.getElementById('root')).render(
    <ErrorBoundary>
        <AuthProvider>
            <CartProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#1e1e38',
                            color: '#f0f0ff',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: '16px',
                            fontFamily: 'Outfit, sans-serif',
                        },
                        success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
                    }}
                />
            </CartProvider>
        </AuthProvider>
    </ErrorBoundary>
);
