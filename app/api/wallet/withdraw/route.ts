import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTransaction, getUserBalance } from '@/lib/wallet-utils'
import { TransactionType } from '@prisma/client'
import { z } from 'zod'

const withdrawSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  bankAccount: z.string().min(1, 'Cuenta bancaria requerida'),
})

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { amount, bankAccount } = withdrawSchema.parse(body)

    // Verificar balance disponible
    const balance = await getUserBalance(session.user.id)

    if (balance.availableBalance < amount) {
      return NextResponse.json(
        { error: 'Balance insuficiente' },
        { status: 400 }
      )
    }

    // Crear transacción de retiro
    const transaction = await createTransaction({
      userId: session.user.id,
      type: TransactionType.WITHDRAWAL,
      amount,
      description: 'Retiro de fondos',
      metadata: {
        bankAccount,
      },
    })

    return NextResponse.json({
      transaction,
      message: 'Solicitud de retiro enviada. Se procesará en 24-48 horas.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error en retiro:', error)
    return NextResponse.json(
      { error: 'Error al procesar retiro' },
      { status: 500 }
    )
  }
}
