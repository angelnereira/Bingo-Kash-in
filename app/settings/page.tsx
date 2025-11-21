import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-600 mt-1">Gestiona las preferencias de tu cuenta</p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Notificaciones */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Notificaciones</h2>
            <p className="text-sm text-gray-600 mt-1">Gestiona cómo quieres recibir notificaciones</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificaciones de Email</p>
                <p className="text-sm text-gray-600">Recibe actualizaciones por correo electrónico</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notificaciones Push</p>
                <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Alertas de Sesión</p>
                <p className="text-sm text-gray-600">Notificaciones cuando inicia una sesión que sigues</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Preferencias de Juego */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Preferencias de Juego</h2>
            <p className="text-sm text-gray-600 mt-1">Personaliza tu experiencia de juego</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sonidos</p>
                <p className="text-sm text-gray-600">Activar efectos de sonido en el juego</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Música de Fondo</p>
                <p className="text-sm text-gray-600">Reproducir música durante las sesiones</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Auto-marcar Números</p>
                <p className="text-sm text-gray-600">Marcar automáticamente los números que salen</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Seguridad */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Seguridad</h2>
            <p className="text-sm text-gray-600 mt-1">Mantén tu cuenta segura</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Cambiar Contraseña</p>
                <p className="text-sm text-gray-600">Actualiza tu contraseña regularmente</p>
              </div>
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
                <p className="text-sm text-gray-600">Agrega una capa extra de seguridad</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Sesiones Activas</p>
                <p className="text-sm text-gray-600">Gestiona los dispositivos con acceso a tu cuenta</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Privacidad */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Privacidad</h2>
            <p className="text-sm text-gray-600 mt-1">Controla tu información personal</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Perfil Público</p>
                <p className="text-sm text-gray-600">Permite que otros usuarios vean tu perfil</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Mostrar Estadísticas</p>
                <p className="text-sm text-gray-600">Comparte tus estadísticas de juego</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Historial de Actividad</p>
                <p className="text-sm text-gray-600">Permite que otros vean tu actividad reciente</p>
              </div>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Zona de Peligro */}
        <div className="bg-white rounded-lg shadow border-2 border-red-200">
          <div className="px-6 py-4 border-b border-red-200 bg-red-50">
            <h2 className="text-xl font-bold text-red-900">Zona de Peligro</h2>
            <p className="text-sm text-red-700 mt-1">Acciones irreversibles - procede con cuidado</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Desactivar Cuenta</p>
                <p className="text-sm text-gray-600">Desactiva temporalmente tu cuenta</p>
              </div>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Próximamente
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Eliminar Cuenta</p>
                <p className="text-sm text-gray-600">Elimina permanentemente tu cuenta y todos tus datos</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Próximamente
              </button>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-blue-800 font-medium">
                Funcionalidades en Desarrollo
              </p>
              <p className="text-sm text-blue-700 mt-1">
                La mayoría de estas configuraciones estarán disponibles en futuras actualizaciones.
                Estamos trabajando para mejorar tu experiencia constantemente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
