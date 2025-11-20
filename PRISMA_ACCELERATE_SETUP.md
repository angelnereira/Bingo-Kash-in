# 🚀 Configuración de Prisma Accelerate

## ⚠️ Requisito Importante

Para usar **Prisma Accelerate**, necesitas **DOS URLs de conexión**:

1. **URL de Accelerate** - Para queries en la aplicación (ya la tienes ✅)
2. **URL Directa de PostgreSQL** - Para ejecutar migraciones (necesitas proporcionarla ❌)

---

## 📋 Paso 1: Obtener la URL Directa de PostgreSQL

### Si usas Neon (Recomendado)

1. Ve a tu proyecto en [Neon Console](https://console.neon.tech)
2. En el dashboard, haz clic en **"Connection Details"**
3. Copia la **Connection String** que se ve así:

```
postgresql://usuario:contraseña@ep-xxxxx-xxxxx.region.aws.neon.tech/neondb?sslmode=require
```

### Si usas otra base de datos PostgreSQL

Tu URL debería tener este formato:

```
postgresql://usuario:contraseña@host:puerto/database?sslmode=require
```

---

## 📋 Paso 2: Actualizar el archivo .env

Una vez que tengas la URL directa, actualiza tu archivo `.env`:

```bash
# URL directa a PostgreSQL (para migraciones)
DIRECT_DATABASE_URL="postgresql://tu-usuario:tu-contraseña@tu-host:5432/tu-database?sslmode=require"

# URL de Prisma Accelerate (para queries en producción)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza181alBVMUFDekZFTlBOLXI2UHhtakci"
```

---

## 📋 Paso 3: Actualizar prisma/schema.prisma

Necesitamos modificar el datasource para usar ambas URLs:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

---

## 📋 Paso 4: Ejecutar Migraciones

Una vez configurado:

```bash
# Generar cliente de Prisma
npx prisma generate

# Pushear el schema a la base de datos
npx prisma db push

# O crear una migración
npx prisma migrate dev --name init
```

---

## 🔧 Configuración del Cliente Prisma con Accelerate

### Archivo: `lib/prisma.ts`

Para usar Prisma Accelerate en producción, actualiza tu cliente:

```typescript
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient().$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

### Instalar la extensión de Accelerate

```bash
npm install @prisma/extension-accelerate
```

---

## ✅ Verificación

Para verificar que todo funciona:

```bash
# 1. Verificar conexión a la base de datos
npx prisma db push

# 2. Abrir Prisma Studio
npx prisma studio

# 3. Probar una consulta
node -e "require('./lib/prisma').default.user.findMany().then(console.log)"
```

---

## 🎯 Estado Actual

### Lo que ya tienes:
- ✅ Schema de Prisma completo (32 modelos)
- ✅ URL de Prisma Accelerate
- ✅ Configuración de .env base

### Lo que necesitas:
- ❌ URL directa de PostgreSQL
- ❌ Actualizar schema.prisma con directUrl
- ❌ Instalar @prisma/extension-accelerate
- ❌ Ejecutar migraciones

---

## 📊 Resumen de los Modelos

Tu schema incluye **32 modelos**:

### Base (15 modelos)
- User, Wallet, Transaction
- BingoSession, GameRound, BingoCard
- SessionParticipant, ChatMessage, Follow
- SystemConfig

### Engagement (17 modelos nuevos)
- Promotion, LoyaltyReward, ReferralReward
- Achievement, UserAchievement
- Badge, UserBadge
- Challenge, UserChallenge
- Leaderboard, LeaderboardEntry
- Tournament, TournamentParticipant
- ThematicEvent, Jackpot

**Total de tablas que se crearán**: 32

---

## 🚨 Próximos Pasos INMEDIATOS

1. **Proporciona la URL directa de PostgreSQL**
2. Actualizaré el schema.prisma
3. Instalaré las dependencias necesarias
4. Ejecutaré las migraciones
5. Verificaré que todo funcione correctamente

---

## 💡 Preguntas Frecuentes

### ¿Por qué necesito dos URLs?

- **DATABASE_URL (Accelerate)**: Para queries rápidas con caché y connection pooling
- **DIRECT_DATABASE_URL**: Para operaciones de schema (migraciones, introspección)

### ¿Puedo usar solo la URL directa?

Sí, pero perderías los beneficios de Accelerate:
- Connection pooling
- Caché de queries
- Latencia reducida
- Mejor manejo de conexiones

### ¿Cómo obtengo Prisma Accelerate?

1. Ve a [Prisma Data Platform](https://console.prisma.io)
2. Crea un proyecto
3. Habilita Accelerate
4. Conecta tu base de datos PostgreSQL
5. Copia la URL de Accelerate

---

**¿Listo para continuar? Proporciona la URL directa de PostgreSQL y completaré la configuración.**
