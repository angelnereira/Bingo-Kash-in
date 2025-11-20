import { PrismaClient, ChallengeType, TournamentStatus } from '@prisma/client'
import prisma from './prisma'

// ============================================
// SISTEMA DE LEADERBOARDS
// ============================================

/**
 * Actualiza la entrada de un usuario en un leaderboard
 */
export async function updateLeaderboardEntry(
  leaderboardKey: string,
  userId: string,
  score: number,
  metadata?: any
): Promise<void> {
  const leaderboard = await prisma.leaderboard.findUnique({
    where: { key: leaderboardKey, isActive: true }
  })

  if (!leaderboard) return

  // Buscar o crear entrada
  const existingEntry = await prisma.leaderboardEntry.findUnique({
    where: {
      leaderboardId_userId: {
        leaderboardId: leaderboard.id,
        userId
      }
    }
  })

  if (existingEntry) {
    // Actualizar solo si el nuevo score es mejor
    await prisma.leaderboardEntry.update({
      where: { id: existingEntry.id },
      data: {
        score: Math.max(Number(existingEntry.score), score),
        metadata
      }
    })
  } else {
    // Crear nueva entrada
    await prisma.leaderboardEntry.create({
      data: {
        leaderboardId: leaderboard.id,
        userId,
        rank: 0, // Se actualizará después
        score,
        metadata
      }
    })
  }

  // Recalcular rankings
  await recalculateLeaderboardRanks(leaderboard.id)
}

/**
 * Recalcula los rankings de un leaderboard
 */
export async function recalculateLeaderboardRanks(leaderboardId: string): Promise<void> {
  const entries = await prisma.leaderboardEntry.findMany({
    where: { leaderboardId },
    orderBy: { score: 'desc' }
  })

  // Actualizar ranks en orden
  for (let i = 0; i < entries.length; i++) {
    await prisma.leaderboardEntry.update({
      where: { id: entries[i].id },
      data: { rank: i + 1 }
    })
  }
}

/**
 * Obtiene el leaderboard con sus entradas
 */
export async function getLeaderboard(
  leaderboardKey: string,
  limit: number = 100
): Promise<any> {
  const leaderboard = await prisma.leaderboard.findUnique({
    where: { key: leaderboardKey, isActive: true },
    include: {
      entries: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              level: true
            }
          }
        },
        orderBy: { rank: 'asc' },
        take: limit
      }
    }
  })

  return leaderboard
}

/**
 * Obtiene la posición de un usuario en un leaderboard
 */
export async function getUserLeaderboardPosition(
  leaderboardKey: string,
  userId: string
): Promise<{ rank: number; score: number; total: number } | null> {
  const leaderboard = await prisma.leaderboard.findUnique({
    where: { key: leaderboardKey, isActive: true }
  })

  if (!leaderboard) return null

  const entry = await prisma.leaderboardEntry.findUnique({
    where: {
      leaderboardId_userId: {
        leaderboardId: leaderboard.id,
        userId
      }
    }
  })

  if (!entry) return null

  const total = await prisma.leaderboardEntry.count({
    where: { leaderboardId: leaderboard.id }
  })

  return {
    rank: entry.rank,
    score: Number(entry.score),
    total
  }
}

// ============================================
// SISTEMA DE DESAFÍOS
// ============================================

/**
 * Crea un desafío semanal
 */
export async function createWeeklyChallenge(data: {
  title: string
  description: string
  requirement: any
  rewardXP: number
  rewardPoints: number
  rewardCash?: number
}): Promise<any> {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setHours(0, 0, 0, 0)

  // Lunes de esta semana
  const dayOfWeek = startDate.getDay()
  const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  startDate.setDate(diff)

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 7)

  return await prisma.challenge.create({
    data: {
      type: 'WEEKLY',
      title: data.title,
      description: data.description,
      requirement: data.requirement,
      rewardXP: data.rewardXP,
      rewardPoints: data.rewardPoints,
      rewardCash: data.rewardCash,
      startDate,
      endDate,
      isActive: true
    }
  })
}

/**
 * Obtiene desafíos activos
 */
export async function getActiveChallenges(type?: ChallengeType): Promise<any[]> {
  const now = new Date()

  return await prisma.challenge.findMany({
    where: {
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
      ...(type && { type })
    },
    orderBy: { endDate: 'asc' }
  })
}

