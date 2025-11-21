# 🔧 Solución: Error de DATABASE_URL en Vercel

## ❌ Error Actual

```
Environment Variable "DATABASE_URL" references Secret "database-url", which does not exist.
```

## ✅ Solución: Configurar Variables de Entorno Correctamente

### Opción 1: Desde Vercel Dashboard (Recomendado)

1. **Ve a tu proyecto en Vercel:**
   - https://vercel.com/dashboard
   - Selecciona tu proyecto `Bingo-Kash-in`

2. **Ve a Settings → Environment Variables**

3. **Agrega estas variables una por una:**

#### Variable 1: DATABASE_URL
```
Name: DATABASE_URL
Value: prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19sTFMxNjdNQzBTeWJMeE5uU1p4U0QiLCJhcGlfa2V5IjoiMDFLQUhFR0ZCTVY4Q1RCR0dXQ1hFWUEyWEUiLCJ0ZW5hbnRfaWQiOiJjMzFhMDBkOTg5MzQ5ZmRkOGFmZThiZmQwNDMxYzhkZjgzMTJhN2Q4ZWUwYjUzY2UxNjE0NTE1NjRhNWNjM2E2IiwiaW50ZXJuYWxfc2VjcmV0IjoiMmY5YThlZGQtOTQxOS00YjZjLWJmNmMtMjRkZTFmZWRmZjcyIn0.A1EYHdQ7gLBQM1_g40a-Hgi34X178Sm61Jxc2leVuW8

Environment: Production, Preview, Development (selecciona todos)
```

#### Variable 2: DIRECT_DATABASE_URL
```
Name: DIRECT_DATABASE_URL
Value: postgres://c31a00d989349fdd8afe8bfd0431c8df8312a7d8ee0b53ce161451564a5cc3a6:sk_lLS167MC0SybLxNnSZxSD@db.prisma.io:5432/postgres?sslmode=require

Environment: Production, Preview, Development (selecciona todos)
```

#### Variable 3: NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://tu-proyecto.vercel.app

Environment: Production
```
⚠️ Reemplaza `tu-proyecto.vercel.app` con tu dominio real de Vercel

#### Variable 4: NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: [Genera uno nuevo con: openssl rand -base64 32]

Environment: Production, Preview, Development (selecciona todos)
```

Para generar el secret:
```bash
openssl rand -base64 32
```

#### Variables 5-7: Platform Configuration
```
Name: PLATFORM_FEE_PERCENTAGE
Value: 20
Environment: Production, Preview, Development

Name: WITHDRAWAL_FEE_PERCENTAGE
Value: 2
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_SOCKET_URL
Value: https://tu-proyecto.vercel.app
Environment: Production
```

4. **Guarda cada variable haciendo click en "Save"**

5. **Redeploy el proyecto:**
   - Ve a Deployments
   - Click en los 3 puntos del último deployment
   - Click "Redeploy"

---

### Opción 2: Desde Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Link al proyecto
vercel link

# 4. Agregar variables de entorno
vercel env add DATABASE_URL production
# Pega el valor cuando te lo pida:
# prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGci...

vercel env add DIRECT_DATABASE_URL production
# Pega: postgres://c31a00d989349fdd8afe8bfd0431c8df...

vercel env add NEXTAUTH_URL production
# Pega: https://tu-proyecto.vercel.app

vercel env add NEXTAUTH_SECRET production
# Pega el resultado de: openssl rand -base64 32

vercel env add PLATFORM_FEE_PERCENTAGE production
# Pega: 20

vercel env add WITHDRAWAL_FEE_PERCENTAGE production
# Pega: 2

# 5. Deploy
vercel --prod
```

---

### Opción 3: Crear archivo vercel.json (No Recomendado para Secrets)

⚠️ **NO uses esta opción para DATABASE_URL** ya que expondrías tus credenciales.

Solo úsala para variables públicas:

```json
{
  "env": {
    "PLATFORM_FEE_PERCENTAGE": "20",
    "WITHDRAWAL_FEE_PERCENTAGE": "2"
  }
}
```

---

## 🔍 Verificar Variables de Entorno

### En Vercel Dashboard

1. Ve a Settings → Environment Variables
2. Deberías ver todas las variables listadas
3. Verifica que no haya referencias a "Secrets" (el problema original)

### En el Deployment

1. Ve a tu último deployment
2. Click en "Runtime Logs"
3. Busca: "Environment variables loaded"
4. No deberías ver errores de variables faltantes

---

## 🚀 Comando Completo para Configurar Todo

Copia y pega este script en tu terminal (reemplaza los valores):

```bash
# Generar NEXTAUTH_SECRET
export NEXTAUTH_SECRET=$(openssl rand -base64 32)
echo "Tu NEXTAUTH_SECRET es: $NEXTAUTH_SECRET"

