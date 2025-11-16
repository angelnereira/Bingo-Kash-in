/**
 * Genera un token de Agora para streaming de voz
 * Nota: Esta es una implementación simplificada.
 * En producción, instalar el paquete 'agora-access-token' y usar RtcTokenBuilder
 */
export function generateAgoraToken(
  channelName: string,
  userId: string,
  role: 'host' | 'audience' = 'audience'
): string {
  const appId = process.env.AGORA_APP_ID
  const appCertificate = process.env.AGORA_APP_CERTIFICATE

  if (!appId || !appCertificate) {
    // En desarrollo, retornar un token dummy
    console.warn('Agora credentials not configured, using dummy token')
    return `agora_token_${channelName}_${userId}_${role}`
  }

  // TODO: Implementar generación real de token con agora-access-token
  // Por ahora retornamos un token dummy
  return `agora_token_${channelName}_${userId}_${role}`
}

/**
 * Función hash simple para convertir string a número
 */
function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash
}

/**
 * Genera un nombre de canal único para una sesión
 */
export function generateChannelName(sessionId: string): string {
  return `bingo_${sessionId}_${Date.now()}`
}
