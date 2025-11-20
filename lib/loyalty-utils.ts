import { PrismaClient } from '@prisma/client'
import prisma from './prisma'
import { nanoid } from 'nanoid'

/**
 * Genera un código de referido único
 */
export function generateReferralCode(): string {
  return nanoid(10).toUpperCase()
}

/**
 * Asigna un código de referido a un usuario si no tiene uno
 */
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true }
  })

  if (user?.referralCode) {
    return user.referralCode
  }

  // Generar código único
  let code = generateReferralCode()
  let isUnique = false

  while (!isUnique) {
    const existing = await prisma.user.findUnique({
      where: { referralCode: code }
    })

    if (!existing) {
      isUnique = true
    } else {
      code = generateReferralCode()
    }
  }

  // Actualizar usuario con el código
  await prisma.user.update({
    where: { id: userId },
    data: { referralCode: code }
  })

  return code
}

/**
 * Procesa un referido (cuando un nuevo usuario usa un código)
 */
export async function processReferral(
  newUserId: string,
  referralCode: string,
  rewardAmounts: {
    referrer: number
    referred: number
  }
): Promise<{ success: boolean; message: string; referrerId?: string }> {
  // Buscar al usuario referidor
  const referrer = await prisma.user.findUnique({
    where: { referralCode }
  })

  if (!referrer) {
    return { success: false, message: 'Código de referido inválido' }
  }

  if (referrer.id === newUserId) {
    return { success: false, message: 'No puedes usar tu propio código de referido' }
  }

  // Verificar que el nuevo usuario no haya sido referido antes
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    select: { referredById: true }
  })

  if (newUser?.referredById) {
    return { success: false, message: 'Este usuario ya fue referido por alguien' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Actualizar el nuevo usuario con el referidor
      await tx.user.update({
        where: { id: newUserId },
        data: { referredById: referrer.id }
      })

      // Crear registro de recompensa de referido
      await tx.referralReward.create({
        data: {
          referrerId: referrer.id,
          referredId: newUserId,
          rewardAmount: rewardAmounts.referred,
          referrerReward: rewardAmounts.referrer,
          isPaid: false
        }
      })

      // Acreditar bonus al referidor
      await tx.wallet.update({
        where: { userId: referrer.id },
        data: {
          balance: { increment: rewardAmounts.referrer }
        }
      })

      // Crear transacción para el referidor
      await tx.transaction.create({
        data: {
          userId: referrer.id,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: rewardAmounts.referrer,
          fee: 0,
          netAmount: rewardAmounts.referrer,
          description: `Bonus de referido: ${referralCode}`,
          metadata: { referredUserId: newUserId }
        }
      })

      // Acreditar bonus al usuario referido
      await tx.wallet.update({
        where: { userId: newUserId },
        data: {
          balance: { increment: rewardAmounts.referred }
        }
      })

      // Crear transacción para el referido
      await tx.transaction.create({
        data: {
          userId: newUserId,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: rewardAmounts.referred,
          fee: 0,
          netAmount: rewardAmounts.referred,
          description: `Bonus de bienvenida por referido`,
          metadata: { referrerId: referrer.id, referralCode }
        }
      })
    })

    return {
      success: true,
      message: 'Referido procesado exitosamente',
      referrerId: referrer.id
    }
  } catch (error) {
    console.error('Error procesando referido:', error)
    return { success: false, message: 'Error procesando el referido' }
  }
}

/**
 * Otorga puntos de lealtad a un usuario
 */
export async function awardLoyaltyPoints(
  userId: string,
  points: number,
  reason: string,
  tx?: PrismaClient
): Promise<number> {
  const client = tx || prisma

  const user = await client.user.update({
    where: { id: userId },
    data: {
      loyaltyPoints: { increment: points }
    },
    select: { loyaltyPoints: true }
  })

  return user.loyaltyPoints
}

/**
 * Calcula puntos de lealtad basados en gasto
 */
export function calculateLoyaltyPointsFromSpend(amount: number): number {
  // 1 punto por cada $1 gastado
  return Math.floor(amount)
}

