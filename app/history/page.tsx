import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function HistoryPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Obtener historial de sesiones donde participó
  const participatedSessions = await prisma.bingoSession.findMany({
    where: {
      participants: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      host: {
        select: {
          name: true,
          username: true,
        },
      },
      _count: {
        select: {
          participants: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  })

  // Obtener cartones comprados
  const purchasedCards = await prisma.bingoCard.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      session: {
        select: {
          title: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  })

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Historial de Juegos</h1>
        <p className="text-gray-600 mt-1">Revisa tu actividad y sesiones pasadas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-primary-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Sesiones Jugadas</p>
              <p className="text-2xl font-bold text-gray-900">{participatedSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-accent-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Cartones Comprados</p>
              <p className="text-2xl font-bold text-gray-900">{purchasedCards.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="bg-green-100 rounded-lg p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Victorias</p>
              <p className="text-2xl font-bold text-gray-900">
                {purchasedCards.filter((card) => card.isWinner).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sesiones Participadas */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Sesiones Participadas</h2>
        </div>

        {participatedSessions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No has participado en ninguna sesión aún</p>
            <Link
              href="/sessions"
              className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Explorar Sesiones
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {participatedSessions.map((session) => (
              <div key={session.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Anfitrión: {session.host.name || session.host.username}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        session.status === 'COMPLETED'
                          ? 'bg-gray-100 text-gray-800'
                          : session.status === 'CANCELLED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {session.status === 'COMPLETED' && 'Completada'}
                      {session.status === 'CANCELLED' && 'Cancelada'}
                      {session.status === 'IN_PROGRESS' && 'En Progreso'}
                      {session.status === 'WAITING' && 'En Espera'}
                      {session.status === 'SCHEDULED' && 'Programada'}
                    </span>
                    <p className="text-sm text-gray-600 mt-2">
                      {session._count.participants} participantes
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cartones Comprados */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Mis Cartones</h2>
        </div>

        {purchasedCards.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No has comprado ningún cartón aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {purchasedCards.map((card) => (
              <div key={card.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">{card.session.title}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Cartón #{card.cardNumber}
                      {card.isWinner && <span className="ml-2 text-green-600 font-semibold">🏆 Ganador</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(card.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <Link
                    href={`/session/${card.sessionId}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Ver Detalles →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
