# 🚀 Guía de Uso de Prisma Accelerate

Esta guía explica cómo usar Prisma Accelerate en tu aplicación Kash-in para obtener máximo rendimiento.

---

## ✅ Configuración Completada

### 1. Cliente Prisma Configurado

**Archivo**: `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient().$extends(withAccelerate())
```

✅ Usando `@prisma/client/edge` para compatibilidad con Vercel Edge Runtime
✅ Extensión `withAccelerate()` aplicada
✅ Optimizado para entornos serverless

### 2. Scripts NPM Actualizados

```json
{
  "prisma:generate": "prisma generate --no-engine",
  "prisma:generate:dev": "prisma generate",
  "prisma:push": "prisma db push",
  "build": "prisma generate --no-engine && next build"
}
```

---

## 🎯 Cómo Usar el Caché

### Sintaxis Básica

```typescript
const users = await prisma.user.findMany({
  where: { isActive: true },
  cacheStrategy: {
    ttl: 60,  // Tiempo en segundos
    swr: 30   // Stale-While-Revalidate (opcional)
  }
})
```

### Parámetros de Caché

| Parámetro | Descripción | Valor |
|-----------|-------------|-------|
| `ttl` | Time-to-live en segundos | `60` = 1 minuto |
| `swr` | Stale-while-revalidate | `30` = 30 segundos |
| `tags` | Tags para invalidación | `['users', 'active']` |

---

## 📋 Ejemplos por Caso de Uso

### 1. Datos de Usuario (Caché Corto)

```typescript
// lib/user-queries.ts
import prisma from './prisma'

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      achievements: true,
      badges: true
    },
    cacheStrategy: {
      ttl: 60,      // 1 minuto
      swr: 30,      // Actualizar en background después de 30s
      tags: [`user:${userId}`]
    }
  })
}
```

### 2. Sesiones Activas (Caché Muy Corto)

```typescript
// lib/session-queries.ts
import prisma from './prisma'

export async function getActiveSessions() {
  return await prisma.bingoSession.findMany({
    where: {
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] }
    },
    include: {
      host: {
        select: { id: true, name: true, username: true }
      },
      _count: {
        select: { participants: true }
      }
    },
    cacheStrategy: {
      ttl: 10,      // 10 segundos (datos en tiempo real)
      swr: 5,
      tags: ['sessions:active']
    }
  })
}
```

### 3. Leaderboards (Caché Medio)

```typescript
// lib/leaderboard-queries.ts
import prisma from './prisma'

export async function getWeeklyLeaderboard() {
  return await prisma.leaderboardEntry.findMany({
    where: {
      leaderboard: { key: 'weekly_wins' }
    },
    include: {
      user: {
        select: { id: true, name: true, level: true }
      }
    },
    orderBy: { rank: 'asc' },
    take: 100,
    cacheStrategy: {
      ttl: 300,     // 5 minutos
      swr: 60,
      tags: ['leaderboard:weekly']
    }
  })
}
```

### 4. Promociones Activas (Caché Largo)

```typescript
// lib/promotion-queries.ts
import prisma from './prisma'
import { SessionTier } from '@prisma/client'

export async function getActivePromotions(tier: SessionTier) {
  const now = new Date()

  return await prisma.promotion.findMany({
    where: {
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
    },
    cacheStrategy: {
      ttl: 600,     // 10 minutos
      swr: 300,
      tags: ['promotions', `promotions:${tier}`]
    }
  })
}
```

### 5. Configuración del Sistema (Caché Muy Largo)

```typescript
// lib/config-queries.ts
import prisma from './prisma'

export async function getSystemConfig(key: string) {
  return await prisma.systemConfig.findUnique({
    where: { key },
    cacheStrategy: {
      ttl: 3600,    // 1 hora
      swr: 1800,
      tags: ['config', `config:${key}`]
    }
  })
}
```

### 6. Estadísticas de Gamificación (Caché Medio)

```typescript
// lib/gamification-queries.ts
import prisma from './prisma'

export async function getUserAchievements(userId: string) {
  return await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true
    },
    cacheStrategy: {
      ttl: 120,     // 2 minutos
      swr: 60,
      tags: [`achievements:${userId}`]
    }
  })
}

export async function getUserBadges(userId: string) {
  return await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true
    },
    orderBy: { earnedAt: 'desc' },
    cacheStrategy: {
      ttl: 300,     // 5 minutos
      swr: 120,
      tags: [`badges:${userId}`]
    }
  })
}
```

---

## 🔄 Invalidación de Caché

### Manual (cuando actualizas datos)

```typescript
// Después de actualizar un usuario
await prisma.user.update({
  where: { id: userId },
  data: { name: 'Nuevo Nombre' }
})

// NO hay invalidación automática, pero con swr se actualiza
// en background en la próxima consulta
```

### Estrategia de Invalidación

Usa diferentes TTL según la volatilidad de los datos:

