import { Component, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { RefreshCw, TriangleAlert } from 'lucide-react'

interface Props  { children: ReactNode }
interface State  { hasError: boolean; eventId?: string }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  private reload = () => window.location.reload()

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div className="min-h-screen flex flex-col" style={{ background: '#FAFAF8' }}>
        {/* Minimal header */}
        <header className="px-6 py-4 border-b border-gray-100">
          <Link to="/" onClick={() => this.setState({ hasError: false })}>
            <img src="/logo.png" alt="Mauri-Kilchi" className="h-8 w-auto object-contain" />
          </Link>
        </header>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-lg w-full text-center">

            {/* Decorative number */}
            <div className="relative select-none mb-6">
              <span
                className="text-[160px] sm:text-[200px] font-black leading-none tracking-tighter"
                style={{ color: '#F8AC12', opacity: 0.12 }}
              >
                500
              </span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg"
                  style={{ background: '#0D0D0D' }}>
                  <TriangleAlert size={36} color="#F8AC12" strokeWidth={2} />
                </div>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Quelque chose a mal tourné
            </h1>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-10 max-w-sm mx-auto">
              Une erreur inattendue s'est produite. Rechargez la page — si le problème persiste, revenez plus tard.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.reload}
                className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-bold
                           hover:opacity-90 transition-all"
                style={{ background: '#F8AC12', color: '#0D0D0D' }}
              >
                <RefreshCw size={16} />
                Recharger la page
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl border-2 border-gray-200
                           text-sm font-semibold text-gray-700 hover:border-amber-400 hover:text-amber-700 transition-all"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
