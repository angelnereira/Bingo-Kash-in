import { PrismaClient, AchievementCategory } from '@prisma/client'
import { prisma } from './prisma'

// ============================================
// SISTEMA DE NIVELES Y EXPERIENCIA
// ============================================

/**
 * Configuración de niveles
 */
const LEVEL_CONFIG = {
  baseXP: 100, // XP requerida para nivel 2
  multiplier: 1.5 // Cada nivel requiere 1.5x más XP que el anterior
}

/**
 * Calcula la XP requerida para un nivel específico
 */
export function getXPRequiredForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(LEVEL_CONFIG.baseXP * Math.pow(LEVEL_CONFIG.multiplier, level - 2))
}

/**
 * Calcula el nivel basado en XP total
 */
export function calculateLevel(experiencePoints: number): number {
  let level = 1
  let totalXPRequired = 0

  while (true) {
    const xpForNextLevel = getXPRequiredForLevel(level + 1)
    if (totalXPRequired + xpForNextLevel > experiencePoints) {
      break
    }
    totalXPRequired += xpForNextLevel
    level++
  }

  return level
}

/**
 * Obtiene progreso hacia el siguiente nivel
 */
export function getLevelProgress(experiencePoints: number): {
  currentLevel: number
  nextLevel: number
  currentXP: number
  xpForNextLevel: number
  progressPercentage: number
} {
  const currentLevel = calculateLevel(experiencePoints)
  const nextLevel = currentLevel + 1

  // Calcular XP acumulada hasta el nivel actual
  let totalXPForCurrentLevel = 0
  for (let i = 1; i < currentLevel; i++) {
    totalXPForCurrentLevel += getXPRequiredForLevel(i + 1)
  }

  const currentXP = experiencePoints - totalXPForCurrentLevel
  const xpForNextLevel = getXPRequiredForLevel(nextLevel)
  const progressPercentage = Math.floor((currentXP / xpForNextLevel) * 100)

  return {
    currentLevel,
    nextLevel,
    currentXP,
    xpForNextLevel,
    progressPercentage
  }
}

/**
 * Otorga experiencia a un usuario y actualiza su nivel
 */
export async function awardExperience(
  userId: string,
  xp: number,
  reason: string,
  tx?: PrismaClient
): Promise<{
  newXP: number
  newLevel: number
  leveledUp: boolean
  levelsGained: number
}> {
  const client = tx || prisma

  const user = await client.user.findUnique({
    where: { id: userId },
    select: { experiencePoints: true, level: true }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  const oldLevel = user.level
  const newXP = user.experiencePoints + xp
  const newLevel = calculateLevel(newXP)
  const leveledUp = newLevel > oldLevel
  const levelsGained = newLevel - oldLevel

  await client.user.update({
    where: { id: userId },
    data: {
      experiencePoints: newXP,
      level: newLevel
    }
  })

  return {
    newXP,
    newLevel,
    leveledUp,
    levelsGained
  }
}

// ============================================
// SISTEMA DE LOGROS
// ============================================

/**
 * Verifica y actualiza el progreso de un logro
 */
export async function checkAndUpdateAchievement(
  userId: string,
  achievementKey: string,
  incrementBy: number = 1
): Promise<{
  completed: boolean
  progress: number
  achievement?: any
}> {
  const achievement = await prisma.achievement.findUnique({
    where: { key: achievementKey, isActive: true }
  })

  if (!achievement) {
    return { completed: false, progress: 0 }
  }

  // Buscar o crear progreso del usuario
  let userAchievement = await prisma.userAchievement.findUnique({
    where: {
      userId_achievementId: {
        userId,
        achievementId: achievement.id
      }
    }
  })

  if (!userAchievement) {
    userAchievement = await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id,
        progress: 0
      }
    })
  }

  if (userAchievement.isCompleted) {
    return { completed: true, progress: userAchievement.progress }
  }

  // Actualizar progreso
  const requirement = achievement.requirement as any
  const newProgress = userAchievement.progress + incrementBy
  const targetProgress = requirement.count || 1

  const isNowCompleted = newProgress >= targetProgress

  await prisma.userAchievement.update({
    where: { id: userAchievement.id },
    data: {
      progress: newProgress,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? new Date() : null
    }
  })

  // Si se completó, otorgar recompensas
  if (isNowCompleted) {
    await awardExperience(userId, achievement.rewardXP, `Logro completado: ${achievement.title}`)

    if (achievement.rewardPoints > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          loyaltyPoints: { increment: achievement.rewardPoints }
        }
      })
    }
  }

  return {
    completed: isNowCompleted,
    progress: newProgress,
    achievement: isNowCompleted ? achievement : undefined
  }
}

