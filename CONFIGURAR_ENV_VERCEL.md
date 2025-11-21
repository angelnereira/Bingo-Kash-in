# 🔐 Configurar Variables de Entorno en Vercel

## ❌ Error Actual

```
PrismaClientInitializationError: error: Environment variable not found: DATABASE_URL.
```

**Causa:** Las variables de entorno NO están configuradas en Vercel.

---

## ✅ Solución (5 minutos)

### Paso 1: Ve a tu Proyecto en Vercel

1. Abre https://vercel.com/dashboard
2. Selecciona tu proyecto: **Bingo-Kash-in**
3. Click en **Settings**
4. Click en **Environment Variables** (menú lateral izquierdo)

---

### Paso 2: Agrega estas Variables (copia exactamente)

#### Variable 1: DATABASE_URL ⚠️ CRÍTICA

```
Name: DATABASE_URL

Value: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19sTFMxNjdNQzBTeWJMeE5uU1p4U0QiLCJhcGlfa2V5IjoiMDFLQUhFR0ZCTVY4Q1RCR0dXQ1hFWUEyWEUiLCJ0ZW5hbnRfaWQiOiJjMzFhMDBkOTg5MzQ5ZmRkOGFmZThiZmQwNDMxYzhkZjgzMTJhN2Q4ZWUwYjUzY2UxNjE0NTE1NjRhNWNjM2E2IiwiaW50ZXJuYWxfc2VjcmV0IjoiMmY5YThlZGQtOTQxOS00YjZjLWJmNmMtMjRkZTFmZWRmZjcyIn0.A1EYHdQ7gLBQM1_g40a-Hgi34X178Sm61Jxc2leVuW8

Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

Click **Save**

---

#### Variable 2: DIRECT_DATABASE_URL ⚠️ CRÍTICA

```
Name: DIRECT_DATABASE_URL

Value: postgres://c31a00d989349fdd8afe8bfd0431c8df8312a7d8ee0b53ce161451564a5cc3a6:sk_lLS167MC0SybLxNnSZxSD@db.prisma.io:5432/postgres?sslmode=require

Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

Click **Save**

---

#### Variable 3: NEXTAUTH_URL ⚠️ IMPORTANTE

```
Name: NEXTAUTH_URL

Value: https://TU-PROYECTO.vercel.app

Environments: ☑️ Production
```

⚠️ **Reemplaza `TU-PROYECTO.vercel.app` con tu dominio real de Vercel**

Para encontrar tu dominio:
- Ve a Deployments → Click en el deployment → Copia el dominio

Click **Save**

---

#### Variable 4: NEXTAUTH_SECRET ⚠️ IMPORTANTE

**Primero, genera el secret:**

Desde tu terminal:
```bash
openssl rand -base64 32
```

Copia el resultado, luego en Vercel:

```
Name: NEXTAUTH_SECRET

Value: [pega el resultado del comando anterior]

Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

Click **Save**

---

#### Variables 5-6: Platform Configuration

```
Name: PLATFORM_FEE_PERCENTAGE
Value: 20
Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

Click **Save**

```
Name: WITHDRAWAL_FEE_PERCENTAGE
Value: 2
Environments: ☑️ Production  ☑️ Preview  ☑️ Development
```

Click **Save**

---

### Paso 3: Redeploy

1. Ve a **Deployments**
2. Click en los **3 puntos (⋯)** del último deployment
3. Click **Redeploy**
4. ⚠️ **DESMARCA** "Use existing Build Cache"
5. Click **Redeploy**

**Tiempo estimado:** 2-3 minutos

---

## ✅ Resultado Esperado

Después del redeploy:

```
✓ Environment variables loaded from .env
✓ Prisma Client initialized successfully
✓ Creating an optimized production build
✓ Compiled successfully
✓ Generating static pages
✓ Deployment Ready

URL: https://tu-proyecto.vercel.app ✅
```

**La aplicación ahora cargará correctamente** (no más pantalla en blanco)

---

## 🔍 Verificar que Funcionó

### 1. Deployment Status
- Ve a Deployments en Vercel
- Status: **Ready** ✅ (verde)

### 2. Visita la Aplicación
```
https://tu-proyecto.vercel.app
```

Deberías ver:
- ✅ Página de inicio cargando
- ✅ Botones de "Iniciar Sesión" / "Registrarse"
- ✅ No más 404 o pantalla en blanco

### 3. Revisa los Logs
```bash
vercel logs --follow
```

No deberías ver:
- ❌ "Environment variable not found: DATABASE_URL"
- ❌ "PrismaClientInitializationError"

---

## 🐛 Si Sigue sin Funcionar

### Verificar Variables

1. Ve a Settings → Environment Variables
2. Verifica que **DATABASE_URL** esté configurada
3. Verifica que los valores NO tengan espacios o saltos de línea
4. Verifica que estén marcadas para "Production"

### Verificar Deployment

1. Ve a Deployments
2. Click en el último deployment
3. Ve a "Build Logs"
4. Busca errores

### Redeploy sin Caché

```bash
vercel --prod --force
```

O desde Dashboard:
- Deployments → Redeploy
- ☑️ **DESMARCA** "Use existing Build Cache"
- Click Redeploy

---

## 📋 Checklist Final

Después de configurar y redeploy:

- [ ] ✅ DATABASE_URL configurada en Vercel
- [ ] ✅ DIRECT_DATABASE_URL configurada en Vercel
- [ ] ✅ NEXTAUTH_URL configurada con dominio correcto
- [ ] ✅ NEXTAUTH_SECRET generado y configurado
- [ ] ✅ PLATFORM_FEE_PERCENTAGE = 20
- [ ] ✅ WITHDRAWAL_FEE_PERCENTAGE = 2
- [ ] ✅ Redeploy ejecutado sin caché
- [ ] ✅ Deployment status: Ready (verde)
- [ ] ✅ Aplicación carga en el navegador
- [ ] ✅ No hay errores en logs

---

## 📝 Variables Opcionales (Agregar Después)

Para funcionalidad completa, agrega también:

### Stripe (para pagos)
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Agora (para voz)
```
AGORA_APP_ID=tu-app-id
AGORA_APP_CERTIFICATE=tu-certificate
```

### Yappy (pagos Panamá)
```
YAPPY_API_KEY=tu-api-key
YAPPY_MERCHANT_ID=tu-merchant-id
```

---

## 🎯 Resumen

**Problema:** Variables de entorno no configuradas en Vercel
**Solución:** Agregar 6 variables en Settings → Environment Variables
**Tiempo:** 5 minutos
**Resultado:** Aplicación funcionando ✅

---

## 💡 Tips

### Copiar Variables desde tu .env Local

```bash
# Mostrar DATABASE_URL
grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"'

# Copiar al clipboard (macOS)
grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | pbcopy
```

### Verificar Variables Configuradas

Desde CLI:
```bash
vercel env ls
```

Deberías ver:
```
DATABASE_URL              Production, Preview, Development
DIRECT_DATABASE_URL       Production, Preview, Development
NEXTAUTH_URL              Production
NEXTAUTH_SECRET           Production, Preview, Development
PLATFORM_FEE_PERCENTAGE   Production, Preview, Development
WITHDRAWAL_FEE_PERCENTAGE Production, Preview, Development
```

---

**¡Una vez configuradas las variables y hecho el redeploy, tu aplicación funcionará perfectamente!** 🚀
