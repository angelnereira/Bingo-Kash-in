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
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center p-4 pt-20 pb-16">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Kash-in
          </h1>
          <p className="text-2xl mb-6 text-primary-100">
            La plataforma líder de bingo social en vivo
          </p>
          <p className="text-lg mb-12 text-primary-50 max-w-2xl mx-auto">
            Únete a emocionantes sesiones de bingo en tiempo real, escucha a anfitriones en vivo,
            y gana premios reales. ¡Cualquier persona puede ser anfitrión de su propia noche de bingo!
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-white bg-opacity-10 backdrop-blur-lg text-white rounded-lg font-semibold text-lg hover:bg-opacity-20 transition-colors border-2 border-white border-opacity-30"
            >
              Iniciar Sesión
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-2">👥</div>
              <div className="text-3xl font-bold mb-1">1,000+</div>
              <div className="text-primary-100">Jugadores Activos</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-2">🎮</div>
              <div className="text-3xl font-bold mb-1">50+</div>
              <div className="text-primary-100">Sesiones Diarias</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="text-4xl mb-2">💰</div>
              <div className="text-3xl font-bold mb-1">$10,000+</div>
              <div className="text-primary-100">Premios Repartidos</div>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-16">
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
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">⚡ Auto-Marcado</h3>
              <p className="text-primary-50">
                Los números se marcan automáticamente en tus cartones. ¡Nunca pierdas un número!
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">💬 Chat en Vivo</h3>
              <p className="text-primary-50">
                Interactúa con otros jugadores durante las partidas en tiempo real
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">🔊 Audio del Anfitrión</h3>
              <p className="text-primary-50">
                Escucha al anfitrión cantando los números como en un casino real
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold mb-4">Precios para Todos</h2>
            <p className="text-xl text-primary-100 mb-8">
              Desde $0.50 hasta $10 por cartón
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: "CASUAL", range: "$0.50-$1.99" },
                { name: "STANDARD", range: "$2.00-$4.99" },
                { name: "PREMIUM", range: "$5.00-$7.99" },
                { name: "VIP", range: "$8.00-$10.00" },
              ].map((tier) => (
                <div key={tier.name} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <div className="font-bold text-lg mb-1">{tier.name}</div>
                  <div className="text-primary-100 text-sm">{tier.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-4">¿Listo para Jugar?</h2>
            <p className="text-xl text-primary-100 mb-6">
              Únete a miles de jugadores y comienza a ganar hoy mismo
            </p>
            <Link
              href="/auth/register"
              className="inline-block px-10 py-4 bg-white text-primary-600 rounded-lg text-xl font-bold hover:bg-primary-50 transition-colors shadow-lg"
            >
              Crear Cuenta Gratis
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white bg-opacity-5 backdrop-blur-lg border-t border-white border-opacity-10 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-primary-100">
          <p className="mb-2">© 2025 Kash-in. Todos los derechos reservados.</p>
          <p className="text-sm">Juego responsable. Solo para mayores de 18 años.</p>
        </div>
      </footer>
    </div>
  )
}
