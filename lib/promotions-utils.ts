import { PrismaClient, PromotionType, SessionTier } from '@prisma/client'
import { prisma } from './prisma'

/**
 * Verifica si una Happy Hour está activa en el momento actual
 */
export function isHappyHourActive(
  promotion: {
    startTime: Date | null
    endTime: Date | null
    daysOfWeek: number[]
  },
  currentDate: Date = new Date()
): boolean {
  if (!promotion.startTime || !promotion.endTime) return false

  // Verificar día de la semana
  const currentDay = currentDate.getDay() // 0 = Domingo, 1 = Lunes, etc.
  if (!promotion.daysOfWeek.includes(currentDay)) return false

  // Verificar hora
  const currentHour = currentDate.getHours()
  const currentMinute = currentDate.getMinutes()
  const currentTimeInMinutes = currentHour * 60 + currentMinute

  const startHour = promotion.startTime.getHours()
  const startMinute = promotion.startTime.getMinutes()
  const startTimeInMinutes = startHour * 60 + startMinute

  const endHour = promotion.endTime.getHours()
  const endMinute = promotion.endTime.getMinutes()
  const endTimeInMinutes = endHour * 60 + endMinute

  // Si el rango cruza medianoche
  if (endTimeInMinutes < startTimeInMinutes) {
    return currentTimeInMinutes >= startTimeInMinutes || currentTimeInMinutes <= endTimeInMinutes
  }

  return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes
}

/**
 * Obtiene todas las promociones activas para un tier específico
 */
export async function getActivePromotions(
  tier: SessionTier,
  type?: PromotionType
): Promise<any[]> {
  const now = new Date()

  const where: any = {
    isActive: true,
    OR: [
      {
        AND: [
          { validFrom: { lte: now } },
          { validUntil: { gte: now } }
        ]
      },
      {
        validFrom: null,
        validUntil: null
      }
    ]
  }

  if (type) {
    where.type = type
  }

  const promotions = await prisma.promotion.findMany({
    where
  })

  // Filtrar por tier y Happy Hours activas
  return promotions.filter(promo => {
    // Verificar si aplica al tier
    if (promo.applicableTiers.length > 0 && !promo.applicableTiers.includes(tier)) {
      return false
    }

    // Verificar Happy Hours
    if (promo.type === 'HAPPY_HOUR') {
      return isHappyHourActive(promo, now)
    }

    // Verificar límite de usos
    if (promo.maxUses && promo.usesCount >= promo.maxUses) {
      return false
    }

    return true
  })
}

/**
 * Calcula el precio final con descuentos de promoción
 */
export function applyPromotionDiscount(
  basePrice: number,
  promotion: {
    discountPercentage: any
    discountAmount: any
  }
): number {
  let finalPrice = basePrice

  if (promotion.discountPercentage) {
    const discount = Number(promotion.discountPercentage)
    finalPrice = basePrice * (1 - discount / 100)
  } else if (promotion.discountAmount) {
    const discount = Number(promotion.discountAmount)
    finalPrice = basePrice - discount
  }

  return Math.max(0, finalPrice)
}

/**
 * Calcula descuento de combo (cartones bonus)
 */
export function calculateComboBonus(
  cardsCount: number,
  promotions: Array<{
    type: PromotionType
    minCards: number | null
    bonusCards: number | null
  }>
): number {
  let bonusCards = 0

  for (const promo of promotions) {
    if (promo.type === 'COMBO_SPECIAL' && promo.minCards && promo.bonusCards) {
      if (cardsCount >= promo.minCards) {
        bonusCards = Math.max(bonusCards, promo.bonusCards)
      }
    }
  }

  return bonusCards
}

/**
 * Registra el uso de una promoción
 */
export async function incrementPromotionUsage(
  promotionId: string,
  tx?: PrismaClient
): Promise<void> {
  const client = tx || prisma

  await client.promotion.update({
    where: { id: promotionId },
    data: {
      usesCount: {
        increment: 1
      }
    }
  })
}

/**
 * Verifica si un usuario puede usar una promoción
 */
export async function canUserUsePromotion(
  userId: string,
  promotionId: string
): Promise<boolean> {
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId }
  })

  if (!promotion || !promotion.isActive) return false
  if (promotion.maxUses && promotion.usesCount >= promotion.maxUses) return false

  // Si hay límite por usuario, verificar
  if (promotion.maxUsesPerUser) {
    // Contar cuántas veces ha usado esta promoción
    // Esto requeriría una tabla de tracking adicional, por ahora lo dejamos como true
    // TODO: Implementar tabla PromotionUsage para tracking por usuario
    return true
  }

  return true
}

/**
 * Obtiene el mejor descuento aplicable para una compra
 */
export async function getBestPromotion(
  tier: SessionTier,
  cardPrice: number,
  cardsCount: number
): Promise<{
  promotion: any
  finalPricePerCard: number
  bonusCards: number
  totalDiscount: number
} | null> {
  const promotions = await getActivePromotions(tier)

  if (promotions.length === 0) return null

  let bestDeal: any = null
  let bestValue = 0

  for (const promo of promotions) {
    let value = 0

    if (promo.type === 'HAPPY_HOUR' || promo.type === 'SEASONAL') {
      const discountedPrice = applyPromotionDiscount(cardPrice, promo)
      value = (cardPrice - discountedPrice) * cardsCount
    } else if (promo.type === 'COMBO_SPECIAL') {
      const bonusCards = calculateComboBonus(cardsCount, [promo])
      value = bonusCards * cardPrice
    }

    if (value > bestValue) {
      bestValue = value
      bestDeal = promo
    }
  }

  if (!bestDeal) return null

  let finalPricePerCard = cardPrice
  let bonusCards = 0

  if (bestDeal.type === 'COMBO_SPECIAL') {
    bonusCards = calculateComboBonus(cardsCount, [bestDeal])
  } else {
    finalPricePerCard = applyPromotionDiscount(cardPrice, bestDeal)
  }

  return {
    promotion: bestDeal,
    finalPricePerCard,
    bonusCards,
    totalDiscount: bestValue
  }
}

/**
 * Crea una promoción de Happy Hour
 */
export async function createHappyHour(data: {
  title: string
  description?: string
  discountPercentage: number
  startTime: Date
  endTime: Date
  daysOfWeek: number[]
  applicableTiers?: SessionTier[]
  validFrom?: Date
  validUntil?: Date
}): Promise<any> {
  return await prisma.promotion.create({
    data: {
      type: 'HAPPY_HOUR',
      title: data.title,
      description: data.description,
      discountPercentage: data.discountPercentage,
      startTime: data.startTime,
      endTime: data.endTime,
      daysOfWeek: data.daysOfWeek,
      applicableTiers: data.applicableTiers || [],
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      isActive: true
    }
  })
}

/**
 * Crea una promoción de Combo Especial
 */
export async function createComboSpecial(data: {
  title: string
  description?: string
  minCards: number
  bonusCards: number
  applicableTiers?: SessionTier[]
  validFrom?: Date
  validUntil?: Date
  maxUses?: number
}): Promise<any> {
  return await prisma.promotion.create({
    data: {
      type: 'COMBO_SPECIAL',
      title: data.title,
      description: data.description,
      minCards: data.minCards,
      bonusCards: data.bonusCards,
      applicableTiers: data.applicableTiers || [],
      validFrom: data.validFrom,
      validUntil: data.validUntil,
      maxUses: data.maxUses,
      isActive: true
    }
  })
}
