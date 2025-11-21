import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { SessionTier } from '@prisma/client'
import { authOptions } from '@/lib/auth'
import { getActivePromotions, createHappyHour, createComboSpecial } from '@/lib/promotions-utils'
import { z } from 'zod'

// GET /api/promotions - Obtener promociones activas
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const tier = searchParams.get('tier') as any
    const type = searchParams.get('type') as any

    const promotions = await getActivePromotions(tier || 'STANDARD', type)

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('Error getting promotions:', error)
    return NextResponse.json(
      { error: 'Error al obtener promociones' },
      { status: 500 }
    )
  }
}

// POST /api/promotions - Crear promoción (solo ADMIN)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { type, ...data } = body

    let promotion

    if (type === 'HAPPY_HOUR') {
      const schema = z.object({
        title: z.string(),
        description: z.string().optional(),
        discountPercentage: z.number().min(1).max(100),
        startTime: z.string(),
        endTime: z.string(),
        daysOfWeek: z.array(z.number().min(0).max(6)),
        applicableTiers: z.array(z.string()).optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional()
      })

      const validated = schema.parse(data)

      promotion = await createHappyHour({
        ...validated,
        startTime: new Date(`1970-01-01T${validated.startTime}`),
        endTime: new Date(`1970-01-01T${validated.endTime}`),
        validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
        applicableTiers: validated.applicableTiers ? validated.applicableTiers.map(t => t as SessionTier) : undefined
      })
    } else if (type === 'COMBO_SPECIAL') {
      const schema = z.object({
        title: z.string(),
        description: z.string().optional(),
        minCards: z.number().min(1),
        bonusCards: z.number().min(1),
        applicableTiers: z.array(z.string()).optional(),
        validFrom: z.string().optional(),
        validUntil: z.string().optional(),
        maxUses: z.number().optional()
      })

      const validated = schema.parse(data)

      promotion = await createComboSpecial({
        ...validated,
        validFrom: validated.validFrom ? new Date(validated.validFrom) : undefined,
        validUntil: validated.validUntil ? new Date(validated.validUntil) : undefined,
        applicableTiers: validated.applicableTiers ? validated.applicableTiers.map(t => t as SessionTier) : undefined
      })
    } else {
      return NextResponse.json(
        { error: 'Tipo de promoción inválido' },
        { status: 400 }
      )
    }

    return NextResponse.json({ promotion }, { status: 201 })
  } catch (error) {
    console.error('Error creating promotion:', error)
    return NextResponse.json(
      { error: 'Error al crear promoción' },
      { status: 500 }
    )
  }
}