/**
 * Actualiza el progreso de un desafío para un usuario
 */
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  incrementBy: number = 1
): Promise<{
  completed: boolean
  progress: number
  challenge?: any
}> {
  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId }
  })

  if (!challenge || !challenge.isActive) {
    return { completed: false, progress: 0 }
  }

  // Buscar o crear progreso
  let userChallenge = await prisma.userChallenge.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId
      }
    }
  })

  if (!userChallenge) {
    userChallenge = await prisma.userChallenge.create({
      data: {
        userId,
        challengeId,
        progress: 0,
        status: 'ACTIVE'
      }
    })
  }

  if (userChallenge.status === 'COMPLETED' || userChallenge.status === 'CLAIMED') {
    return { completed: true, progress: userChallenge.progress }
  }

  const requirement = challenge.requirement as any
  const newProgress = userChallenge.progress + incrementBy
  const targetProgress = requirement.count || 1

  const isCompleted = newProgress >= targetProgress

  await prisma.userChallenge.update({
    where: { id: userChallenge.id },
    data: {
      progress: newProgress,
      status: isCompleted ? 'COMPLETED' : 'ACTIVE',
      completedAt: isCompleted ? new Date() : null
    }
  })

  return {
    completed: isCompleted,
    progress: newProgress,
    challenge: isCompleted ? challenge : undefined
  }
}

/**
 * Reclama las recompensas de un desafío completado
 */
export async function claimChallengeReward(
  userId: string,
  challengeId: string
): Promise<{ success: boolean; rewards?: any }> {
  const userChallenge = await prisma.userChallenge.findUnique({
    where: {
      userId_challengeId: {
        userId,
        challengeId
      }
    },
    include: { challenge: true }
  })

  if (!userChallenge || userChallenge.status !== 'COMPLETED') {
    return { success: false }
  }

  const challenge = userChallenge.challenge

  await prisma.$transaction(async (tx) => {
    // Marcar como reclamado
    await tx.userChallenge.update({
      where: { id: userChallenge.id },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date()
      }
    })

    // Otorgar recompensas
    if (challenge.rewardXP > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          experiencePoints: { increment: challenge.rewardXP }
        }
      })
    }

    if (challenge.rewardPoints > 0) {
      await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { increment: challenge.rewardPoints }
        }
      })
    }

    if (challenge.rewardCash && Number(challenge.rewardCash) > 0) {
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { increment: challenge.rewardCash }
        }
      })

      await tx.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: challenge.rewardCash,
          fee: 0,
          netAmount: challenge.rewardCash,
          description: `Recompensa de desafío: ${challenge.title}`,
          metadata: { challengeId: challenge.id }
        }
      })
    }
  })

  return {
    success: true,
    rewards: {
      xp: challenge.rewardXP,
      points: challenge.rewardPoints,
      cash: challenge.rewardCash ? Number(challenge.rewardCash) : 0
    }
  }
}

/**
 * Obtiene los desafíos de un usuario con su progreso
 */
export async function getUserChallenges(userId: string): Promise<any[]> {
  const activeChallenges = await getActiveChallenges()

  const userChallenges = await prisma.userChallenge.findMany({
    where: {
      userId,
      challengeId: { in: activeChallenges.map(c => c.id) }
    }
  })

  const userChallengeMap = new Map(
    userChallenges.map(uc => [uc.challengeId, uc])
  )

  return activeChallenges.map(challenge => {
    const userProgress = userChallengeMap.get(challenge.id)
    return {
      ...challenge,
      progress: userProgress?.progress || 0,
      status: userProgress?.status || 'ACTIVE',
      completedAt: userProgress?.completedAt,
      claimedAt: userProgress?.claimedAt
    }
  })
}

// ============================================
// SISTEMA DE TORNEOS
// ============================================

/**
 * Crea un torneo
 */
export async function createTournament(data: {
  title: string
  description?: string
  entryFee: number
  prizePool: number
  prizeDistribution: any
  registrationStart: Date
  registrationEnd: Date
  startDate: Date
  endDate: Date
  tier: any
  maxParticipants?: number
  minParticipants?: number
  rules?: any
}): Promise<any> {
  return await prisma.tournament.create({
    data: {
      ...data,
      status: 'UPCOMING'
    }
  })
}

/**
 * Inscribe un usuario en un torneo
 */
