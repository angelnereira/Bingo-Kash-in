import { PrismaClient } from '@prisma/client'
import { prisma } from './prisma'

// ============================================
// SISTEMA DE EVENTOS TEMÁTICOS
// ============================================

/**
 * Crea un evento temático
 */
export async function createThematicEvent(data: {
  key: string
  title: string
  description?: string
  theme: string
  startDate: Date
  endDate: Date
  bannerUrl?: string
  iconUrl?: string
  colors?: any
  bonusMultiplier?: number
  specialRewards?: any
}): Promise<any> {
  return await prisma.thematicEvent.create({
    data: {
      ...data,
      isActive: true
    }
  })
}

/**
 * Obtiene eventos temáticos activos
 */
export async function getActiveThematicEvents(): Promise<any[]> {
  const now = new Date()

  return await prisma.thematicEvent.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now }
    },
    orderBy: { startDate: 'asc' }
  })
}

/**
 * Obtiene un evento temático por clave
 */
export async function getThematicEventByKey(key: string): Promise<any | null> {
  return await prisma.thematicEvent.findUnique({
    where: { key, isActive: true }
  })
}

/**
 * Verifica si una fecha está dentro de un evento temático
 */
export async function isDateInThematicEvent(date: Date = new Date()): Promise<any | null> {
  const events = await getActiveThematicEvents()
  return events.find(event =>
    date >= event.startDate && date <= event.endDate
  ) || null
}

/**
 * Aplica multiplicador de evento temático a premios
 */
export function applyEventBonus(
  baseAmount: number,
  event: { bonusMultiplier: any } | null
): number {
  if (!event || !event.bonusMultiplier) return baseAmount

  const multiplier = Number(event.bonusMultiplier)
  return baseAmount * multiplier
}

/**
 * Obtiene sesiones de un evento temático
 */
export async function getEventSessions(eventId: string): Promise<any[]> {
  return await prisma.bingoSession.findMany({
    where: {
      thematicEventId: eventId,
      status: {
        in: ['SCHEDULED', 'IN_PROGRESS']
      }
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          username: true
        }
      },
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  })
}

/**
 * Crea eventos temáticos predefinidos para el año
 */
export async function seedThematicEvents(year: number): Promise<void> {
  const events = [
    {
      key: `new_year_${year}`,
      title: '🎉 Año Nuevo',
      description: 'Celebra el año nuevo con premios especiales',
      theme: 'NEW_YEAR',
      startDate: new Date(`${year}-01-01`),
      endDate: new Date(`${year}-01-07`),
      bonusMultiplier: 1.5
    },
    {
      key: `valentines_${year}`,
      title: '💝 San Valentín',
      description: 'Comparte el amor con premios dobles',
      theme: 'VALENTINES',
      startDate: new Date(`${year}-02-10`),
      endDate: new Date(`${year}-02-14`),
      bonusMultiplier: 2.0
    },
    {
      key: `easter_${year}`,
      title: '🐰 Pascua',
      description: 'Busca los huevos de oro',
      theme: 'EASTER',
      startDate: new Date(`${year}-04-10`),
      endDate: new Date(`${year}-04-20`),
      bonusMultiplier: 1.3
    },
    {
      key: `halloween_${year}`,
      title: '🎃 Halloween',
      description: 'Premios de miedo',
      theme: 'HALLOWEEN',
      startDate: new Date(`${year}-10-25`),
      endDate: new Date(`${year}-10-31`),
      bonusMultiplier: 1.8
    },
    {
      key: `christmas_${year}`,
      title: '🎄 Navidad',
      description: 'Premios navideños especiales',
      theme: 'CHRISTMAS',
      startDate: new Date(`${year}-12-15`),
      endDate: new Date(`${year}-12-31`),
      bonusMultiplier: 2.5
    }
  ]

  for (const event of events) {
    const existing = await prisma.thematicEvent.findUnique({
      where: { key: event.key }
    })

    if (!existing) {
      await createThematicEvent(event)
    }
  }
}

// ============================================
// SISTEMA DE JACKPOTS PROGRESIVOS
// ============================================

/**
 * Crea un jackpot progresivo
 */
export async function createJackpot(data: {
  title: string
  description?: string
  seedAmount: number
  contributionRate: number
  winCondition: any
  startDate: Date
  endDate?: Date
}): Promise<any> {
  return await prisma.jackpot.create({
    data: {
      ...data,
      currentAmount: data.seedAmount,
      isActive: true
    }
  })
}

/**
 * Obtiene jackpots activos
 */
export async function getActiveJackpots(): Promise<any[]> {
  const now = new Date()

  return await prisma.jackpot.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      OR: [
        { endDate: null },
        { endDate: { gte: now } }
      ],
      winnerId: null
    },
    orderBy: { currentAmount: 'desc' }
  })
}

/**
 * Contribuye al jackpot basado en la venta de un cartón
 */
export async function contributeToJackpot(
  jackpotId: string,
  cardPrice: number
): Promise<number> {
  const jackpot = await prisma.jackpot.findUnique({
    where: { id: jackpotId }
  })

  if (!jackpot || !jackpot.isActive) return 0

  const contributionRate = Number(jackpot.contributionRate) / 100
  const contribution = cardPrice * contributionRate

  await prisma.jackpot.update({
    where: { id: jackpotId },
    data: {
      currentAmount: { increment: contribution }
    }
  })

  return contribution
}

