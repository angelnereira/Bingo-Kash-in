import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function DepositPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  })

  const balance = wallet?.balance.toNumber() || 0

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Link
          href="/wallet"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a Billetera
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Depositar Fondos</h1>
          <p className="text-gray-600 mb-8">Recarga tu billetera para jugar</p>

          {/* Balance Actual */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg p-6 text-white mb-8">
            <p className="text-primary-100 text-sm mb-1">Balance Actual</p>
            <p className="text-4xl font-bold">${balance.toFixed(2)}</p>
          </div>

          {/* Métodos de Pago */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Selecciona el método de pago</h2>

            {/* Tarjeta de Crédito/Débito */}
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="bg-primary-100 rounded-lg p-3 mr-4">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Tarjeta de Crédito/Débito</h3>
                    <p className="text-sm text-gray-600 mt-1">Visa, Mastercard, American Express</p>
                    <p className="text-xs text-gray-500 mt-2">Procesado por Stripe - Seguro y rápido</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                  Instantáneo
                </span>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Monto a depositar (USD)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors font-semibold"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    min="5"
                    step="0.01"
                    placeholder="Otro monto"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Mínimo: $5.00 | Máximo: $1,000.00</p>

                <button className="w-full mt-6 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Continuar con Tarjeta
                </button>
              </div>
            </div>

            {/* Yappy (Panamá) */}
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors cursor-pointer opacity-75">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="bg-yellow-100 rounded-lg p-3 mr-4">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Yappy</h3>
                    <p className="text-sm text-gray-600 mt-1">Pago móvil para usuarios en Panamá</p>
                    <p className="text-xs text-gray-500 mt-2">Sin comisiones adicionales</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  Próximamente
                </span>
              </div>
            </div>

            {/* Transferencia Bancaria */}
            <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary-500 transition-colors cursor-pointer opacity-75">
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-lg p-3 mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Transferencia Bancaria</h3>
                    <p className="text-sm text-gray-600 mt-1">ACH o Wire Transfer</p>
                    <p className="text-xs text-gray-500 mt-2">Procesamiento en 1-3 días hábiles</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">
                  Próximamente
                </span>
              </div>
            </div>
          </div>

          {/* Información Importante */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Información Importante</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Los depósitos con tarjeta se acreditan instantáneamente</li>
                  <li>• Todos los pagos son procesados de forma segura</li>
                  <li>• No almacenamos información de tarjetas en nuestros servidores</li>
                  <li>• Puedes retirar tus fondos en cualquier momento</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