# Agregar variables a Vercel
vercel env add DATABASE_URL production <<< "prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19sTFMxNjdNQzBTeWJMeE5uU1p4U0QiLCJhcGlfa2V5IjoiMDFLQUhFR0ZCTVY4Q1RCR0dXQ1hFWUEyWEUiLCJ0ZW5hbnRfaWQiOiJjMzFhMDBkOTg5MzQ5ZmRkOGFmZThiZmQwNDMxYzhkZjgzMTJhN2Q4ZWUwYjUzY2UxNjE0NTE1NjRhNWNjM2E2IiwiaW50ZXJuYWxfc2VjcmV0IjoiMmY5YThlZGQtOTQxOS00YjZjLWJmNmMtMjRkZTFmZWRmZjcyIn0.A1EYHdQ7gLBQM1_g40a-Hgi34X178Sm61Jxc2leVuW8"

vercel env add DIRECT_DATABASE_URL production <<< "postgres://c31a00d989349fdd8afe8bfd0431c8df8312a7d8ee0b53ce161451564a5cc3a6:sk_lLS167MC0SybLxNnSZxSD@db.prisma.io:5432/postgres?sslmode=require"

vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"

vercel env add PLATFORM_FEE_PERCENTAGE production <<< "20"

vercel env add WITHDRAWAL_FEE_PERCENTAGE production <<< "2"

# Deploy
vercel --prod
```

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: "Secret database-url does not exist"
**Causa:** Vercel está buscando un Secret en lugar de una variable de entorno normal
**Solución:** No uses Secrets. Usa Environment Variables directamente (Opción 1)

### Error 2: "DATABASE_URL is not defined"
**Causa:** La variable no está configurada o no está disponible en el entorno correcto
**Solución:** Asegúrate de seleccionar "Production, Preview, Development" al crear la variable

### Error 3: "Failed to connect to database"
**Causa:** La URL de Prisma Accelerate es incorrecta o expiró
**Solución:** Verifica que copiaste la URL completa sin espacios ni saltos de línea

### Error 4: "Build failed: Cannot generate Prisma Client"
**Causa:** Prisma no puede acceder a DATABASE_URL durante el build
**Solución:** Verifica que DATABASE_URL esté configurada para "Production" y "Preview"

---

## 📋 Checklist de Variables Requeridas

Antes de deployar, verifica que tengas configuradas:

- [ ] `DATABASE_URL` - URL de Prisma Accelerate
- [ ] `DIRECT_DATABASE_URL` - URL de PostgreSQL directo
- [ ] `NEXTAUTH_URL` - Tu dominio de Vercel (https://tu-proyecto.vercel.app)
- [ ] `NEXTAUTH_SECRET` - Secret generado con openssl
- [ ] `PLATFORM_FEE_PERCENTAGE` - 20
- [ ] `WITHDRAWAL_FEE_PERCENTAGE` - 2
- [ ] `NEXT_PUBLIC_SOCKET_URL` - Tu dominio de Vercel

Opcionales (puedes agregarlas después):
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `AGORA_APP_ID`
- [ ] `AGORA_APP_CERTIFICATE`
- [ ] `YAPPY_API_KEY`
- [ ] `YAPPY_MERCHANT_ID`

---

## 🎯 Después de Configurar

1. **Redeploy:**
   ```bash
   vercel --prod
   ```

2. **Verifica que el deployment fue exitoso:**
   - No debería haber errores de variables faltantes
   - El build debería completarse

3. **Prueba tu aplicación:**
   - Visita tu URL de Vercel
   - Verifica que pueda conectarse a la base de datos

---

## 💡 Tip: Copiar Variables desde .env Local

Para evitar errores al copiar, puedes usar este comando:

```bash
# Mostrar el valor de DATABASE_URL de tu .env
grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"'

# Copiar al clipboard (en macOS)
grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | pbcopy

# Copiar al clipboard (en Linux con xclip)
grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | xclip -selection clipboard
```

---

**¡Una vez configuradas las variables, tu deployment funcionará correctamente!** 🚀
