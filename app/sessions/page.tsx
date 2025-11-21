import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SessionStatus } from '@prisma/client'

export default async function SessionsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Obtener todas las sesiones disponibles
  const allSessions = await prisma.bingoSession.findMany({
    where: {
      status: {
        in: [SessionStatus.SCHEDULED, SessionStatus.WAITING, SessionStatus.IN_PROGRESS],
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
          cards: true,
        },
      },
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sesiones de Bingo</h1>
        <p className="text-gray-600 mt-1">Explora y únete a sesiones activas</p>
      </div>

      {allSessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No hay sesiones disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay sesiones activas en este momento. Vuelve más tarde o crea tu propia sesión si eres anfitrión.
            </p>
            {(session.user.role === 'HOST' || session.user.role === 'ADMIN') && (
              <div className="mt-6">
                <Link
                  href="/host/create"
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Crear Nueva Sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-gray-900">{session.title}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    session.status === 'IN_PROGRESS'
                      ? 'bg-green-100 text-green-800'
                      : session.status === 'WAITING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {session.status === 'IN_PROGRESS'
                    ? '🔴 En Vivo'
                    : session.status === 'WAITING'
                    ? '⏳ Esperando'
                    : '📅 Programada'}
                </span>
              </div>

              {session.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{session.description}</p>
              )}

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Anfitrión:</span>{' '}
                  {session.host.name || session.host.username}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Precio por cartón:</span>{' '}
                  <span className="text-primary-600 font-bold">${session.cardPrice.toNumber()}</span>
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Participantes:</span> {session._count.participants}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Cartones:</span> {session._count.cards} / {session.maxCards}
                </p>
              </div>

              <Link
                href={`/session/${session.id}`}
                className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                {session.status === 'IN_PROGRESS' ? 'Unirse Ahora' : 'Ver Detalles'}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
