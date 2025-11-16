import { NextResponse } from 'next/server'
import { TIER_PRICING, getPricingOptionsForTier, getPricingRecommendations } from '@/lib/pricing-utils'
import { SessionTier } from '@prisma/client'

/**
 * GET /api/pricing/tiers
 * Retorna información sobre todos los tiers de precios disponibles
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tier = searchParams.get('tier') as SessionTier | null

    // Si se solicita un tier específico
    if (tier) {
      const recommendations = getPricingRecommendations(tier)
      const options = getPricingOptionsForTier(tier)

      return NextResponse.json({
        tier,
        recommendations,
        options,
      })
    }

    // Retornar todos los tiers con información básica
    const allTiers = Object.entries(TIER_PRICING).map(([key, config]) => ({
      tier: key,
      label: config.label,
      description: config.description,
      icon: config.icon,
      priceRange: `$${config.minPrice.toFixed(2)} - $${config.maxPrice.toFixed(2)}`,
      popularPrice: config.popularPrice,
      features: config.features,
      color: config.color,
    }))

    return NextResponse.json({
      tiers: allTiers,
      message: 'Use ?tier=CASUAL|STANDARD|PREMIUM|VIP para obtener detalles específicos',
    })
  } catch (error) {
    console.error('Error obteniendo tiers:', error)
    return NextResponse.json(
      { error: 'Error al obtener información de tiers' },
      { status: 500 }
    )
  }
}
