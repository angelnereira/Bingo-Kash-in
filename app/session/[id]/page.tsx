import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SessionStatus } from '@prisma/client'

export default async function SessionDetailPage({
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
      host: {
        select: {
          id: true,
          name: true,
          username: true,
        },
      },
      participants: {
        include: {
          user: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      },
      cards: {
        where: {
          userId: session.user.id,
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
    redirect('/sessions')
  }

  const userWallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  })

  const balance = userWallet?.balance.toNumber() || 0
  const cardPrice = bingoSession.cardPrice.toNumber()
  const isHost = bingoSession.hostId === session.user.id
  const hasCards = bingoSession.cards.length > 0
  const canJoin = bingoSession.status !== SessionStatus.COMPLETED && bingoSession.status !== SessionStatus.CANCELLED

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/sessions"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Sesiones
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{bingoSession.title}</h1>
              <p className="text-gray-600 mt-1">
                Anfitrión: {bingoSession.host.name || bingoSession.host.username}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                bingoSession.status === SessionStatus.IN_PROGRESS
                  ? 'bg-green-100 text-green-800'
                  : bingoSession.status === SessionStatus.WAITING
                  ? 'bg-yellow-100 text-yellow-800'
                  : bingoSession.status === SessionStatus.COMPLETED
                  ? 'bg-gray-100 text-gray-800'
                  : bingoSession.status === SessionStatus.CANCELLED
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {bingoSession.status === SessionStatus.IN_PROGRESS && '🔴 En Vivo'}
              {bingoSession.status === SessionStatus.WAITING && '⏳ En Espera'}
              {bingoSession.status === SessionStatus.SCHEDULED && '📅 Programada'}
              {bingoSession.status === SessionStatus.COMPLETED && '✅ Completada'}
              {bingoSession.status === SessionStatus.CANCELLED && '❌ Cancelada'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Descripción */}
            {bingoSession.description && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700">{bingoSession.description}</p>
              </div>
            )}

            {/* Detalles de la Sesión */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles de la Sesión</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha y Hora</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(bingoSession.scheduledAt).toLocaleString('es-ES', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Precio por Cartón</p>
                  <p className="font-semibold text-primary-600 text-lg">${cardPrice.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Participantes</p>
                  <p className="font-semibold text-gray-900">{bingoSession._count.participants}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cartones Vendidos</p>
                  <p className="font-semibold text-gray-900">
                    {bingoSession._count.cards} / {bingoSession.maxCards}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pozo de Premios</p>
                  <p className="font-semibold text-green-600 text-lg">
                    ${(bingoSession._count.cards * cardPrice * 0.75).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tus Cartones</p>
                  <p className="font-semibold text-gray-900">{bingoSession.cards.length}</p>
                </div>
              </div>
            </div>

            {/* Si está en vivo, mostrar área de juego */}
            {bingoSession.status === SessionStatus.IN_PROGRESS && hasCards && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Sala de Juego</h2>
                <div className="bg-gradient-to-br from-primary-500 to-accent-600 rounded-lg p-8 text-white text-center">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-2xl font-bold mb-2">¡Sesión en Vivo!</h3>
                  <p className="text-primary-100 mb-6">La función de juego en vivo estará disponible próximamente</p>
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <p className="text-sm">
                      Aquí podrás ver tus cartones, escuchar al anfitrión y marcar los números en tiempo real.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Participantes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Participantes ({bingoSession._count.participants})
              </h2>
              {bingoSession.participants.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aún no hay participantes</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {bingoSession.participants.map((participant) => (
                    <div
                      key={participant.id}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-accent-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {participant.user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm text-gray-700 truncate">
                        {participant.user.name || participant.user.username}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Comprar Cartones */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              {isHost ? (
                /* Vista para el anfitrión */
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Panel de Anfitrión</h3>
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">Eres el anfitrión de esta sesión</p>
                    </div>
                    {bingoSession.status === SessionStatus.SCHEDULED && (
                      <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                        Iniciar Sesión
                      </button>
                    )}
                    {bingoSession.status === SessionStatus.IN_PROGRESS && (
                      <button className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                        Finalizar Sesión
                      </button>
                    )}
                    <Link
                      href={`/host/session/${params.id}`}
                      className="block w-full text-center bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                      Panel de Control
                    </Link>
                  </div>
                </div>
              ) : canJoin ? (
                /* Vista para jugadores */
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Comprar Cartones</h3>

                  {/* Balance */}
                  <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-4 text-white mb-4">
                    <p className="text-primary-100 text-sm">Tu Balance</p>
                    <p className="text-2xl font-bold">${balance.toFixed(2)}</p>
                  </div>

                  {/* Cantidad de cartones */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cantidad de Cartones
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500">
                      {[1, 2, 3, 5, 10].map((qty) => (
                        <option key={qty} value={qty}>
                          {qty} {qty === 1 ? 'cartón' : 'cartones'} - ${(qty * cardPrice).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Descuentos */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-green-800 font-semibold mb-1">💰 Descuentos Disponibles</p>
                    <ul className="text-xs text-green-700 space-y-1">
                      <li>• 3 cartones: 5% de descuento</li>
                      <li>• 5 cartones: 10% de descuento</li>
                      <li>• 10 cartones: 15% de descuento</li>
                    </ul>
                  </div>

                  {/* Resumen */}
                  <div className="border-t border-gray-200 pt-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">${cardPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento:</span>
                      <span className="font-semibold text-green-600">-$0.00</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total:</span>
                      <span className="text-primary-600">${cardPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {balance >= cardPrice ? (
                    <button className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                      Comprar Cartones
                    </button>
                  ) : (
                    <div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <p className="text-xs text-yellow-800">
                          Saldo insuficiente. Necesitas ${(cardPrice - balance).toFixed(2)} más.
                        </p>
                      </div>
                      <Link
                        href="/wallet/deposit"
                        className="block w-full text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      >
                        Depositar Fondos
                      </Link>
                    </div>
                  )}

                  {hasCards && (
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        ✅ Ya tienes <span className="font-bold">{bingoSession.cards.length}</span>{' '}
                        {bingoSession.cards.length === 1 ? 'cartón' : 'cartones'} en esta sesión
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Sesión terminada o cancelada */
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-600">Esta sesión ha finalizado</p>
                  <Link
                    href="/sessions"
                    className="inline-block mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Ver Otras Sesiones
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