| Tipo de Dato | TTL Recomendado | Uso |
|--------------|-----------------|-----|
| Tiempo real (chat, juego activo) | 5-10s | Sin caché |
| Dinámico (sesiones, participantes) | 10-30s | Caché muy corto |
| Semi-estático (usuarios, logros) | 1-5 min | Caché corto |
| Estático (promociones, config) | 10-60 min | Caché largo |

---

## ⚡ Optimizaciones Adicionales

### 1. Queries Compuestas

```typescript
export async function getSessionWithDetails(sessionId: string) {
  // Una sola query con múltiples includes
  return await prisma.bingoSession.findUnique({
    where: { id: sessionId },
    include: {
      host: true,
      participants: {
        include: { user: true },
        take: 100
      },
      rounds: true,
      _count: {
        select: {
          cards: true,
          chatMessages: true
        }
      }
    },
    cacheStrategy: {
      ttl: 30,
      swr: 15,
      tags: [`session:${sessionId}`]
    }
  })
}
```

### 2. Paginación con Caché

```typescript
export async function getTransactionsPaginated(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit

  return await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
    cacheStrategy: {
      ttl: 60,
      tags: [`transactions:${userId}:page:${page}`]
    }
  })
}
```

### 3. Agregaciones con Caché

```typescript
export async function getUserStats(userId: string) {
  const [totalGames, totalWins, totalSpent] = await Promise.all([
    prisma.sessionParticipant.count({
      where: { userId },
      cacheStrategy: { ttl: 300, tags: [`stats:${userId}:games`] }
    }),
    prisma.bingoCard.count({
      where: { userId, isWinner: true },
      cacheStrategy: { ttl: 300, tags: [`stats:${userId}:wins`] }
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'CARD_PURCHASE' },
      _sum: { amount: true },
      cacheStrategy: { ttl: 300, tags: [`stats:${userId}:spent`] }
    })
  ])

  return {
    totalGames,
    totalWins,
    totalSpent: totalSpent._sum.amount || 0,
    winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 0
  }
}
```

---

## 📊 Monitoreo y Insights

### Ver Estadísticas de Caché

1. Ve a https://console.prisma.io
2. Selecciona tu proyecto
3. Ve a la pestaña "Insights"
4. Visualiza:
   - Hit rate del caché
   - Latencia de queries
   - Queries más lentas
   - Uso de caché por query

### Métricas Importantes

- **Cache Hit Rate**: > 70% es bueno
- **P50 Latency**: < 50ms es excelente
- **P95 Latency**: < 200ms es bueno
- **Queries/second**: Depende de tu tráfico

---

## 🔧 Setup Local vs Producción

### Desarrollo Local

```bash
# Usa el cliente con engine completo
npm run prisma:generate:dev

# Ejecuta sin Accelerate (más fácil debugging)
npm run dev
```

### Producción (Vercel)

```bash
# Genera cliente sin engine (más ligero)
npm run prisma:generate

# O automáticamente en build
npm run build
```

### Variables de Entorno

**Local** (`.env.local`):
```env
# Usar URL directa para desarrollo
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres"
```

**Producción** (Vercel Environment Variables):
```env
# Usar Accelerate para producción
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=..."
DIRECT_DATABASE_URL="postgres://...@db.prisma.io:5432/postgres"
```

---

## 🚀 Comandos Útiles

```bash
# Generar cliente (serverless)
npm run prisma:generate

# Generar cliente (desarrollo local)
npm run prisma:generate:dev

# Pushear schema a BD
npm run prisma:push

# Ver BD en navegador
npm run prisma:studio

# Deploy migrations
npm run prisma:deploy

# Build para producción
npm run build
```

---

## ⚠️ Limitaciones y Consideraciones

### Lo que NO cachear:

1. **Transacciones financieras** - Siempre datos frescos
2. **Operaciones de escritura** - No se cachean por defecto
3. **Datos sensibles** - Evitar caché excesivo
4. **Juego en tiempo real** - TTL muy bajo o sin caché

### Ejemplo de Query SIN Caché:

```typescript
// Para operaciones críticas
const balance = await prisma.wallet.findUnique({
  where: { userId }
  // Sin cacheStrategy = Sin caché
})
```

---

## 📚 Referencias

- [Prisma Accelerate Docs](https://www.prisma.io/docs/accelerate)
- [Caching Strategies](https://www.prisma.io/docs/accelerate/caching)
- [Best Practices](https://www.prisma.io/docs/accelerate/best-practices)

---

## ✅ Checklist de Implementación

- [x] Cliente Prisma configurado con `/edge`
- [x] Extensión `withAccelerate()` aplicada
- [x] Scripts NPM actualizados
- [x] Ejemplos de queries con caché
- [ ] Implementar queries con caché en tu código
- [ ] Monitorear métricas en Prisma Console
- [ ] Ajustar TTLs según comportamiento real

---

**🎉 ¡Todo listo para usar Prisma Accelerate con máximo rendimiento!**