/**
 * Verifica múltiples logros después de una acción
 */
export async function checkAchievementsForAction(
  userId: string,
  action: 'game_played' | 'game_won' | 'cards_purchased' | 'money_spent'
): Promise<any[]> {
  const completedAchievements: any[] = []

  // Mapeo de acciones a claves de logros
  const achievementKeys: Record<string, string[]> = {
    game_played: ['first_game', 'games_10', 'games_50', 'games_100'],
    game_won: ['first_win', 'wins_10', 'wins_50'],
    cards_purchased: ['cards_10', 'cards_100', 'cards_1000'],
    money_spent: ['spend_100', 'spend_500', 'spend_1000']
  }

  const keysToCheck = achievementKeys[action] || []

  for (const key of keysToCheck) {
    const result = await checkAndUpdateAchievement(userId, key)
    if (result.completed && result.achievement) {
      completedAchievements.push(result.achievement)
    }
  }

  return completedAchievements
}

/**
 * Obtiene todos los logros de un usuario con su progreso
 */
export async function getUserAchievements(userId: string): Promise<any[]> {
  const achievements = await prisma.achievement.findMany({
    where: { isActive: true },
    include: {
      userAchievements: {
        where: { userId }
      }
    },
    orderBy: [{ category: 'asc' }, { createdAt: 'asc' }]
  })

  return achievements.map(achievement => {
    const userProgress = achievement.userAchievements[0]
    return {
      ...achievement,
      progress: userProgress?.progress || 0,
      isCompleted: userProgress?.isCompleted || false,
      completedAt: userProgress?.completedAt
    }
  })
}

// ============================================
// SISTEMA DE BADGES
// ============================================

/**
 * Otorga un badge a un usuario
 */
export async function awardBadge(
  userId: string,
  badgeKey: string
): Promise<{ success: boolean; badge?: any }> {
  const badge = await prisma.badge.findUnique({
    where: { key: badgeKey, isActive: true }
  })

  if (!badge) {
    return { success: false }
  }

  // Verificar si ya tiene el badge
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeId: {
        userId,
        badgeId: badge.id
      }
    }
  })

  if (existing) {
    return { success: false }
  }

  await prisma.userBadge.create({
    data: {
      userId,
      badgeId: badge.id
    }
  })

  return { success: true, badge }
}

/**
 * Obtiene todos los badges de un usuario
 */
export async function getUserBadges(userId: string): Promise<any[]> {
  return await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' }
  })
}

/**
 * Verifica y otorga badges automáticos basados en logros
 */
export async function checkAndAwardAutoBadges(userId: string): Promise<any[]> {
  const awardedBadges: any[] = []

  // Badges basados en nivel
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { level: true }
  })

  if (!user) return []

  const levelBadges: Record<number, string> = {
    10: 'level_10',
    25: 'level_25',
    50: 'level_50',
    100: 'level_100'
  }

  for (const [level, badgeKey] of Object.entries(levelBadges)) {
    if (user.level >= parseInt(level)) {
      const result = await awardBadge(userId, badgeKey)
      if (result.success && result.badge) {
        awardedBadges.push(result.badge)
      }
    }
  }

  return awardedBadges
}

// ============================================
// UTILIDADES DE GAMIFICACIÓN
// ============================================

/**
 * Obtiene el perfil completo de gamificación de un usuario
 */
export async function getUserGamificationProfile(userId: string): Promise<{
  user: any
  levelProgress: ReturnType<typeof getLevelProgress>
  achievements: any[]
  badges: any[]
  recentAchievements: any[]
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      username: true,
      level: true,
      experiencePoints: true,
      loyaltyPoints: true
    }
  })

  if (!user) {
    throw new Error('Usuario no encontrado')
  }

  const levelProgress = getLevelProgress(user.experiencePoints)
  const achievements = await getUserAchievements(userId)
  const badges = await getUserBadges(userId)

  const recentAchievements = await prisma.userAchievement.findMany({
    where: {
      userId,
      isCompleted: true
    },
    include: {
      achievement: true
    },
    orderBy: { completedAt: 'desc' },
    take: 5
  })

  return {
    user,
    levelProgress,
    achievements,
    badges,
    recentAchievements
  }
}

/**
 * Calcula recompensas de XP por acción
 */
export function calculateXPReward(action: string, metadata?: any): number {
  const xpRewards: Record<string, number> = {
    game_played: 10,
    game_won: 50,
    first_place: 100,
    card_purchased: 1,
    daily_login: 5
  }

  return xpRewards[action] || 0
}
