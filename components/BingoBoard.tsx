'use client'

import { formatBingoNumber } from '@/lib/bingo-utils'

interface BingoBoardProps {
  calledNumbers: number[]
  lastNumber?: number
}

export function BingoBoard({ calledNumbers, lastNumber }: BingoBoardProps) {
  // Crear grid de 75 números
  const allNumbers = Array.from({ length: 75 }, (_, i) => i + 1)
  const called = new Set(calledNumbers)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Tablero de Bingo</h3>
        {lastNumber && (
          <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-lg py-4 px-6">
            <p className="text-sm font-semibold mb-1">Último Número</p>
            <p className="text-5xl font-bold">{formatBingoNumber(lastNumber)}</p>
          </div>
        )}
      </div>

      {/* Grid por letras */}
      <div className="space-y-2">
        {['B', 'I', 'N', 'G', 'O'].map((letter, letterIndex) => (
          <div key={letter}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 text-white font-bold rounded flex items-center justify-center">
                {letter}
              </div>
              <div className="flex-1 grid grid-cols-15 gap-1">
                {allNumbers
                  .slice(letterIndex * 15, (letterIndex + 1) * 15)
                  .map((number) => (
                    <div
                      key={number}
                      className={`
                        w-8 h-8 rounded flex items-center justify-center text-sm font-semibold
                        ${called.has(number)
                          ? 'bg-accent-500 text-white'
                          : 'bg-gray-100 text-gray-400'
                        }
                      `}
                    >
                      {number}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-gray-600">
        <p className="text-sm">
          Números cantados: <span className="font-bold">{calledNumbers.length}</span> / 75
        </p>
      </div>
    </div>
  )
}
