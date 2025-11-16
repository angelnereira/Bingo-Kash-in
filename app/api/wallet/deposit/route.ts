import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createTransaction } from '@/lib/wallet-utils'
import { TransactionType, PaymentMethod } from '@prisma/client'
import { z } from 'zod'

const depositSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a 0'),
  paymentMethod: z.enum(['YAPPY', 'CREDIT_CARD']),
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
    const { amount, paymentMethod } = depositSchema.parse(body)

    // Crear transacción pendiente
    const transaction = await createTransaction({
      userId: session.user.id,
      type: TransactionType.DEPOSIT,
      amount,
      paymentMethod: paymentMethod as PaymentMethod,
      description: `Depósito vía ${paymentMethod}`,
    })

    // Aquí normalmente se integraría con Stripe o Yappy
    // Por ahora, retornamos la transacción para que el frontend procese el pago

    return NextResponse.json({
      transaction,
      message: 'Transacción creada. Proceda con el pago.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error en depósito:', error)
    return NextResponse.json(
      { error: 'Error al procesar depósito' },
      { status: 500 }
    )
  }
}
