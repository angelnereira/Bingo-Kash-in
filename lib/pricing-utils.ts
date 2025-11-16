import { SessionTier } from '@prisma/client'

/**
 * Configuración de precios por tier
 */
export const TIER_PRICING = {
  CASUAL: {
    label: 'Casual',
    description: 'Partidas casuales, bajo riesgo y alta diversión',
    icon: '🎲',
    minPrice: 0.5,
    maxPrice: 1.99,
    suggestedPrices: [0.5, 0.99, 1.49, 1.99],
    popularPrice: 0.99, // Precio psicológico
    color: 'blue',
    features: [
      'Ideal para principiantes',
      'Bajo riesgo',
      'Partidas rápidas',
    ],
  },
  STANDARD: {
    label: 'Estándar',
    description: 'El tier más popular, balance perfecto entre precio y premio',
    icon: '⭐',
    minPrice: 2.0,
    maxPrice: 4.99,
    suggestedPrices: [2.0, 2.99, 3.99, 4.99],
    popularPrice: 2.99, // Precio psicológico
    color: 'green',
    features: [
      'Mejor relación precio-premio',
      'Más popular',
      'Premios atractivos',
    ],
  },
  PREMIUM: {
    label: 'Premium',
    description: 'Mayor premio potencial para jugadores experimentados',
    icon: '💎',
    minPrice: 5.0,
    maxPrice: 7.99,
    suggestedPrices: [5.0, 5.99, 6.99, 7.99],
    popularPrice: 5.99, // Precio psicológico
    color: 'purple',
    features: [
      'Premios mayores',
      'Para jugadores experimentados',
      'Más emoción',
    ],
  },
  VIP: {
    label: 'VIP',
    description: 'Premios grandes, alto riesgo, máxima emoción',
    icon: '👑',
    minPrice: 8.0,
    maxPrice: 10.0,
    suggestedPrices: [8.0, 8.99, 9.99, 10.0],
    popularPrice: 9.99, // Precio psicológico
    color: 'gold',
    features: [
      'Premios enormes',
      'Alto riesgo, alta recompensa',
      'Exclusivo',
    ],
  },
} as const

/**
 * Descuentos por paquetes predefinidos
 */
export const DEFAULT_BULK_DISCOUNTS = {
  // Tier Casual - Descuentos agresivos para engagement
  CASUAL: {
    '3': 10,  // 3 cartones = 10% descuento
    '5': 15,  // 5 cartones = 15% descuento
    '10': 25, // 10 cartones = 25% descuento
  },
  // Tier Standard - Descuentos balanceados
  STANDARD: {
    '3': 8,   // 3 cartones = 8% descuento
    '5': 12,  // 5 cartones = 12% descuento
    '10': 20, // 10 cartones = 20% descuento
  },
  // Tier Premium - Descuentos moderados
  PREMIUM: {
    '3': 5,   // 3 cartones = 5% descuento
    '5': 10,  // 5 cartones = 10% descuento
    '10': 15, // 10 cartones = 15% descuento
  },
  // Tier VIP - Descuentos pequeños (precio ya es alto)
  VIP: {
    '5': 8,   // 5 cartones = 8% descuento
    '10': 12, // 10 cartones = 12% descuento
  },
} as const

/**
 * Calcula el precio total con descuento por paquete
 */
export function calculateBulkPrice(
  basePrice: number,
  quantity: number,
  discounts?: Record<string, number>
): {
  originalPrice: number
  discountPercentage: number
  discountAmount: number
  finalPrice: number
  savingsText: string
} {
  const originalPrice = basePrice * quantity

  // Si no hay descuentos definidos, retornar precio original
  if (!discounts) {
    return {
      originalPrice,
      discountPercentage: 0,
      discountAmount: 0,
      finalPrice: originalPrice,
      savingsText: '',
    }
  }

  // Encontrar el descuento aplicable (el mayor que aplique)
  let discountPercentage = 0
  const sortedThresholds = Object.keys(discounts)
    .map(Number)
    .sort((a, b) => b - a) // Ordenar de mayor a menor

  for (const threshold of sortedThresholds) {
    if (quantity >= threshold) {
      discountPercentage = discounts[threshold.toString()]
      break
    }
  }

  const discountAmount = (originalPrice * discountPercentage) / 100
  const finalPrice = originalPrice - discountAmount

  let savingsText = ''
  if (discountPercentage > 0) {
    savingsText = `¡Ahorra $${discountAmount.toFixed(2)} (${discountPercentage}% OFF)!`
  }

  return {
    originalPrice,
    discountPercentage,
    discountAmount,
    finalPrice,
    savingsText,
  }
}

/**
 * Obtiene el tier basado en el precio del cartón
 */
