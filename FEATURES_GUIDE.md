# 🎯 Guía de Nuevas Características - Kash-in

Este documento detalla todas las nuevas características implementadas en el sistema Kash-in.

## 📋 Índice

1. [Promociones y Precios](#promociones-y-precios)
2. [Programa de Lealtad](#programa-de-lealtad)
3. [Sistema de Referidos](#sistema-de-referidos)
4. [Gamificación](#gamificación)
5. [Leaderboards](#leaderboards)
6. [Desafíos](#desafíos)
7. [Torneos](#torneos)
8. [Eventos Temáticos](#eventos-temáticos)
9. [Jackpots Progresivos](#jackpots-progresivos)

---

## 🎁 Promociones y Precios

### Happy Hours

**Descripción**: Descuentos automáticos en horarios específicos del día.

**Características**:
- Configuración por días de la semana
- Horarios de inicio y fin personalizables
- Descuentos porcentuales
- Aplicable a tiers específicos

**Ejemplo de Uso**:
```typescript
await createHappyHour({
  title: "Happy Hour Vespertino",
  description: "20% de descuento de 5pm a 8pm",
  discountPercentage: 20,
  startTime: new Date('1970-01-01T17:00:00'),
  endTime: new Date('1970-01-01T20:00:00'),
  daysOfWeek: [1, 2, 3, 4, 5], // Lunes a Viernes
  applicableTiers: ['CASUAL', 'STANDARD']
})
```

**Base de Datos**:
- Tabla: `Promotion`
- Tipo: `HAPPY_HOUR`

---

### Combos Especiales

**Descripción**: Cartones bonus gratis al comprar cierta cantidad.

**Características**:
- Mínimo de cartones requeridos
- Cartones bonus otorgados
- Límite de usos por usuario
- Fechas de validez

**Ejemplo de Uso**:
```typescript
await createComboSpecial({
  title: "Compra 5 lleva 2 gratis",
  minCards: 5,
  bonusCards: 2,
  maxUses: 100,
  applicableTiers: ['PREMIUM']
})
```

**Flujo de Compra con Combo**:
1. Usuario selecciona 5 cartones
2. Sistema detecta combo activo
3. Usuario recibe 7 cartones (5 pagados + 2 bonus)
4. Se registra el uso de la promoción

---

## 🏅 Programa de Lealtad

### Puntos de Lealtad

**Cómo ganar puntos**:
- 1 punto por cada $1 gastado en cartones
- Puntos bonus por logros
- Puntos por completar desafíos
- Puntos por referidos exitosos

**Uso de Puntos**:
Los puntos se pueden canjear por:
- Descuentos en compras
- Cartones gratis
- Bonus de efectivo

**Base de Datos**:
- Campo `User.loyaltyPoints`
- Tabla `LoyaltyReward`

**Ejemplo**:
```typescript
// Otorgar puntos después de una compra
await awardLoyaltyPoints(
  userId,
  calculateLoyaltyPointsFromSpend(50), // 50 puntos por $50
  'Compra de cartones'
)

// Canjear recompensa
await redeemLoyaltyReward(userId, rewardId)
```

---

## 👥 Sistema de Referidos

### Códigos de Referido

Cada usuario obtiene un código único para compartir.

**Proceso**:
1. Usuario genera/obtiene su código de referido
2. Comparte el código con amigos
3. Amigo se registra con el código
4. Ambos reciben bonus:
   - **Referidor**: $5 USD
   - **Nuevo usuario**: $3 USD

**Configuración por defecto**:
```typescript
const REFERRAL_REWARDS = {
  referrer: 5.00,  // USD para quien refiere
  referred: 3.00   // USD para quien se registra
}
```

**API**:
```typescript
// Procesar referido
POST /api/loyalty/referral
{
  "referralCode": "ABC123XYZ",
  "newUserId": "user_id"
}
```

**Base de Datos**:
- Campo `User.referralCode`
- Campo `User.referredById`
- Tabla `ReferralReward`

---

## 🎮 Gamificación

### Sistema de Niveles

**Cálculo de Niveles**:
```
Nivel 1: 0 XP
Nivel 2: 100 XP
Nivel 3: 250 XP  (100 * 1.5²)
Nivel 4: 437 XP  (100 * 1.5³)
...y así sucesivamente
```

**Fuentes de XP**:
- Jugar una partida: 10 XP
- Ganar una partida: 50 XP
- Primer lugar: 100 XP
- Completar logros: Variable
- Completar desafíos: Variable

**Visualización**:
```typescript
const progress = getLevelProgress(experiencePoints)
// {
//   currentLevel: 5,
//   nextLevel: 6,
//   currentXP: 150,
//   xpForNextLevel: 437,
//   progressPercentage: 34
// }
```

---

### Sistema de Logros

**Categorías de Logros**:
- `GAMES_PLAYED`: Partidas jugadas
- `WINS`: Victorias
- `SPENDING`: Gasto acumulado
- `SOCIAL`: Interacción social
- `SPECIAL`: Logros especiales

**Logros Predefinidos**:

| Clave | Título | Requisito | Recompensa |
|-------|--------|-----------|------------|
| `first_game` | Primera Partida | Jugar 1 juego | 50 XP |
| `games_10` | Jugador Regular | Jugar 10 juegos | 100 XP + 10 puntos |
| `games_50` | Veterano | Jugar 50 juegos | 500 XP + 50 puntos |
| `first_win` | Primera Victoria | Ganar 1 juego | 100 XP |
| `wins_10` | Ganador Serial | Ganar 10 juegos | 200 XP + 25 puntos |
| `spend_100` | Gran Apostador | Gastar $100 | 150 XP + 20 puntos |

**Progreso de Logros**:
```typescript
// Sistema automático de tracking
await checkAchievementsForAction(userId, 'game_played')
// Actualiza progreso y completa logros automáticamente
```

---

### Sistema de Badges

**Raridades**:
- `COMMON`: Badges comunes
- `RARE`: Badges raros
- `EPIC`: Badges épicos
- `LEGENDARY`: Badges legendarios

**Badges Automáticos por Nivel**:
- Nivel 10: Badge "Principiante Avanzado"
- Nivel 25: Badge "Experto"
- Nivel 50: Badge "Maestro"
- Nivel 100: Badge "Leyenda"

**Badges Especiales**:
- Primer lugar en torneo
- Ganar jackpot
- Completar evento temático
- Racha de victorias
- Anfitrión destacado

---

## 🏆 Leaderboards

### Tipos de Leaderboards

**1. Leaderboard Semanal de Victorias**
```typescript
key: 'weekly_wins'
metric: 'wins'
period: 'WEEKLY'
```

**2. Leaderboard Mensual de Ganancias**
```typescript
key: 'monthly_earnings'
metric: 'earnings'
period: 'MONTHLY'
```

**3. Leaderboard de Todos los Tiempos**
```typescript
key: 'all_time_games'
metric: 'games_played'
period: 'ALL_TIME'
```

**Actualización Automática**:
```typescript
// Después de cada juego ganado
await updateLeaderboardEntry('weekly_wins', userId, 1, {
  sessionId,
  prizeWon: 50.00
})
```

**Rankings**:
Los rankings se recalculan automáticamente después de cada actualización para mantener el orden correcto.

---

## 🎯 Desafíos

### Tipos de Desafíos

**1. Desafíos Diarios**
- Duración: 24 horas
- Objetivos simples
- Recompensas rápidas

**2. Desafíos Semanales**
- Duración: 7 días
- Objetivos medianos
- Mejores recompensas

**3. Desafíos Mensuales**
- Duración: 30 días
- Objetivos grandes
- Recompensas premium

**Ejemplos de Desafíos**:

```javascript
// Desafío: Juega 5 partidas esta semana
{
  type: 'WEEKLY',
  title: 'Jugador Activo',
  description: 'Juega 5 partidas esta semana',
  requirement: {
    type: 'play_games',
    count: 5
  },
  rewardXP: 100,
  rewardPoints: 10,
  rewardCash: 2.00
}

// Desafío: Gana 3 veces
{
  type: 'WEEKLY',
  title: 'Triple Victoria',
  description: 'Gana 3 partidas esta semana',
  requirement: {
    type: 'win_games',
    count: 3
  },
  rewardXP: 250,
  rewardPoints: 25,
  rewardCash: 5.00
}
```

**Flujo de Desafío**:
1. Usuario ve desafíos activos
2. Sistema trackea progreso automáticamente
3. Al completar, desafío cambia a `COMPLETED`
4. Usuario reclama recompensas
5. Estado cambia a `CLAIMED`

---

## 🏅 Torneos

### Estructura de Torneo

**Fases del Torneo**:
1. `UPCOMING`: Anunciado pero no abierto
2. `REGISTRATION_OPEN`: Inscripciones abiertas
3. `IN_PROGRESS`: Torneo en curso
4. `COMPLETED`: Finalizado
5. `CANCELLED`: Cancelado

**Configuración Típica**:
```typescript
{
  title: "Torneo Fin de Semana",
  entryFee: 10.00,
  prizePool: 500.00,
  prizeDistribution: {
    "1": 50,  // 1er lugar: 50% ($250)
    "2": 30,  // 2do lugar: 30% ($150)
    "3": 20   // 3er lugar: 20% ($100)
  },
  maxParticipants: 100,
  tier: 'STANDARD'
}
```

**Proceso de Inscripción**:
1. Usuario paga entry fee
2. Se añade a la pool de premios
3. Se registra como participante
4. Juega sesiones del torneo
5. Se acumulan puntos/victorias
6. Al finalizar, se distribuyen premios

**Sistema de Puntos**:
- Victoria: +10 puntos
- Segundo lugar: +5 puntos
- Tercer lugar: +3 puntos
- Participación: +1 punto

---

## 🎄 Eventos Temáticos

### Eventos del Año

**Eventos Predefinidos**:

| Evento | Fechas | Multiplicador | Tema |
|--------|--------|---------------|------|
| Año Nuevo | 1-7 Enero | 1.5x | NEW_YEAR |
| San Valentín | 10-14 Febrero | 2.0x | VALENTINES |
| Pascua | 10-20 Abril | 1.3x | EASTER |
| Halloween | 25-31 Octubre | 1.8x | HALLOWEEN |
| Navidad | 15-31 Diciembre | 2.5x | CHRISTMAS |

**Bonificaciones**:
- Premios multiplicados
- Diseño temático especial
- Logros exclusivos del evento
- Badges limitados

**Aplicación Automática**:
```typescript
// Al calcular premios
const event = await isDateInThematicEvent(new Date())
const finalPrize = applyEventBonus(basePrize, event)
// Si es Navidad (2.5x): $100 → $250
```

---

## 💰 Jackpots Progresivos

### Funcionamiento

**Acumulación**:
- Cada venta de cartón contribuye X% al jackpot
- El jackpot crece con cada juego
- Múltiples sesiones pueden contribuir al mismo jackpot

**Ejemplo de Configuración**:
```typescript
{
  title: "Mega Jackpot",
  seedAmount: 100.00,        // Monto inicial
  contributionRate: 5.0,     // 5% de cada venta
  currentAmount: 100.00,     // Actualizado automáticamente
  winCondition: {
    type: "BLACKOUT",
    maxNumbers: 50            // Blackout en menos de 50 números
  }
}
```

**Condiciones de Victoria**:
- `BLACKOUT` + `maxNumbers`: Llenar cartón en X números o menos
- `X_PATTERN` + `maxNumbers`: Patrón X en Y números o menos
- `FULL_CARD` + `maxTime`: Cartón completo en Z segundos o menos

**Al Ganar el Jackpot**:
1. Sistema verifica la condición de victoria
2. Acredita el monto completo al ganador
3. Crea transacción tipo `PRIZE_WIN`
4. Notifica a todos los usuarios
5. Opcionalmente resetea el jackpot

**Visualización**:
```typescript
// Mostrar jackpot actual
const jackpots = await getActiveJackpots()
const biggest = await getLargestActiveJackpot()

// Estadísticas
const stats = await getJackpotStats(jackpotId)
// {
//   totalContributed: 450.50,
//   sessionsCount: 45,
//   avgContributionPerSession: 10.01
// }
```

---

## 🔧 Implementación Técnica

### Estructura de Base de Datos

**Nuevas Tablas**:
- `Promotion`: Promociones (Happy Hours, Combos)
- `LoyaltyReward`: Recompensas de lealtad
- `ReferralReward`: Tracking de referidos
- `Achievement`: Definición de logros
- `UserAchievement`: Progreso de logros por usuario
- `Badge`: Definición de badges
- `UserBadge`: Badges obtenidos
- `Challenge`: Desafíos
- `UserChallenge`: Progreso de desafíos
- `Leaderboard`: Configuración de leaderboards
- `LeaderboardEntry`: Entradas en leaderboards
- `Tournament`: Torneos
- `TournamentParticipant`: Participantes en torneos
- `ThematicEvent`: Eventos temáticos
- `Jackpot`: Jackpots progresivos

**Campos Añadidos a User**:
```prisma
level: Int @default(1)
experiencePoints: Int @default(0)
loyaltyPoints: Int @default(0)
hasClaimedWelcomeBonus: Boolean @default(false)
referralCode: String? @unique
referredById: String?
```

**Campos Añadidos a BingoSession**:
```prisma
isVipSession: Boolean @default(false)
thematicEventId: String?
tournamentId: String?
jackpotId: String?
```

---

### Utilidades Disponibles

**Archivos Creados**:
- `/lib/promotions-utils.ts`: Gestión de promociones
- `/lib/loyalty-utils.ts`: Sistema de lealtad y referidos
- `/lib/gamification-utils.ts`: Niveles, logros y badges
- `/lib/competitions-utils.ts`: Leaderboards, desafíos y torneos
- `/lib/events-utils.ts`: Eventos temáticos y jackpots

**Funciones Principales**:

```typescript
// Promociones
getActivePromotions(tier, type)
getBestPromotion(tier, cardPrice, cardsCount)
createHappyHour(data)
createComboSpecial(data)

// Lealtad
awardLoyaltyPoints(userId, points, reason)
redeemLoyaltyReward(userId, rewardId)
claimWelcomeBonus(userId, amount)

// Referidos
processReferral(newUserId, referralCode, rewards)
getReferralStats(userId)

// Gamificación
awardExperience(userId, xp, reason)
checkAndUpdateAchievement(userId, achievementKey)
awardBadge(userId, badgeKey)
getUserGamificationProfile(userId)

// Competencias
updateLeaderboardEntry(leaderboardKey, userId, score)
createWeeklyChallenge(data)
updateChallengeProgress(userId, challengeId)
createTournament(data)
registerForTournament(userId, tournamentId)

// Eventos
createThematicEvent(data)
getActiveThematicEvents()
createJackpot(data)
contributeToJackpot(jackpotId, cardPrice)
awardJackpot(jackpotId, winnerId, sessionId)
```

---

## 📊 Dashboard y Analytics

### Métricas para Jugadores

```typescript
interface PlayerStats {
  level: number
  experiencePoints: number
  loyaltyPoints: number
  achievementsCompleted: number
  badgesEarned: number
  challengesCompleted: number
  leaderboardRank: number
  tournamentsWon: number
  totalReferrals: number
  referralEarnings: number
}
```

### Métricas para Administradores

```typescript
interface AdminMetrics {
  activePromotions: number
  activeChallenges: number
  activeTournaments: number
  activeJackpots: number
  totalJackpotPool: number
  rewardsDistributed: number
  engagementRate: number
  retentionRate: number
}
```

---

## 🚀 Siguientes Pasos

### Implementación Pendiente

1. **APIs REST Completas**:
   - ✅ `/api/promotions` (parcial)
   - ⏳ `/api/loyalty/*`
   - ⏳ `/api/gamification/*`
   - ⏳ `/api/tournaments/*`
   - ⏳ `/api/events/*`
   - ⏳ `/api/jackpots/*`

2. **Componentes de UI**:
   - Tarjetas de promociones activas
   - Panel de gamificación del usuario
   - Visualización de leaderboards
   - Listado de desafíos con progreso
   - Card de torneo con inscripción
   - Banner de evento temático
   - Display de jackpot con contador

3. **Integraciones**:
   - Notificaciones push cuando se completa un logro
   - Notificaciones cuando se gana un desafío
   - Alertas de jackpot ganado
   - Recordatorios de torneos próximos

4. **Testing**:
   - Tests unitarios para utils
   - Tests de integración para APIs
   - Tests E2E para flujos completos

---

## 📖 Ejemplos de Uso Completo

### Ejemplo 1: Usuario Nuevo con Referido

```typescript
// 1. Nuevo usuario se registra con código
const user = await register({
  email: 'nuevo@email.com',
  password: 'password',
  referralCode: 'ABC123XYZ' // Código de amigo
})

// 2. Sistema procesa referido automáticamente
const referralResult = await processReferral(
  user.id,
  'ABC123XYZ',
  { referrer: 5.00, referred: 3.00 }
)
// Ambos reciben bonos en sus wallets

// 3. Usuario reclama bonus de bienvenida
await claimWelcomeBonus(user.id, 5.00)
// +$5 adicionales

// Total: $8 para empezar a jugar
```

### Ejemplo 2: Usuario Compra Cartones con Promoción

```typescript
// 1. Usuario quiere comprar 5 cartones en tier STANDARD
const tier = 'STANDARD'
const cardPrice = 2.99
const cardsCount = 5

// 2. Sistema verifica mejor promoción
const bestDeal = await getBestPromotion(tier, cardPrice, cardsCount)

if (bestDeal) {
  // Happy Hour activa: 20% descuento
  // Precio original: $14.95
  // Precio con descuento: $11.96
  // Ahorro: $2.99

  // O Combo activo: Compra 5 lleva 1 gratis
  // Paga 5, recibe 6 cartones
}

// 3. Usuario completa compra
// - Gana 15 puntos de lealtad ($15 gastados)
// - Gana 5 XP (compra de cartones)
// - Progreso en logro "Comprador Frecuente"
```

### Ejemplo 3: Usuario Juega y Gana

```typescript
// 1. Usuario juega una partida
await awardExperience(userId, 10, 'Juego completado')

// 2. Usuario gana la partida
await awardExperience(userId, 50, 'Victoria')
await updateLeaderboardEntry('weekly_wins', userId, 1)

// 3. Sistema verifica logros
const achievements = await checkAchievementsForAction(userId, 'game_won')
// Completó "Primera Victoria" → +100 XP, Badge especial

// 4. Actualiza desafíos
await updateChallengeProgress(userId, weeklyWinsChallenge.id)
// Progreso: 3/5 victorias

// 5. Usuario sube de nivel
const { leveledUp, newLevel } = await awardExperience(userId, 100, 'Bonus')
if (leveledUp) {
  // ¡Subiste a nivel 5!
  // Desbloqueaste nuevas recompensas
}
```

---

## 💡 Tips para Desarrolladores

1. **Siempre usa transacciones** para operaciones financieras
2. **Trackea métricas** en cada acción importante
3. **Valida condiciones** antes de otorgar recompensas
4. **Notifica al usuario** de logros y recompensas
5. **Cache resultados** de leaderboards y jackpots
6. **Actualiza rankings** de forma asíncrona cuando sea posible

---

## 🔒 Consideraciones de Seguridad

1. **Validación de recompensas**: Verificar que el usuario realmente cumplió los requisitos
2. **Rate limiting**: Prevenir abuse de promociones y referidos
3. **Transacciones atómicas**: Nunca acreditar fondos sin validación completa
4. **Auditoría**: Registrar todas las acciones de recompensas
5. **Prevención de fraude**: Detectar patrones sospechosos en referidos

---

**¡Todas las características están listas para ser usadas! 🎉**
