import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateBingoCard } from '@/lib/bingo-utils'
import { createTransaction, getUserBalance } from '@/lib/wallet-utils'
import { calculateBulkPrice } from '@/lib/pricing-utils'
import { TransactionType, PaymentMethod } from '@prisma/client'
import { z } from 'zod'

const joinSchema = z.object({
  numberOfCards: z.number().int().min(1).max(10),
})

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions)

    if (!authSession?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { numberOfCards } = joinSchema.parse(body)

    const session = await prisma.bingoSession.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            cards: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Sesión no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que la sesión esté en estado válido
    if (session.status !== 'SCHEDULED' && session.status !== 'WAITING') {
      return NextResponse.json(
        { error: 'Esta sesión no está aceptando nuevos jugadores' },
        { status: 400 }
      )
    }

    // Verificar límite de cartones
    if (session._count.cards + numberOfCards > session.maxCards) {
      return NextResponse.json(
        { error: 'No hay suficientes cartones disponibles' },
        { status: 400 }
      )
    }

    // Verificar cartones por jugador
    const userCards = await prisma.bingoCard.count({
      where: {
        sessionId: params.id,
        userId: authSession.user.id,
      },
    })

    if (userCards + numberOfCards > session.maxCardsPerPlayer) {
      return NextResponse.json(
        { error: `Solo puedes comprar hasta ${session.maxCardsPerPlayer} cartones` },
        { status: 400 }
      )
    }

    // Calcular costo con descuentos por paquetes
    const basePrice = session.cardPrice.toNumber()
    const bulkDiscounts = session.bulkDiscounts as Record<string, number> | null

    const pricing = calculateBulkPrice(basePrice, numberOfCards, bulkDiscounts || undefined)
    const totalCost = pricing.finalPrice

    // Verificar balance
    const balance = await getUserBalance(authSession.user.id)
    if (balance.availableBalance < totalCost) {
      return NextResponse.json(
        { error: 'Balance insuficiente' },
        { status: 400 }
      )
    }

    // Procesar compra
    const result = await prisma.$transaction(async (tx) => {
      // Crear transacción
      await createTransaction({
        userId: authSession.user.id,
        type: TransactionType.CARD_PURCHASE,
        amount: totalCost,
        paymentMethod: PaymentMethod.WALLET,
        description: `Compra de ${numberOfCards} cartón(es) para sesión ${session.title}${pricing.savingsText ? ` - ${pricing.savingsText}` : ''}`,
        metadata: {
          sessionId: params.id,
          numberOfCards,
          originalPrice: pricing.originalPrice,
          discount: pricing.discountAmount,
          discountPercentage: pricing.discountPercentage,
        },
      })

      // Crear o actualizar participante
      const participant = await tx.sessionParticipant.upsert({
        where: {
          sessionId_userId: {
            sessionId: params.id,
            userId: authSession.user.id,
          },
        },
        create: {
          sessionId: params.id,
          userId: authSession.user.id,
          cardsPurchased: numberOfCards,
          totalSpent: totalCost,
        },
        update: {
          cardsPurchased: { increment: numberOfCards },
          totalSpent: { increment: totalCost },
        },
      })

      // Generar y crear cartones
      const cards = []
      const currentCardCount = await tx.bingoCard.count({
        where: { sessionId: params.id },
      })

      for (let i = 0; i < numberOfCards; i++) {
        const cardNumbers = generateBingoCard()
        const card = await tx.bingoCard.create({
          data: {
            sessionId: params.id,
            userId: authSession.user.id,
            cardNumber: currentCardCount + i + 1,
            numbers: cardNumbers,
          },
        })
        cards.push(card)
      }

      return { participant, cards }
    })

    return NextResponse.json({
      ...result,
      pricing,
      message: `${numberOfCards} cartón(es) comprado(s) exitosamente${pricing.savingsText ? ` - ${pricing.savingsText}` : ''}`,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error uniéndose a sesión:', error)
    return NextResponse.json(
      { error: 'Error al unirse a la sesión' },
      { status: 500 }
    )
  }
}
