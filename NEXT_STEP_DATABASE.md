# ⚠️ PASO FINAL: URL Directa de PostgreSQL

## ✅ Lo que ya está configurado

- ✅ URL de Prisma Accelerate actualizada en `.env`
- ✅ Schema de Prisma actualizado con `directUrl`
- ✅ Extensión de Accelerate instalada
- ✅ Cliente de Prisma generado
- ✅ `lib/prisma.ts` actualizado para usar Accelerate

---

## ❗ Lo que falta: URL Directa de PostgreSQL

Para ejecutar las migraciones y crear las **32 tablas** en tu base de datos, necesito la **URL directa de conexión a PostgreSQL**.

### ¿Por qué necesito esta URL?

Prisma Accelerate funciona como una capa de proxy/caché encima de tu base de datos PostgreSQL real. Para operaciones de schema (migraciones, introspección), Prisma necesita conectarse directamente a PostgreSQL, no a través de Accelerate.

```
Tu App → Prisma Accelerate (queries rápidas) → PostgreSQL
Migraciones → Conexión Directa → PostgreSQL
```

---

## 📍 Cómo obtener la URL Directa

### Opción 1: Si configuraste Accelerate en Prisma Data Platform

1. Ve a https://console.prisma.io
2. Selecciona tu proyecto
3. En la sección de "Database", busca **"Connection String"** o **"Direct Connection"**
4. Debería mostrarte algo como:
   ```
   postgresql://usuario:contraseña@xxx.xxx.region.provider.com:5432/database?sslmode=require
   ```

### Opción 2: Si usas Neon

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto/base de datos
3. En "Connection Details", copia la **Connection String**:
   ```
   postgresql://usuario:contraseña@ep-xxxxx.region.aws.neon.tech/neondb?sslmode=require
   ```

### Opción 3: Si usas Railway

1. Ve a https://railway.app/dashboard
2. Selecciona tu proyecto PostgreSQL
3. En la pestaña "Connect", copia **"Postgres Connection URL"**:
   ```
   postgresql://postgres:contraseña@xxxxx.railway.internal:5432/railway
   ```

### Opción 4: Si usas Supabase

1. Ve a tu proyecto en https://supabase.com/dashboard
2. Settings → Database
3. Copia **"Connection string"** (Connection Pooling deshabilitado)
4. O usa el formato directo:
   ```
   postgresql://postgres.[tu-ref]:[contraseña]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   ```

---

## 🔧 Formato de la URL

La URL directa debe tener este formato:

```
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[database]?[parámetros]
```

**Ejemplo real**:
```
postgresql://myuser:mypassword123@db.example.com:5432/production_db?sslmode=require
```

**Partes**:
- `usuario`: Tu usuario de PostgreSQL
- `contraseña`: Tu contraseña (puede contener caracteres especiales URL-encoded)
- `host`: El hostname del servidor
- `puerto`: Usualmente 5432
- `database`: Nombre de la base de datos
- `parámetros`: Opcionales como `sslmode=require`

---

## ⚡ Una vez que me proporciones la URL

Haré lo siguiente **automáticamente**:

1. Actualizaré `DIRECT_DATABASE_URL` en `.env`
2. Ejecutaré `npx prisma db push`
3. Se crearán las **32 tablas** en tu base de datos:

### Tablas que se crearán:

**Base del sistema (15)**:
- User, Wallet, Transaction
- BingoSession, GameRound, BingoCard
- SessionParticipant, ChatMessage, Follow
- SystemConfig

**Sistema de engagement (17)**:
- Promotion, LoyaltyReward, ReferralReward
- Achievement, UserAchievement
- Badge, UserBadge
- Challenge, UserChallenge
- Leaderboard, LeaderboardEntry
- Tournament, TournamentParticipant
- ThematicEvent, Jackpot

4. Verificaré que todo funciona correctamente
5. Commitearé los cambios
6. ¡Tu base de datos estará lista para usar!

---

## 🔒 Seguridad

- ✅ La URL directa solo se guarda en `.env` (que está en `.gitignore`)
- ✅ Nunca se commitea al repositorio
- ✅ Solo se usa para migraciones, no para queries de la app
- ✅ Las queries de la app usan Accelerate (más rápido y seguro)

---

## 📝 Ejemplo de cómo proporcionarla

Simplemente pégala en el chat:

```
postgresql://myuser:mypassword@host.provider.com:5432/mydb?sslmode=require
```

O si prefieres, indícame solo:
- El proveedor que usas (Neon, Railway, Supabase, etc.)
- Y te guiaré paso a paso para obtenerla

---

## ❓ Preguntas Frecuentes

**P: ¿Es seguro compartir esta URL?**
R: Sí, solo la usaré para configurar tu `.env` local. Nunca se commitea.

**P: ¿Puedo usar la misma URL para ambas?**
R: No se recomienda. Accelerate agrega caching y connection pooling. La directa es para migraciones.

**P: ¿Qué pasa si no tengo una base de datos aún?**
R: Puedes crear una gratis en:
- Neon: https://neon.tech (PostgreSQL serverless, gratis)
- Railway: https://railway.app (500 horas gratis/mes)
- Supabase: https://supabase.com (PostgreSQL + extras, gratis)

**P: ¿Cuánto tiempo toma la configuración?**
R: Una vez que tenga la URL, menos de 1 minuto para completar todo.

---

**👉 Por favor, proporciona la URL directa de PostgreSQL para continuar.**
