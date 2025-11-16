import { getServerSession } from 'next/auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { SessionStatus } from '@prisma/client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Obtener balance
  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  })

  // Obtener sesiones activas
  const activeSessions = await prisma.bingoSession.findMany({
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
    take: 10,
  })

  const balance = wallet?.balance.toNumber() || 0
  const lockedBalance = wallet?.lockedBalance.toNumber() || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Bienvenido, {session.user.name}</p>
          </div>
          <div className="flex gap-4">
            {(session.user.role === 'HOST' || session.user.role === 'ADMIN') && (
              <Link
                href="/host/create"
                className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
              >
                Crear Sesión
              </Link>
            )}
            <Link
              href="/wallet"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Billetera
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg shadow-lg p-6 text-white mb-8">
          <h2 className="text-xl font-semibold mb-4">Tu Billetera</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-primary-100 text-sm">Balance Disponible</p>
              <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-primary-100 text-sm">Balance Bloqueado (en juego)</p>
              <p className="text-2xl font-semibold">${lockedBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Link
              href="/wallet/deposit"
              className="px-4 py-2 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
            >
              Depositar
            </Link>
            <Link
              href="/wallet/withdraw"
              className="px-4 py-2 bg-primary-700 text-white rounded-lg font-semibold hover:bg-primary-800 transition-colors border border-white"
            >
              Retirar
            </Link>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Sesiones Activas</h2>

          {activeSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No hay sesiones activas en este momento</p>
              <p className="text-gray-400 mt-2">Vuelve pronto o crea tu propia sesión</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeSessions.map((session) => (
                <div
                  key={session.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg text-gray-900">{session.title}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        session.status === 'IN_PROGRESS'
                          ? 'bg-green-100 text-green-800'
                          : session.status === 'WAITING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {session.status === 'IN_PROGRESS'
                        ? 'En Vivo'
                        : session.status === 'WAITING'
                        ? 'Esperando'
                        : 'Programada'}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-3">
                    Anfitrión: {session.host.name || session.host.username}
                  </p>

                  <div className="space-y-2 text-sm mb-4">
                    <p className="text-gray-700">
                      <span className="font-semibold">Precio:</span> ${session.cardPrice.toNumber()}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Participantes:</span> {session._count.participants}
                    </p>
                    <p className="text-gray-700">
                      <span className="font-semibold">Cartones vendidos:</span> {session._count.cards} / {session.maxCards}
                    </p>
                  </div>

                  <Link
                    href={`/session/${session.id}`}
                    className="block w-full text-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold"
                  >
                    {session.status === 'IN_PROGRESS' ? 'Entrar' : 'Ver Detalles'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
