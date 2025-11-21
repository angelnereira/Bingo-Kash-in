import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function WalletPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/login')
  }

  // Obtener billetera y transacciones recientes
  const wallet = await prisma.wallet.findUnique({
    where: { userId: session.user.id },
  })

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const balance = wallet?.balance.toNumber() || 0
  const lockedBalance = wallet?.lockedBalance.toNumber() || 0

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mi Billetera</h1>
        <p className="text-gray-600 mt-1">Gestiona tus fondos y transacciones</p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Balance Disponible */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-primary-100 text-sm font-medium">Balance Disponible</p>
              <p className="text-4xl font-bold mt-2">${balance.toFixed(2)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm text-primary-100">Disponible para jugar y retirar</p>
        </div>

        {/* Balance Bloqueado */}
        <div className="bg-gradient-to-br from-accent-500 to-accent-700 rounded-lg shadow-lg p-6 text-white">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-accent-100 text-sm font-medium">Balance Bloqueado</p>
              <p className="text-4xl font-bold mt-2">${lockedBalance.toFixed(2)}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
          <p className="text-sm text-accent-100">Fondos en juegos activos</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/wallet/deposit"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Depositar Fondos
        </Link>

        <Link
          href="/wallet/withdraw"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold shadow-md"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
          Retirar Fondos
        </Link>
      </div>

      {/* Transacciones Recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Transacciones Recientes</h2>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No tienes transacciones aún</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type === 'DEPOSIT' && '💰 Depósito'}
                      {transaction.type === 'WITHDRAWAL' && '💸 Retiro'}
                      {transaction.type === 'CARD_PURCHASE' && '🎮 Compra de Cartón'}
                      {transaction.type === 'PRIZE_WIN' && '🏆 Premio Ganado'}
                      {transaction.type === 'CARD_REFUND' && '↩️ Reembolso'}
                      {transaction.type === 'HOST_EARNINGS' && '💼 Ganancias de Host'}
                      {transaction.type === 'PLATFORM_FEE' && '📊 Comisión'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {new Date(transaction.createdAt).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 mt-1">{transaction.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.amount.toNumber() > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount.toNumber() > 0 ? '+' : ''}${Math.abs(transaction.amount.toNumber()).toFixed(2)}
                    </p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-1 ${
                        transaction.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.status === 'COMPLETED' && 'Completado'}
                      {transaction.status === 'PENDING' && 'Pendiente'}
                      {transaction.status === 'FAILED' && 'Fallido'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
