/**
 * Parse bid amounts from South African auction text
 * Handles formats: R500, r500, 500 rand, 5K, R 1,200.50
 */

export interface ParseBidResult {
  amount: number | null
  currency: string
  confidence: 'high' | 'medium' | 'low'
}

export function parseBid(text: string, currencyHint: string = 'ZAR'): ParseBidResult {
  if (!text || typeof text !== 'string') {
    return { amount: null, currency: currencyHint, confidence: 'low' }
  }

  const normalized = text.toLowerCase().trim()

  // High confidence: R prefix with clear number
  // R500, R 500, R1,200.50, r250
  const rPattern = /\br\s*([0-9,]+(?:\.[0-9]{1,2})?)/i
  const rMatch = normalized.match(rPattern)
  if (rMatch) {
    const amount = parseFloat(rMatch[1].replace(/,/g, ''))
    if (!isNaN(amount) && amount > 0) {
      return { amount, currency: currencyHint, confidence: 'high' }
    }
  }

  // Medium confidence: number + rand/rands
  // 500 rand, 1200 rands, 250rand
  const randPattern = /([0-9,]+(?:\.[0-9]{1,2})?)\s*rands?/i
  const randMatch = normalized.match(randPattern)
  if (randMatch) {
    const amount = parseFloat(randMatch[1].replace(/,/g, ''))
    if (!isNaN(amount) && amount > 0) {
      return { amount, currency: currencyHint, confidence: 'medium' }
    }
  }

  // Medium confidence: number + K (thousands)
  // 5K, 10k, 2.5K
  const kPattern = /([0-9]+(?:\.[0-9]{1,2})?)\s*k/i
  const kMatch = normalized.match(kPattern)
  if (kMatch) {
    const amount = parseFloat(kMatch[1]) * 1000
    if (!isNaN(amount) && amount > 0) {
      return { amount, currency: currencyHint, confidence: 'medium' }
    }
  }

  // Low confidence: standalone number (could be anything)
  // Only if it's a clear standalone number in the text
  // Use negative lookahead to avoid matching numbers followed by K/rand/etc
  const standalonePattern = /\b([0-9,]+(?:\.[0-9]{1,2})?)\b(?!\s*k)(?!\s*rand)/i
  const standaloneMatch = normalized.match(standalonePattern)
  if (standaloneMatch) {
    const amount = parseFloat(standaloneMatch[1].replace(/,/g, ''))
    if (!isNaN(amount) && amount > 0 && amount >= 10) {
      // Require at least 10 to avoid noise
      return { amount, currency: currencyHint, confidence: 'low' }
    }
  }

  return { amount: null, currency: currencyHint, confidence: 'low' }
}