/**
 * Verifica si un patrón de victoria califica para el jackpot
 */
export function checkJackpotWinCondition(
  jackpot: { winCondition: any },
  gameData: {
    pattern: string
    numbersCalledCount: number
    timeToWin?: number
  }
): boolean {
  const condition = jackpot.winCondition as any

  // Ejemplo de condiciones:
  // { type: "BLACKOUT", maxNumbers: 50 } - Blackout en menos de 50 números
  // { type: "FULL_CARD", maxTime: 300 } - Cartón completo en menos de 5 minutos
  // { type: "X_PATTERN", maxNumbers: 30 } - Patrón X en menos de 30 números

  if (condition.type && condition.type !== gameData.pattern) {
    return false
  }

  if (condition.maxNumbers && gameData.numbersCalledCount > condition.maxNumbers) {
    return false
  }

  if (condition.maxTime && gameData.timeToWin && gameData.timeToWin > condition.maxTime) {
    return false
  }

  return true
}

/**
 * Otorga el jackpot a un ganador
 */
export async function awardJackpot(
  jackpotId: string,
  winnerId: string,
  sessionId: string
): Promise<{ success: boolean; amount?: number }> {
  const jackpot = await prisma.jackpot.findUnique({
    where: { id: jackpotId }
  })

  if (!jackpot || !jackpot.isActive || jackpot.winnerId) {
    return { success: false }
  }

  const amount = Number(jackpot.currentAmount)

  try {
    await prisma.$transaction(async (tx) => {
      // Actualizar jackpot
      await tx.jackpot.update({
        where: { id: jackpotId },
        data: {
          winnerId,
          wonAt: new Date(),
          wonAmount: amount,
          isActive: false
        }
      })

      // Acreditar al ganador
      await tx.wallet.update({
        where: { userId: winnerId },
        data: {
          balance: { increment: amount },
          totalWinnings: { increment: amount }
        }
      })

      // Crear transacción
      await tx.transaction.create({
        data: {
          userId: winnerId,
          type: 'PRIZE_WIN',
          status: 'COMPLETED',
          amount,
          fee: 0,
          netAmount: amount,
          description: `¡JACKPOT! ${jackpot.title}`,
          metadata: {
            jackpotId,
            sessionId,
            type: 'jackpot_win'
          }
        }
      })
    })

    return { success: true, amount }
  } catch (error) {
    console.error('Error otorgando jackpot:', error)
    return { success: false }
  }
}

/**
 * Obtiene el jackpot más grande disponible
 */
export async function getLargestActiveJackpot(): Promise<any | null> {
  const jackpots = await getActiveJackpots()

  if (jackpots.length === 0) return null

  return jackpots.reduce((largest, current) =>
    Number(current.currentAmount) > Number(largest.currentAmount) ? current : largest
  )
}

/**
 * Obtiene historial de ganadores de jackpot
 */
export async function getJackpotWinners(limit: number = 10): Promise<any[]> {
  return await prisma.jackpot.findMany({
    where: {
      winnerId: { not: null }
    },
    include: {
      sessions: {
        select: {
          id: true,
          title: true,
          host: {
            select: {
              id: true,
              name: true,
              username: true
            }
          }
        },
        take: 1
      }
    },
    orderBy: { wonAt: 'desc' },
    take: limit
  })
}

/**
 * Resetea un jackpot después de ser ganado (para jackpots recurrentes)
 */
export async function resetJackpot(jackpotId: string): Promise<any> {
  const jackpot = await prisma.jackpot.findUnique({
    where: { id: jackpotId }
  })

  if (!jackpot) return null

  return await prisma.jackpot.update({
    where: { id: jackpotId },
    data: {
      currentAmount: jackpot.seedAmount,
      winnerId: null,
      wonAt: null,
      wonAmount: null,
      isActive: true
    }
  })
}

/**
 * Calcula estadísticas de jackpot
 */
export async function getJackpotStats(jackpotId: string): Promise<{
  totalContributed: number
  totalWon: number
  avgContributionPerSession: number
  sessionsCount: number
}> {
  const jackpot = await prisma.jackpot.findUnique({
    where: { id: jackpotId },
    include: {
      sessions: true
    }
  })

  if (!jackpot) {
    return {
      totalContributed: 0,
      totalWon: 0,
      avgContributionPerSession: 0,
      sessionsCount: 0
    }
  }

  const currentAmount = Number(jackpot.currentAmount)
  const seedAmount = Number(jackpot.seedAmount)
  const totalContributed = currentAmount - seedAmount
  const sessionsCount = jackpot.sessions.length

  return {
    totalContributed,
    totalWon: jackpot.wonAmount ? Number(jackpot.wonAmount) : 0,
    avgContributionPerSession: sessionsCount > 0 ? totalContributed / sessionsCount : 0,
    sessionsCount
  }
}

/**
 * Vincula un jackpot a una sesión
 */
export async function attachJackpotToSession(
  sessionId: string,
  jackpotId: string
): Promise<void> {
  await prisma.bingoSession.update({
    where: { id: sessionId },
    data: { jackpotId }
  })
}
