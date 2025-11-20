# 🔧 Configurar Rama por Defecto en GitHub

## ⚠️ Importante
La rama por defecto **NO puede configurarse desde git local**. Debe hacerse desde la interfaz web de GitHub.

---

## 📋 Instrucciones Paso a Paso

### Opción 1: Interfaz Web de GitHub (Recomendado)

#### Paso 1: Acceder a la Configuración del Repositorio
1. Ve a tu repositorio en GitHub:
   ```
   https://github.com/angelnereira/Bingo-Kash-in
   ```

2. Haz clic en **"Settings"** (Configuración) en la parte superior derecha del repositorio

#### Paso 2: Cambiar la Rama por Defecto
1. En el menú lateral izquierdo, haz clic en **"Branches"**

2. En la sección **"Default branch"**, verás la rama actual por defecto

3. Haz clic en el botón con dos flechas (⇄) o en **"Switch default branch"**

4. Selecciona la rama:
   ```
   claude/main-019zgqhDjwqV4EuCz2JaoEFL
   ```

5. Confirma haciendo clic en **"Update"**

6. GitHub te pedirá confirmación. Lee el mensaje y haz clic en **"I understand, update the default branch"**

#### Paso 3: Verificar
✅ La rama `claude/main-019zgqhDjwqV4EuCz2JaoEFL` ahora aparecerá como rama por defecto
✅ Todos los nuevos PRs se crearán contra esta rama automáticamente
✅ Los clones nuevos del repositorio usarán esta rama

---

### Opción 2: GitHub CLI (Alternativa)

Si tienes instalado GitHub CLI (`gh`):

```bash
gh repo set-default-branch claude/main-019zgqhDjwqV4EuCz2JaoEFL
```

---

## 🛡️ Configuración de Protección de Rama (Recomendado)

Después de establecer la rama por defecto, protégela:

### Paso 1: Ir a Branch Protection Rules
1. En **Settings** → **Branches**
2. En la sección **"Branch protection rules"**, haz clic en **"Add rule"**

### Paso 2: Configurar la Protección
1. En **"Branch name pattern"**, ingresa:
   ```
   claude/main-019zgqhDjwqV4EuCz2JaoEFL
   ```

2. **Opciones recomendadas a habilitar**:

   ✅ **Require a pull request before merging**
   - ✅ Require approvals: 1 (mínimo)
   - ✅ Dismiss stale pull request approvals when new commits are pushed

   ✅ **Require status checks to pass before merging**
   - ✅ Require branches to be up to date before merging

   ✅ **Require conversation resolution before merging**

   ✅ **Do not allow bypassing the above settings**

   ❌ **Do not allow force pushes** (IMPORTANTE)

   ❌ **Do not allow deletions** (IMPORTANTE)

3. Haz clic en **"Create"** o **"Save changes"**

---

## 📊 Estado Actual de las Ramas

### Rama Principal (Main)
```
Nombre: claude/main-019zgqhDjwqV4EuCz2JaoEFL
Commit: 97a9877
Estado: ✅ Lista para ser default
```

### Otras Ramas Activas
```
claude/code-review-019zgqhDjwqV4EuCz2JaoEFL  (mergeada)
claude/kash-in-bingo-app-01FoUqCgrhK8JzShYFK9cKxy  (mergeada)
```

---

## 🎯 Qué Cambia al Establecer como Default

### Antes
```bash
git clone https://github.com/angelnereira/Bingo-Kash-in.git
# Clona la rama que esté configurada como default actualmente
```

### Después
```bash
git clone https://github.com/angelnereira/Bingo-Kash-in.git
# Clonará claude/main-019zgqhDjwqV4EuCz2JaoEFL automáticamente
```

### Pull Requests
- **Antes**: PRs apuntan a la rama default anterior
- **Después**: Todos los PRs nuevos apuntarán a `claude/main-019zgqhDjwqV4EuCz2JaoEFL`

### Comparaciones
- **Antes**: GitHub compara contra la rama default anterior
- **Después**: Todas las comparaciones serán contra `claude/main-019zgqhDjwqV4EuCz2JaoEFL`

---

## ✅ Checklist de Verificación

Después de cambiar la rama por defecto:

- [ ] Verificar que `claude/main-019zgqhDjwqV4EuCz2JaoEFL` aparece como default en la página principal del repo
- [ ] Crear un PR de prueba y verificar que apunta a la rama correcta
- [ ] Verificar que los badges en README.md apuntan a la rama correcta
- [ ] Configurar protección de rama
- [ ] Actualizar webhooks de CI/CD si los hay
- [ ] Actualizar configuración de deployment (Vercel, etc.)
- [ ] Notificar al equipo del cambio

---

## 🔄 Actualizar Clones Locales Existentes

Si tu equipo ya tiene clones del repositorio:

```bash
# Actualizar referencias remotas
git fetch origin

# Cambiar a la nueva rama por defecto
git checkout claude/main-019zgqhDjwqV4EuCz2JaoEFL

# Actualizar
git pull origin claude/main-019zgqhDjwqV4EuCz2JaoEFL

# Configurar como upstream
git branch --set-upstream-to=origin/claude/main-019zgqhDjwqV4EuCz2JaoEFL
```

---

## 🚨 Importante: No Eliminar Ramas Antiguas Todavía

Mantén las otras ramas por un tiempo para:
- Permitir que el equipo migre sus PRs abiertos
- Conservar el historial completo
- Facilitar rollbacks si es necesario

Puedes eliminarlas después de 1-2 semanas cuando estés seguro de que todo funciona correctamente.

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas al configurar la rama por defecto:

1. **Verifica permisos**: Necesitas ser admin del repositorio
2. **Verifica que la rama existe**: La rama debe estar pusheada al remoto
3. **Contacta a GitHub Support** si encuentras errores

---

## 📚 Documentación Relacionada

- [BRANCHES_HISTORY.md](./BRANCHES_HISTORY.md) - Historia completa de ramas
- [README.md](./README.md) - Documentación principal
- [FEATURES_GUIDE.md](./FEATURES_GUIDE.md) - Guía de características

---

**¡Listo! Una vez configurada, tu rama main será la referencia principal del proyecto.** 🎉
