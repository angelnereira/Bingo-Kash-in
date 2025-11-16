'use client'

import { calculateBulkPrice } from '@/lib/pricing-utils'

interface BulkDiscountDisplayProps {
  basePrice: number
  bulkDiscounts?: Record<string, number>
  className?: string
}

export function BulkDiscountDisplay({
  basePrice,
  bulkDiscounts,
  className = '',
}: BulkDiscountDisplayProps) {
  if (!bulkDiscounts || Object.keys(bulkDiscounts).length === 0) {
    return null
  }

  const quantities = Object.keys(bulkDiscounts)
    .map(Number)
    .sort((a, b) => a - b)

  return (
    <div className={`bg-gradient-to-r from-accent-50 to-primary-50 rounded-lg p-4 border border-accent-200 ${className}`}>
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-xl">🎁</span>
        ¡Descuentos por Paquete!
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {quantities.map((qty) => {
          const pricing = calculateBulkPrice(basePrice, qty, bulkDiscounts)
          return (
            <div
              key={qty}
              className="bg-white rounded-lg p-3 border border-accent-200 shadow-sm"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{qty}</div>
                <div className="text-xs text-gray-500">cartones</div>
              </div>
              <div className="mt-2 text-center">
                <div className="text-sm text-gray-500 line-through">
                  ${pricing.originalPrice.toFixed(2)}
                </div>
                <div className="text-lg font-bold text-accent-600">
                  ${pricing.finalPrice.toFixed(2)}
                </div>
              </div>
              <div className="mt-2 bg-accent-600 text-white text-xs font-bold text-center py-1 rounded">
                {pricing.discountPercentage}% OFF
              </div>
              <div className="mt-1 text-xs text-center text-green-600 font-semibold">
                Ahorras ${pricing.discountAmount.toFixed(2)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-3 text-xs text-gray-600 text-center">
        Compra más cartones y ahorra automáticamente
      </div>
    </div>
  )
}
