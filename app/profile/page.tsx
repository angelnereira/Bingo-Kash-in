import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Obtener información completa del usuario
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      wallet: true,
      _count: {
        select: {
          cards: true,
          participations: true,
          hostedSessions: true,
        },
      },
    },
  })

  if (!user) {
    redirect('/auth/login')
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="text-gray-600 mt-1">Información de tu cuenta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Información Personal</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <p className="text-lg text-gray-900">{user.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
              <p className="text-lg text-gray-900">@{user.username}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
              <p className="text-lg text-gray-900">{user.email}</p>
              {user.emailVerified ? (
                <span className="inline-flex items-center mt-1 text-sm text-green-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verificado
                </span>
              ) : (
                <span className="inline-flex items-center mt-1 text-sm text-yellow-600">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  No verificado
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                user.role === 'ADMIN'
                  ? 'bg-purple-100 text-purple-800'
                  : user.role === 'HOST'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {user.role === 'ADMIN' && '👑 Administrador'}
                {user.role === 'HOST' && '🎤 Anfitrión'}
                {user.role === 'PLAYER' && '🎮 Jugador'}
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Miembro desde</label>
              <p className="text-lg text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="space-y-6">
          {/* Balance */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Balance Total</h3>
            <p className="text-3xl font-bold">${user.wallet?.balance.toNumber().toFixed(2) || '0.00'}</p>
            <p className="text-sm text-primary-100 mt-2">Balance disponible</p>
          </div>

          {/* Estadísticas de Juego */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cartones Comprados</span>
                <span className="text-lg font-bold text-gray-900">{user._count.cards}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Sesiones Jugadas</span>
                <span className="text-lg font-bold text-gray-900">{user._count.participations}</span>
              </div>
              {(user.role === 'HOST' || user.role === 'ADMIN') && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sesiones Creadas</span>
                  <span className="text-lg font-bold text-gray-900">{user._count.hostedSessions}</span>
                </div>
              )}
            </div>
          </div>

          {/* Estado de Cuenta */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado de Cuenta</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cuenta</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  user.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : user.status === 'SUSPENDED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.status === 'ACTIVE' && 'Activa'}
                  {user.status === 'SUSPENDED' && 'Suspendida'}
                  {user.status === 'INACTIVE' && 'Inactiva'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  user.emailVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {user.emailVerified ? 'Verificado' : 'Sin verificar'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