export function getTierByPrice(price: number): SessionTier {
  if (price >= TIER_PRICING.VIP.minPrice && price <= TIER_PRICING.VIP.maxPrice) {
    return 'VIP'
  }
  if (price >= TIER_PRICING.PREMIUM.minPrice && price <= TIER_PRICING.PREMIUM.maxPrice) {
    return 'PREMIUM'
  }
  if (price >= TIER_PRICING.STANDARD.minPrice && price <= TIER_PRICING.STANDARD.maxPrice) {
    return 'STANDARD'
  }
  return 'CASUAL'
}

/**
 * Valida que el precio esté dentro del rango del tier
 */
export function validateTierPrice(tier: SessionTier, price: number): boolean {
  const tierConfig = TIER_PRICING[tier]
  return price >= tierConfig.minPrice && price <= tierConfig.maxPrice
}

/**
 * Sugiere un precio redondeado psicológicamente atractivo
 */
export function suggestPsychologicalPrice(basePrice: number): number {
  // Redondear a .99, .49, .00
  if (basePrice < 1) {
    return 0.99
  }

  const rounded = Math.round(basePrice)

  // Precios terminados en .99 son psicológicamente atractivos
  if (basePrice < rounded) {
    return rounded - 0.01 // X.99
  }

  return rounded
}

/**
 * Genera opciones de precio para un tier
 */
export function getPricingOptionsForTier(tier: SessionTier) {
  const config = TIER_PRICING[tier]

  return config.suggestedPrices.map((price) => ({
    price,
    label: `$${price.toFixed(2)}`,
    isPopular: price === config.popularPrice,
    savings: price < config.popularPrice
      ? `${Math.round(((config.popularPrice - price) / config.popularPrice) * 100)}% más económico`
      : price > config.popularPrice
      ? 'Premios mayores'
      : 'Más popular',
  }))
}

/**
 * Calcula el pozo total de premios considerando comisiones
 */
export function calculatePrizePool(
  cardPrice: number,
  cardsSold: number,
  hostCommission: number,
  platformFee: number
): {
  totalRevenue: number
  hostEarnings: number
  platformEarnings: number
  prizePool: number
  breakdown: {
    percentage: number
    amount: number
    label: string
  }[]
} {
  const totalRevenue = cardPrice * cardsSold
  const hostEarnings = (totalRevenue * hostCommission) / 100
  const platformEarnings = (totalRevenue * platformFee) / 100
  const prizePool = totalRevenue - hostEarnings - platformEarnings

  return {
    totalRevenue,
    hostEarnings,
    platformEarnings,
    prizePool,
    breakdown: [
      {
        percentage: (prizePool / totalRevenue) * 100,
        amount: prizePool,
        label: 'Pozo de Premios',
      },
      {
        percentage: platformFee,
        amount: platformEarnings,
        label: 'Comisión Plataforma',
      },
      {
        percentage: hostCommission,
        amount: hostEarnings,
        label: 'Comisión Anfitrión',
      },
    ],
  }
}

/**
 * Genera recomendaciones de precios para anfitriones
 */
export function getPricingRecommendations(tier: SessionTier) {
  const config = TIER_PRICING[tier]
  const discounts = DEFAULT_BULK_DISCOUNTS[tier]

  return {
    tier,
    config,
    recommendedPrice: config.popularPrice,
    priceRange: `$${config.minPrice.toFixed(2)} - $${config.maxPrice.toFixed(2)}`,
    suggestedDiscounts: discounts,
    tips: [
      `El precio más popular en ${config.label} es $${config.popularPrice}`,
      `Precios terminados en .99 atraen más jugadores`,
      `Los descuentos por paquetes aumentan las ventas hasta 40%`,
      tier === 'CASUAL'
        ? 'Atrae nuevos jugadores con precios bajos'
        : tier === 'STANDARD'
        ? 'Balance perfecto entre accesibilidad y premios'
        : tier === 'PREMIUM'
        ? 'Jugadores buscan premios más grandes'
        : 'Público VIP busca exclusividad y grandes premios',
    ],
  }
}

/**
 * Calcula las ganancias proyectadas para el anfitrión
 */
export function calculateHostProjectedEarnings(
  cardPrice: number,
  estimatedSales: number,
  hostCommission: number
) {
  const scenarios = [
    { label: 'Pesimista', sales: Math.floor(estimatedSales * 0.5) },
    { label: 'Realista', sales: estimatedSales },
    { label: 'Optimista', sales: Math.floor(estimatedSales * 1.5) },
  ]

  return scenarios.map((scenario) => ({
    scenario: scenario.label,
    cardsSold: scenario.sales,
    totalRevenue: cardPrice * scenario.sales,
    hostEarnings: (cardPrice * scenario.sales * hostCommission) / 100,
  }))
}
