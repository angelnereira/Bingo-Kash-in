'use client'

import { useState, useEffect } from 'react'
import { BingoCell, getColumnLetter } from '@/lib/bingo-game-utils'

interface Props {
  card: BingoCell[][]
  cardNumber: number
  onCellClick?: (row: number, col: number) => void
  highlightNumber?: number | null
  readonly?: boolean
}

export function InteractiveBingoCard({
  card,
  cardNumber,
  onCellClick,
  highlightNumber,
  readonly = false
}: Props) {
  const [animatingCell, setAnimatingCell] = useState<string | null>(null)

  useEffect(() => {
    if (highlightNumber) {
      // Find and animate the cell with this number
      card.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell.number === highlightNumber) {
            const cellKey = `${rowIndex}-${colIndex}`
            setAnimatingCell(cellKey)
            setTimeout(() => setAnimatingCell(null), 1000)
          }
        })
      })
    }
  }, [highlightNumber, card])

  const handleCellClick = (row: number, col: number) => {
    if (readonly) return
    if (row === 2 && col === 2) return // FREE space
    if (onCellClick) {
      onCellClick(row, col)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 transition-all duration-300 hover:shadow-2xl">
      {/* Card Header */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Cartón #{cardNumber}
          </h3>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {card.flat().filter(c => c.marked).length} / 25
          </div>
        </div>

        {/* BINGO Letters */}
        <div className="grid grid-cols-5 gap-1 mb-2">
          {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => (
            <div
              key={letter}
              className="text-center font-bold text-lg py-1 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded"
              style={{
                animationDelay: `${idx * 0.1}s`,
              }}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Bingo Grid */}
      <div className="grid grid-cols-5 gap-1">
        {card.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const cellKey = `${rowIndex}-${colIndex}`
            const isFreeSpace = cell.number === null
            const isAnimating = animatingCell === cellKey

            return (
              <button
                key={cellKey}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                disabled={readonly || isFreeSpace}
                className={`
                  aspect-square rounded-lg font-bold text-sm sm:text-base
                  transition-all duration-300 transform
                  ${isFreeSpace
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white cursor-default'
                    : cell.marked
                    ? 'bg-gradient-to-br from-green-500 to-green-700 text-white scale-95'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                  }
                  ${!readonly && !isFreeSpace ? 'cursor-pointer' : 'cursor-default'}
                  ${isAnimating ? 'animate-bounce ring-4 ring-yellow-400' : ''}
                  flex items-center justify-center
                  shadow-md hover:shadow-lg
                `}
              >
                {isFreeSpace ? (
                  <div className="text-xs font-extrabold">FREE</div>
                ) : (
                  <>
                    {cell.marked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-full bg-green-500/30 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                    <span className={cell.marked ? 'opacity-70' : ''}>{cell.number}</span>
                  </>
                )}
              </button>
            )
          })
        )}
      </div>

      {/* Pattern Indicators */}
      <div className="mt-3 flex justify-center gap-2">
        {[0, 1, 2, 3, 4].map((row) => {
          const isRowComplete = card[row].every(c => c.marked)
          return (
            <div
              key={`row-${row}`}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                isRowComplete
                  ? 'bg-green-500 scale-125'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              title={`Fila ${row + 1}`}
            />
          )
        })}
      </div>
    </div>
  )
}
