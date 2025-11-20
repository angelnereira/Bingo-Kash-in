#!/bin/bash

# Script para consolidar todas las ramas en main y eliminar las demás
# Ejecuta este script desde tu computadora local

set -e  # Exit on error

echo "🔄 Consolidando todo en la rama main..."
echo ""

# 1. Asegurar que estamos en el directorio correcto
if [ ! -d ".git" ]; then
    echo "❌ Error: No estás en un repositorio git"
    echo "   Ejecuta este script desde la raíz del proyecto Bingo-Kash-in"
    exit 1
fi

# 2. Fetch todas las ramas
echo "📥 Descargando todas las ramas del remoto..."
git fetch origin

# 3. Checkout a main
echo "🔀 Cambiando a la rama main..."
git checkout main

# 4. Mergear claude/main si existe
echo "🔀 Mergeando todos los cambios de claude/main..."
if git show-ref --verify --quiet refs/remotes/origin/claude/main-019zgqhDjwqV4EuCz2JaoEFL; then
    git merge origin/claude/main-019zgqhDjwqV4EuCz2JaoEFL --no-ff -m "Merge: Consolidar todo el código en main

- Sistema completo de Bingo con 32 modelos de BD
- Engagement: Promociones, lealtad, referidos
- Gamificación: Niveles, logros, badges, challenges
- Competencias: Torneos, eventos, jackpots
- Prisma Accelerate 5.22.0 configurado
- Documentación completa (10 archivos)
- Listo para deployment en Vercel"
else
    echo "⚠️  Rama claude/main no encontrada, continuando..."
fi

# 5. Push a main
echo "⬆️  Pusheando main al remoto..."
git push origin main

echo ""
echo "✅ Rama main actualizada exitosamente!"
echo ""

# 6. Eliminar ramas remotas de Claude
echo "🗑️  Eliminando ramas remotas innecesarias..."

# Lista de ramas a eliminar
branches_to_delete=(
    "claude/main-019zgqhDjwqV4EuCz2JaoEFL"
    "claude/code-review-019zgqhDjwqV4EuCz2JaoEFL"
    "claude/kash-in-bingo-app-01FoUqCgrhK8JzShYFK9cKxy"
)

for branch in "${branches_to_delete[@]}"; do
    if git show-ref --verify --quiet refs/remotes/origin/$branch; then
        echo "   Eliminando origin/$branch..."
        git push origin --delete $branch 2>/dev/null || echo "   ⚠️  No se pudo eliminar $branch (puede que no exista)"
    fi
done

# 7. Eliminar ramas locales de Claude
echo "🗑️  Limpiando ramas locales..."
for branch in "${branches_to_delete[@]}"; do
    if git show-ref --verify --quiet refs/heads/$branch; then
        echo "   Eliminando rama local $branch..."
        git branch -D $branch 2>/dev/null || echo "   ⚠️  No se pudo eliminar rama local"
    fi
done

# 8. Limpiar referencias remotas obsoletas
echo "🧹 Limpiando referencias obsoletas..."
git remote prune origin

# 9. Verificar el estado final
echo ""
echo "📊 Estado final del repositorio:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Ramas remotas:"
git branch -r
echo ""
echo "Ramas locales:"
git branch
echo ""

# 10. Verificar que estamos en main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  Advertencia: No estás en la rama main"
    git checkout main
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ ¡Consolidación completada exitosamente!"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verifica que main tiene todo el código actualizado"
echo "   2. Configura Vercel para deployar desde 'main'"
echo "   3. Ejecuta: npm install && npm run prisma:push"
echo "   4. Deploy a Vercel con: vercel --prod"
echo ""
echo "🚀 Tu repositorio ahora tiene solo la rama main con todo el código!"
echo ""
