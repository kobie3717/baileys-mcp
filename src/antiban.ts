/**
 * Optional baileys-antiban loader
 * Gracefully handles missing peer dependency
 */

let antibanModule: any = null

export async function loadAntiban(): Promise<boolean> {
  if (antibanModule) return true

  try {
    // @ts-ignore - optional peer dependency
    antibanModule = await import('baileys-antiban')
    return true
  } catch (error) {
    console.warn('baileys-antiban not installed (optional)')
    return false
  }
}

export function getAntiban(): any {
  return antibanModule
}

export function isAntibanLoaded(): boolean {
  return antibanModule !== null
}
