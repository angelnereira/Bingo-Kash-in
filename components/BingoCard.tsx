'use client'

import { getBingoLetter } from '@/lib/bingo-utils'

interface BingoCardProps {
  numbers: number[]
  markedCells: number[]
  onCellClick?: (index: number) => void
  isInteractive?: boolean
}

export function BingoCard({
  numbers,
  markedCells,
  onCellClick,
  isInteractive = false,
}: BingoCardProps) {
  const marked = new Set(markedCells)
  const letters = ['B', 'I', 'N', 'G', 'O']

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-w-md mx-auto">
      {/* Header con letras */}
      <div className="grid grid-cols-5 gap-1 mb-2">
        {letters.map((letter) => (
          <div
            key={letter}
            className="bg-primary-600 text-white font-bold text-2xl py-3 text-center rounded"
          >
            {letter}
          </div>
        ))}
      </div>

      {/* Grid de números */}
      <div className="grid grid-cols-5 gap-1">
        {numbers.map((number, index) => {
          const isMarked = marked.has(index) || index === 12 // 12 es FREE SPACE
          const isFreeSpace = index === 12

          return (
            <button
              key={index}
              onClick={() => isInteractive && onCellClick?.(index)}
              disabled={!isInteractive || isFreeSpace}
              className={`
                aspect-square rounded text-xl font-bold transition-all
                ${isMarked
                  ? 'bg-accent-500 text-white scale-95'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }
                ${isFreeSpace ? 'bg-gradient-to-br from-primary-400 to-accent-400 text-white' : ''}
                ${isInteractive && !isFreeSpace ? 'cursor-pointer' : 'cursor-default'}
              `}
            >
              {isFreeSpace ? '★' : number}
            </button>
          )
        })}
      </div>
    </div>
  )
}
