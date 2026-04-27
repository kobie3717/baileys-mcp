import { describe, it, expect } from 'vitest'
import { parseBid } from '../src/parse-bid.js'

describe('parseBid', () => {
  it('should parse R prefix with high confidence', () => {
    expect(parseBid('R500')).toEqual({
      amount: 500,
      currency: 'ZAR',
      confidence: 'high'
    })

    expect(parseBid('r500')).toEqual({
      amount: 500,
      currency: 'ZAR',
      confidence: 'high'
    })

    expect(parseBid('R 500')).toEqual({
      amount: 500,
      currency: 'ZAR',
      confidence: 'high'
    })

    expect(parseBid('R1,200.50')).toEqual({
      amount: 1200.5,
      currency: 'ZAR',
      confidence: 'high'
    })
  })

  it('should parse rand/rands suffix with medium confidence', () => {
    expect(parseBid('500 rand')).toEqual({
      amount: 500,
      currency: 'ZAR',
      confidence: 'medium'
    })

    expect(parseBid('1200 rands')).toEqual({
      amount: 1200,
      currency: 'ZAR',
      confidence: 'medium'
    })

    expect(parseBid('250rand')).toEqual({
      amount: 250,
      currency: 'ZAR',
      confidence: 'medium'
    })
  })

  it('should parse K suffix (thousands) with medium confidence', () => {
    expect(parseBid('5K')).toEqual({
      amount: 5000,
      currency: 'ZAR',
      confidence: 'medium'
    })

    expect(parseBid('10k')).toEqual({
      amount: 10000,
      currency: 'ZAR',
      confidence: 'medium'
    })

    expect(parseBid('2.5K')).toEqual({
      amount: 2500,
      currency: 'ZAR',
      confidence: 'medium'
    })
  })

  it('should parse standalone numbers with low confidence', () => {
    expect(parseBid('500')).toEqual({
      amount: 500,
      currency: 'ZAR',
      confidence: 'low'
    })

    expect(parseBid('The bid is 1500')).toEqual({
      amount: 1500,
      currency: 'ZAR',
      confidence: 'low'
    })
  })

  it('should handle real-world auction messages', () => {
    expect(parseBid("I'll go R750 my bru")).toEqual({
      amount: 750,
      currency: 'ZAR',
      confidence: 'high'
    })

    expect(parseBid('Bid received: R500')).toEqual({
      amount: 500,
      currency: 'ZAR',
      confidence: 'high'
    })

    expect(parseBid('Going for 2K')).toEqual({
      amount: 2000,
      currency: 'ZAR',
      confidence: 'medium'
    })
  })

  it('should return null for invalid inputs', () => {
    expect(parseBid('no bid here')).toEqual({
      amount: null,
      currency: 'ZAR',
      confidence: 'low'
    })

    expect(parseBid('')).toEqual({
      amount: null,
      currency: 'ZAR',
      confidence: 'low'
    })

    expect(parseBid('R')).toEqual({
      amount: null,
      currency: 'ZAR',
      confidence: 'low'
    })
  })

  it('should respect custom currency hint', () => {
    expect(parseBid('R500', 'USD')).toEqual({
      amount: 500,
      currency: 'USD',
      confidence: 'high'
    })
  })

  it('should reject very small standalone numbers', () => {
    expect(parseBid('5')).toEqual({
      amount: null,
      currency: 'ZAR',
      confidence: 'low'
    })
  })
})
