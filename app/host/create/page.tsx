import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function CreateSessionPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Verificar que el usuario sea HOST o ADMIN
  if (session.user.role !== 'HOST' && session.user.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Crear Nueva Sesión de Bingo</h1>
          <p className="text-gray-600 mt-1">Configura tu sesión en vivo</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <form className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información Básica</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Título de la Sesión *
                </label>
                <input
                  id="title"
                  type="text"
                  required
                  placeholder="Ej: Bingo Nocturno del Viernes"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Describe tu sesión, premios especiales, temática, etc."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Programada *
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Hora Programada *
                  </label>
                  <input
                    id="scheduledTime"
                    type="time"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Configuración de Precios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración de Precios</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier de Precio *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { name: 'CASUAL', range: '$0.50 - $1.99', color: 'blue' },
                    { name: 'STANDARD', range: '$2.00 - $4.99', color: 'green' },
                    { name: 'PREMIUM', range: '$5.00 - $7.99', color: 'purple' },
                    { name: 'VIP', range: '$8.00 - $10.00', color: 'yellow' },
                  ].map((tier) => (
                    <label
                      key={tier.name}
                      className="flex items-center p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors"
                    >
                      <input type="radio" name="tier" value={tier.name} className="mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">{tier.name}</p>
                        <p className="text-sm text-gray-600">{tier.range}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="cardPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Precio por Cartón (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    id="cardPrice"
                    type="number"
                    min="0.50"
                    max="10.00"
                    step="0.01"
                    required
                    placeholder="2.99"
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Precio recomendado basado en el tier seleccionado</p>
              </div>

              <div>
                <label htmlFor="maxCards" className="block text-sm font-medium text-gray-700 mb-2">
                  Máximo de Cartones para Vender *
                </label>
                <input
                  id="maxCards"
                  type="number"
                  min="10"
                  max="1000"
                  required
                  placeholder="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Determina cuántos cartones totales puedes vender</p>
              </div>
            </div>
          </div>

          {/* Configuración de Premios */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Estructura de Premios</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="prizeStructure" className="block text-sm font-medium text-gray-700 mb-2">
                  Estructura de Premios *
                </label>
                <select
                  id="prizeStructure"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona una estructura</option>
                  <option value="winner_takes_all">Ganador se Lleva Todo (100%)</option>
                  <option value="split_80_20">80% Ganador / 20% Segundo Lugar</option>
                  <option value="split_70_20_10">70% / 20% / 10% (Top 3)</option>
                  <option value="progressive">Progresivo con Jackpot</option>
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Vista Previa de Distribución</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex justify-between">
                    <span>Ventas estimadas (50 cartones × $2.99):</span>
                    <span className="font-bold">$149.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pozo de premios (75%):</span>
                    <span className="font-bold text-green-600">$112.13</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tu comisión (10%):</span>
                    <span className="font-bold text-blue-600">$14.95</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Comisión plataforma (15%):</span>
                    <span className="font-bold">$22.43</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="hostCommission" className="block text-sm font-medium text-gray-700 mb-2">
                    Tu Comisión (%) *
                  </label>
                  <input
                    id="hostCommission"
                    type="number"
                    min="5"
                    max="15"
                    step="0.5"
                    required
                    placeholder="10"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Rango permitido: 5% - 15%</p>
                </div>

                <div>
                  <label htmlFor="minParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                    Mínimo de Participantes
                  </label>
                  <input
                    id="minParticipants"
                    type="number"
                    min="2"
                    max="50"
                    placeholder="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo para iniciar la sesión</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración Adicional */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración Adicional</h2>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="enableChat"
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="enableChat" className="ml-2 text-sm text-gray-700">
                  Habilitar chat en vivo
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="enableVoice"
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="enableVoice" className="ml-2 text-sm text-gray-700">
                  Habilitar transmisión de voz (Agora)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="autoDaub"
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="autoDaub" className="ml-2 text-sm text-gray-700">
                  Permitir auto-marcado de números
                </label>
              </div>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              Crear Sesión
            </button>
            <Link
              href="/dashboard"
              className="flex-1 text-center bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>

        {/* Información Importante */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Importante</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Una vez creada, la sesión estará visible para todos los usuarios</li>
                <li>• Puedes editar la sesión hasta 30 minutos antes del inicio programado</li>
                <li>• Si no se alcanza el mínimo de participantes, la sesión se cancelará automáticamente</li>
                <li>• Los fondos de los cartones vendidos se liberan solo después de la sesión</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
