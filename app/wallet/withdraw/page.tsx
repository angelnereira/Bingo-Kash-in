import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function WithdrawPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  })

  const balance = wallet?.balance.toNumber() || 0
  const lockedBalance = wallet?.lockedBalance.toNumber() || 0
  const withdrawalFee = parseFloat(process.env.WITHDRAWAL_FEE_PERCENTAGE || '2')

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Retirar Fondos</h1>
          <p className="text-gray-600 mb-8">Transfiere tus ganancias a tu cuenta bancaria</p>

          {/* Balance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg p-6 text-white">
              <p className="text-green-100 text-sm mb-1">Balance Disponible</p>
              <p className="text-3xl font-bold">${balance.toFixed(2)}</p>
              <p className="text-xs text-green-100 mt-2">Puedes retirar este monto</p>
            </div>

            <div className="bg-gradient-to-r from-gray-500 to-gray-700 rounded-lg p-6 text-white">
              <p className="text-gray-100 text-sm mb-1">Balance Bloqueado</p>
              <p className="text-3xl font-bold">${lockedBalance.toFixed(2)}</p>
              <p className="text-xs text-gray-100 mt-2">Fondos en juegos activos</p>
            </div>
          </div>

          {balance < 10 ? (
            /* Saldo insuficiente */
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <svg className="w-16 h-16 text-yellow-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-lg font-bold text-yellow-900 mb-2">Saldo Insuficiente</h3>
              <p className="text-yellow-800 mb-4">
                El monto mínimo para retiro es de <span className="font-bold">$10.00</span>
              </p>
              <p className="text-sm text-yellow-700">
                Balance actual: ${balance.toFixed(2)} | Te faltan: ${Math.max(0, 10 - balance).toFixed(2)}
              </p>
              <Link
                href="/sessions"
                className="inline-block mt-6 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Jugar y Ganar Más
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">Información de Retiro</h2>

              {/* Formulario de Retiro */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto a Retirar (USD)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[50, 100, 250, 500].filter(amount => amount <= balance).map((amount) => (
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
                      min="10"
                      max={balance}
                      step="0.01"
                      placeholder="Ingresa el monto"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Mínimo: $10.00</span>
                    <span>Máximo: ${balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Fee Information */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto solicitado:</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Comisión ({withdrawalFee}%):</span>
                    <span className="font-semibold text-red-600">-$0.00</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">Recibirás:</span>
                    <span className="font-bold text-green-600">$0.00</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método de Retiro
                  </label>
                  <select className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200">
                    <option value="">Selecciona un método</option>
                    <option value="bank">Transferencia Bancaria (ACH)</option>
                    <option value="paypal">PayPal</option>
                    <option value="yappy">Yappy (Panamá)</option>
                  </select>
                </div>

                {/* Información Bancaria */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="text-gray-600 text-sm">
                    Selecciona un método de retiro para continuar
                  </p>
                </div>

                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Solicitar Retiro
                </button>
              </div>
            </div>
          )}

          {/* Información Importante */}
          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Información del Proceso</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Monto mínimo de retiro: $10.00</li>
                    <li>• Comisión de retiro: {withdrawalFee}% del monto</li>
                    <li>• Tiempo de procesamiento: 1-3 días hábiles</li>
                    <li>• Los retiros se procesan de lunes a viernes</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">Importante</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• No puedes retirar fondos que están bloqueados en juegos activos</li>
                    <li>• Asegúrate de que tu información bancaria sea correcta</li>
                    <li>• Los retiros no pueden ser cancelados una vez procesados</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
