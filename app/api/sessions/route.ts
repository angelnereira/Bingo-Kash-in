import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SessionStatus } from '@prisma/client'
import { z } from 'zod'

const createSessionSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime(),
  cardPrice: z.number().positive('El precio debe ser mayor a 0'),
  maxCards: z.number().int().positive().default(1000),
  maxCardsPerPlayer: z.number().int().positive().default(10),
  hostCommission: z.number().min(0).max(50, 'La comisión debe ser entre 0 y 50%'),
  rounds: z.array(z.object({
    pattern: z.enum(['LINE', 'TWO_LINES', 'FOUR_CORNERS', 'FULL_CARD', 'X_PATTERN', 'BLACKOUT']),
    prizePercentage: z.number().min(0).max(100),
  })).min(1, 'Debe haber al menos 1 ronda'),
})

// GET: Listar sesiones
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const hostId = searchParams.get('hostId')

    const where: any = {}

    if (status) {
      where.status = status as SessionStatus
    }

    if (hostId) {
      where.hostId = hostId
    }

    const sessions = await prisma.bingoSession.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
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
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error listando sesiones:', error)
    return NextResponse.json(
      { error: 'Error al listar sesiones' },
      { status: 500 }
    )
  }
}

// POST: Crear sesión
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea HOST o ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== 'HOST' && user?.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear sesiones' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const data = createSessionSchema.parse(body)

    // Validar que la suma de porcentajes de premios no exceda 100%
    const totalPrizePercentage = data.rounds.reduce((sum, r) => sum + r.prizePercentage, 0)
    if (totalPrizePercentage > 100) {
      return NextResponse.json(
        { error: 'La suma de porcentajes de premios no puede exceder 100%' },
        { status: 400 }
      )
    }

    // Calcular platform fee
    const platformFee = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE || '20')

    // Crear sesión
    const bingoSession = await prisma.bingoSession.create({
      data: {
        hostId: session.user.id,
        title: data.title,
        description: data.description,
        scheduledAt: new Date(data.scheduledAt),
        cardPrice: data.cardPrice,
        maxCards: data.maxCards,
        maxCardsPerPlayer: data.maxCardsPerPlayer,
        hostCommission: data.hostCommission,
        platformFee,
        rounds: {
          create: data.rounds.map((round, index) => ({
            roundNumber: index + 1,
            pattern: round.pattern,
            prizePercentage: round.prizePercentage,
          })),
        },
      },
      include: {
        rounds: true,
      },
    })

    return NextResponse.json(
      { session: bingoSession, message: 'Sesión creada exitosamente' },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creando sesión:', error)
    return NextResponse.json(
      { error: 'Error al crear sesión' },
      { status: 500 }
    )
  }
}
