import { StrictMode, Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 32, fontFamily: 'monospace', background: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
          <h2 style={{ color: '#f87171', fontSize: 18, marginBottom: 16 }}>⚠️ Uygulama Render Hatası</h2>
          <pre style={{ background: '#1e293b', padding: 16, borderRadius: 8, color: '#fbbf24', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {(this.state.error as Error).message}
            {'\n\n'}
            {(this.state.error as Error).stack}
          </pre>
          <p style={{ marginTop: 16, color: '#94a3b8', fontSize: 12 }}>Bu hatayı geliştirici konsolunda (F12) da görebilirsiniz.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