export async function registerForTournament(
  userId: string,
  tournamentId: string
): Promise<{ success: boolean; message: string }> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: true
    }
  })

  if (!tournament) {
    return { success: false, message: 'Torneo no encontrado' }
  }

  if (tournament.status !== 'UPCOMING' && tournament.status !== 'REGISTRATION_OPEN') {
    return { success: false, message: 'Las inscripciones están cerradas' }
  }

  const now = new Date()
  if (now < tournament.registrationStart || now > tournament.registrationEnd) {
    return { success: false, message: 'Fuera del período de inscripción' }
  }

  if (tournament.maxParticipants && tournament.participants.length >= tournament.maxParticipants) {
    return { success: false, message: 'Torneo lleno' }
  }

  // Verificar si ya está inscrito
  const existing = tournament.participants.find(p => p.userId === userId)
  if (existing) {
    return { success: false, message: 'Ya estás inscrito en este torneo' }
  }

  // Verificar saldo del usuario
  const wallet = await prisma.wallet.findUnique({
    where: { userId }
  })

  if (!wallet || Number(wallet.balance) < Number(tournament.entryFee)) {
    return { success: false, message: 'Saldo insuficiente' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Deducir entry fee
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: tournament.entryFee }
        }
      })

      // Crear transacción
      await tx.transaction.create({
        data: {
          userId,
          type: 'CARD_PURCHASE',
          status: 'COMPLETED',
          amount: tournament.entryFee,
          fee: 0,
          netAmount: tournament.entryFee,
          description: `Inscripción a torneo: ${tournament.title}`,
          metadata: { tournamentId: tournament.id }
        }
      })

      // Inscribir al usuario
      await tx.tournamentParticipant.create({
        data: {
          tournamentId: tournament.id,
          userId
        }
      })
    })

    return { success: true, message: 'Inscripción exitosa' }
  } catch (error) {
    console.error('Error en inscripción:', error)
    return { success: false, message: 'Error procesando la inscripción' }
  }
}

/**
 * Actualiza el puntaje de un participante en un torneo
 */
export async function updateTournamentScore(
  tournamentId: string,
  userId: string,
  score: number
): Promise<void> {
  await prisma.tournamentParticipant.updateMany({
    where: {
      tournamentId,
      userId
    },
    data: {
      score: { increment: score }
    }
  })

  // Recalcular rankings
  await recalculateTournamentRanks(tournamentId)
}

/**
 * Recalcula los rankings de un torneo
 */
export async function recalculateTournamentRanks(tournamentId: string): Promise<void> {
  const participants = await prisma.tournamentParticipant.findMany({
    where: { tournamentId },
    orderBy: { score: 'desc' }
  })

  for (let i = 0; i < participants.length; i++) {
    await prisma.tournamentParticipant.update({
      where: { id: participants[i].id },
      data: { rank: i + 1 }
    })
  }
}

/**
 * Finaliza un torneo y distribuye premios
 */
export async function finalizeTournament(tournamentId: string): Promise<void> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      participants: {
        orderBy: { rank: 'asc' }
      }
    }
  })

  if (!tournament) return

  const prizeDistribution = tournament.prizeDistribution as any
  const totalPrize = Number(tournament.prizePool)

  await prisma.$transaction(async (tx) => {
    // Actualizar estado del torneo
    await tx.tournament.update({
      where: { id: tournamentId },
      data: { status: 'COMPLETED' }
    })

    // Distribuir premios
    for (const participant of tournament.participants) {
      const rankStr = participant.rank?.toString()
      if (!rankStr || !prizeDistribution[rankStr]) continue

      const prizePercentage = prizeDistribution[rankStr]
      const prizeAmount = (totalPrize * prizePercentage) / 100

      // Actualizar participante
      await tx.tournamentParticipant.update({
        where: { id: participant.id },
        data: {
          prizeWon: prizeAmount,
          isPaid: false
        }
      })

      // Acreditar premio
      await tx.wallet.update({
        where: { userId: participant.userId },
        data: {
          balance: { increment: prizeAmount },
          totalWinnings: { increment: prizeAmount }
        }
      })

      // Crear transacción
      await tx.transaction.create({
        data: {
          userId: participant.userId,
          type: 'PRIZE_WIN',
          status: 'COMPLETED',
          amount: prizeAmount,
          fee: 0,
          netAmount: prizeAmount,
          description: `Premio de torneo (Puesto #${participant.rank}): ${tournament.title}`,
          metadata: { tournamentId, rank: participant.rank }
        }
      })
    }
  })
}

/**
 * Obtiene torneos activos
 */
export async function getActiveTournaments(): Promise<any[]> {
  return await prisma.tournament.findMany({
    where: {
      status: {
        in: ['UPCOMING', 'REGISTRATION_OPEN', 'IN_PROGRESS']
      }
    },
    include: {
      _count: {
        select: { participants: true }
      }
    },
    orderBy: { startDate: 'asc' }
  })
}