/**
 * Obtiene recompensas de lealtad disponibles para un usuario
 */
export async function getAvailableLoyaltyRewards(userId: string): Promise<any[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true }
  })

  if (!user) return []

  return await prisma.loyaltyReward.findMany({
    where: {
      isActive: true,
      pointsRequired: { lte: user.loyaltyPoints }
    },
    orderBy: { pointsRequired: 'asc' }
  })
}

/**
 * Canjea una recompensa de lealtad
 */
export async function redeemLoyaltyReward(
  userId: string,
  rewardId: string
): Promise<{ success: boolean; message: string; reward?: any }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { loyaltyPoints: true }
  })

  const reward = await prisma.loyaltyReward.findUnique({
    where: { id: rewardId }
  })

  if (!reward || !reward.isActive) {
    return { success: false, message: 'Recompensa no encontrada o inactiva' }
  }

  if (!user || user.loyaltyPoints < reward.pointsRequired) {
    return { success: false, message: 'Puntos insuficientes' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Deducir puntos
      await tx.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { decrement: reward.pointsRequired }
        }
      })

      // Aplicar la recompensa según el tipo
      if (reward.rewardType === 'BONUS_CASH') {
        await tx.wallet.update({
          where: { userId },
          data: {
            balance: { increment: reward.rewardValue }
          }
        })

        await tx.transaction.create({
          data: {
            userId,
            type: 'DEPOSIT',
            status: 'COMPLETED',
            amount: reward.rewardValue,
            fee: 0,
            netAmount: reward.rewardValue,
            description: `Recompensa de lealtad: ${reward.title}`,
            metadata: { rewardId, loyaltyPoints: reward.pointsRequired }
          }
        })
      }

      // Para DISCOUNT y FREE_CARDS, se manejarán al momento de la compra
      // guardando el rewardId en el usuario o creando un cupón temporal
    })

    return {
      success: true,
      message: 'Recompensa canjeada exitosamente',
      reward
    }
  } catch (error) {
    console.error('Error canjeando recompensa:', error)
    return { success: false, message: 'Error canjeando la recompensa' }
  }
}

/**
 * Procesa bonus de bienvenida para nuevo usuario
 */
export async function claimWelcomeBonus(
  userId: string,
  bonusAmount: number
): Promise<{ success: boolean; message: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasClaimedWelcomeBonus: true }
  })

  if (!user) {
    return { success: false, message: 'Usuario no encontrado' }
  }

  if (user.hasClaimedWelcomeBonus) {
    return { success: false, message: 'Ya has reclamado el bonus de bienvenida' }
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Marcar como reclamado
      await tx.user.update({
        where: { id: userId },
        data: { hasClaimedWelcomeBonus: true }
      })

      // Acreditar bonus
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: { increment: bonusAmount }
        }
      })

      // Crear transacción
      await tx.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          amount: bonusAmount,
          fee: 0,
          netAmount: bonusAmount,
          description: 'Bonus de bienvenida',
          metadata: { type: 'welcome_bonus' }
        }
      })
    })

    return { success: true, message: 'Bonus de bienvenida acreditado' }
  } catch (error) {
    console.error('Error procesando bonus de bienvenida:', error)
    return { success: false, message: 'Error procesando el bonus' }
  }
}

/**
 * Obtiene estadísticas de referidos de un usuario
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number
  totalEarned: number
  pendingRewards: number
  referrals: any[]
}> {
  const referrals = await prisma.user.findMany({
    where: { referredById: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  })

  const rewards = await prisma.referralReward.findMany({
    where: { referrerId: userId }
  })

  const totalEarned = rewards
    .filter(r => r.isPaid)
    .reduce((sum, r) => sum + Number(r.referrerReward), 0)

  const pendingRewards = rewards
    .filter(r => !r.isPaid)
    .reduce((sum, r) => sum + Number(r.referrerReward), 0)

  return {
    totalReferrals: referrals.length,
    totalEarned,
    pendingRewards,
    referrals
  }
}
