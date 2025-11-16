import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-500 to-accent-600 p-4">
      <div className="max-w-4xl mx-auto text-center text-white">
        <h1 className="text-6xl font-bold mb-6">
          Kash-in
        </h1>
        <p className="text-2xl mb-8 text-primary-100">
          La plataforma líder de bingo social en vivo
        </p>
        <p className="text-lg mb-12 text-primary-50 max-w-2xl mx-auto">
          Únete a emocionantes sesiones de bingo en tiempo real, escucha a anfitriones en vivo,
          y gana premios reales. ¡Cualquier persona puede ser anfitrión de su propia noche de bingo!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/register"
            className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
          >
            Registrarse
          </Link>
          <Link
            href="/auth/login"
            className="px-8 py-4 bg-primary-700 text-white rounded-lg font-semibold text-lg hover:bg-primary-800 transition-colors border-2 border-white"
          >
            Iniciar Sesión
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">🎯 Juega en Vivo</h3>
            <p className="text-primary-50">
              Participa en sesiones de bingo en tiempo real con marcado automático de cartones
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">🎤 Sé Anfitrión</h3>
            <p className="text-primary-50">
              Crea tus propias sesiones, transmite tu voz y gana comisiones
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">💰 Gana Dinero Real</h3>
            <p className="text-primary-50">
              Billetera integrada con Yappy y tarjetas. Retira tus ganancias fácilmente
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
