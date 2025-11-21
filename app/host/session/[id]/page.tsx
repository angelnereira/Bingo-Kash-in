import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SessionStatus } from '@prisma/client'

export default async function HostSessionDashboardPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Obtener información de la sesión
  const bingoSession = await prisma.bingoSession.findUnique({
    where: { id: params.id },
    include: {
      host: true,
      participants: {
        include: {
          user: {
            select: {
              name: true,
              username: true,
              email: true,
            },
          },
        },
      },
      cards: {
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      },
      _count: {
        select: {
          participants: true,
          cards: true,
        },
      },
    },
  })

  if (!bingoSession) {
    redirect('/dashboard')
  }

  // Verificar que el usuario sea el host de la sesión
  if (bingoSession.hostId !== session.user.id) {
    redirect(`/session/${params.id}`)
  }

  const cardPrice = bingoSession.cardPrice.toNumber()
  const totalSales = bingoSession._count.cards * cardPrice
  const hostCommission = bingoSession.hostCommission.toNumber()
  const hostEarnings = totalSales * (hostCommission / 100)
  const prizePool = totalSales * 0.75
  const platformFee = totalSales * 0.15

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-500 to-accent-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white hover:text-accent-100 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white">{bingoSession.title}</h1>
              <p className="text-accent-100 mt-1">Panel de Control del Anfitrión</p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                bingoSession.status === SessionStatus.IN_PROGRESS
                  ? 'bg-green-100 text-green-800'
                  : bingoSession.status === SessionStatus.WAITING
                  ? 'bg-yellow-100 text-yellow-800'
                  : bingoSession.status === SessionStatus.COMPLETED
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {bingoSession.status === SessionStatus.IN_PROGRESS && '🔴 En Vivo'}
              {bingoSession.status === SessionStatus.WAITING && '⏳ En Espera'}
              {bingoSession.status === SessionStatus.SCHEDULED && '📅 Programada'}
              {bingoSession.status === SessionStatus.COMPLETED && '✅ Completada'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Ventas Totales</p>
              <div className="bg-green-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">${totalSales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{bingoSession._count.cards} cartones × ${cardPrice.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Tus Ganancias</p>
              <div className="bg-blue-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-blue-600">${hostEarnings.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{hostCommission}% de comisión</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Participantes</p>
              <div className="bg-purple-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{bingoSession._count.participants}</p>
            <p className="text-xs text-gray-500 mt-1">Jugadores únicos</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Pozo de Premios</p>
              <div className="bg-yellow-100 rounded-lg p-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">${prizePool.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">75% de las ventas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Control Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Control de Sesión</h2>
              <div className="grid grid-cols-2 gap-4">
                {bingoSession.status === SessionStatus.SCHEDULED && (
                  <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                    ▶️ Iniciar Sesión
                  </button>
                )}
                {bingoSession.status === SessionStatus.IN_PROGRESS && (
                  <>
                    <button className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      🎲 Siguiente Número
                    </button>
                    <button className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
                      ⏹️ Finalizar Sesión
                    </button>
                  </>
                )}
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  🎤 Controles de Audio
                </button>
                <button className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  💬 Ver Chat
                </button>
              </div>

              {bingoSession.status === SessionStatus.IN_PROGRESS && (
                <div className="mt-6 bg-gradient-to-r from-primary-500 to-accent-600 rounded-lg p-6 text-white">
                  <h3 className="text-lg font-semibold mb-3">Panel de Juego en Vivo</h3>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                    <p className="text-center text-3xl font-bold">Próximamente</p>
                  </div>
                  <p className="text-sm text-primary-100">
                    Aquí podrás ver la tómbola digital, cantar números, y gestionar ganadores en tiempo real.
                  </p>
                </div>
              )}
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Desglose de Ingresos</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-700">Ventas Totales ({bingoSession._count.cards} cartones)</span>
                  <span className="font-bold text-gray-900">${totalSales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-700">Pozo de Premios (75%)</span>
                  <span className="font-bold text-yellow-600">-${prizePool.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-700">Tu Comisión ({hostCommission}%)</span>
                  <span className="font-bold text-blue-600">+${hostEarnings.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-gray-700">Comisión Plataforma (15%)</span>
                  <span className="font-bold text-gray-600">-${platformFee.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Participantes ({bingoSession._count.participants})
              </h2>
              {bingoSession.participants.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aún no hay participantes</p>
              ) : (
                <div className="space-y-3">
                  {bingoSession.participants.map((participant) => (
                    <div key={participant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-bold">
                          {participant.user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {participant.user.name || participant.user.username}
                          </p>
                          <p className="text-xs text-gray-500">{participant.user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {bingoSession.cards.filter((c) => c.userId === participant.userId).length} cartones
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">Información de la Sesión</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Fecha y Hora</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(bingoSession.scheduledAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Precio por Cartón</p>
                    <p className="font-semibold text-primary-600">${cardPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Cartones Vendidos</p>
                    <p className="font-semibold text-gray-900">
                      {bingoSession._count.cards} / {bingoSession.maxCards}
                    </p>
                    <div className="mt-2 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{
                          width: `${(bingoSession._count.cards / bingoSession.maxCards) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <Link
                    href={`/session/${params.id}`}
                    className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Ver como Jugador
                  </Link>
                  <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                    Editar Sesión
                  </button>
                  <button className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                    Cancelar Sesión
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <span className="font-semibold">Tip:</span> Mantén a los jugadores entretenidos con chat activo y premios sorpresa para aumentar tus ganancias.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
