'use client'

import { useState } from 'react'
import { TIER_PRICING, getPricingOptionsForTier } from '@/lib/pricing-utils'
import { SessionTier } from '@prisma/client'

interface PricingTierSelectorProps {
  onSelect: (tier: SessionTier, price: number) => void
  selectedTier?: SessionTier
  selectedPrice?: number
}

export function PricingTierSelector({
  onSelect,
  selectedTier,
  selectedPrice,
}: PricingTierSelectorProps) {
  const [activeTier, setActiveTier] = useState<SessionTier>(selectedTier || 'STANDARD')

  const handleTierChange = (tier: SessionTier) => {
    setActiveTier(tier)
    // Auto-seleccionar el precio popular del tier
    const popularPrice = TIER_PRICING[tier].popularPrice
    onSelect(tier, popularPrice)
  }

  const handlePriceSelect = (price: number) => {
    onSelect(activeTier, price)
  }

  const tierConfig = TIER_PRICING[activeTier]
  const priceOptions = getPricingOptionsForTier(activeTier)

  return (
    <div className="space-y-6">
      {/* Selector de Tier */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Categoría de Sesión
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(TIER_PRICING) as [SessionTier, typeof TIER_PRICING.CASUAL][]).map(
            ([tier, config]) => (
              <button
                key={tier}
                type="button"
                onClick={() => handleTierChange(tier)}
                className={`
                  p-4 rounded-lg border-2 text-left transition-all
                  ${
                    activeTier === tier
                      ? 'border-primary-600 bg-primary-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="text-2xl mb-2">{config.icon}</div>
                <div className="font-semibold text-gray-900">{config.label}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ${config.minPrice.toFixed(2)} - ${config.maxPrice.toFixed(2)}
                </div>
              </button>
            )
          )}
        </div>
      </div>

      {/* Descripción del Tier Activo */}
      <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg p-4 border border-primary-200">
        <div className="flex items-start gap-3">
          <div className="text-3xl">{tierConfig.icon}</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{tierConfig.label}</h3>
            <p className="text-gray-600 text-sm mt-1">{tierConfig.description}</p>
            <ul className="mt-3 space-y-1">
              {tierConfig.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                  <span className="text-primary-600">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Selector de Precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Precio por Cartón
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {priceOptions.map((option) => (
            <button
              key={option.price}
              type="button"
              onClick={() => handlePriceSelect(option.price)}
              className={`
                relative p-4 rounded-lg border-2 text-center transition-all
                ${
                  selectedPrice === option.price
                    ? 'border-accent-600 bg-accent-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }
              `}
            >
              {option.isPopular && (
                <div className="absolute -top-2 -right-2 bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Popular
                </div>
              )}
              <div className="text-2xl font-bold text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.savings}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calculadora de Ganancias */}
      {selectedPrice && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">Proyección de Ganancias</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Conservador', sales: 50 },
              { label: 'Realista', sales: 100 },
              { label: 'Optimista', sales: 200 },
            ].map((scenario) => {
              const revenue = selectedPrice * scenario.sales
              const hostEarnings = revenue * 0.1 // Asumiendo 10% comisión
              return (
                <div key={scenario.label}>
                  <div className="text-xs text-gray-500">{scenario.label}</div>
                  <div className="text-sm text-gray-700 mt-1">{scenario.sales} cartones</div>
                  <div className="text-lg font-bold text-primary-600 mt-1">
                    ${hostEarnings.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">ganancia</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
