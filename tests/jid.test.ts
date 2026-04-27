import { describe, it, expect } from 'vitest'
import { normalizeJid, extractMessageText } from '../src/jid.js'

describe('normalizeJid', () => {
  it('should preserve full JID', () => {
    expect(normalizeJid('27821234567@s.whatsapp.net')).toBe('27821234567@s.whatsapp.net')
    expect(normalizeJid('120363012345678901@g.us')).toBe('120363012345678901@g.us')
  })

  it('should convert phone digits to JID', () => {
    expect(normalizeJid('27821234567')).toBe('27821234567@s.whatsapp.net')
    expect(normalizeJid('1234567890')).toBe('1234567890@s.whatsapp.net')
  })

  it('should strip non-digits from phone numbers', () => {
    expect(normalizeJid('+27 82 123 4567')).toBe('27821234567@s.whatsapp.net')
    expect(normalizeJid('(278) 212-34567')).toBe('27821234567@s.whatsapp.net')
  })

  it('should throw on invalid input', () => {
    expect(() => normalizeJid('')).toThrow('Invalid JID/phone')
    expect(() => normalizeJid('abc')).toThrow('Invalid JID/phone')
  })
})

describe('extractMessageText', () => {
  it('should extract from conversation', () => {
    expect(extractMessageText({ conversation: 'Hello' })).toBe('Hello')
  })

  it('should extract from extendedTextMessage', () => {
    expect(extractMessageText({ extendedTextMessage: { text: 'Hello' } })).toBe('Hello')
  })

  it('should extract from imageMessage caption', () => {
    expect(extractMessageText({ imageMessage: { caption: 'Caption' } })).toBe('Caption')
  })

  it('should extract from videoMessage caption', () => {
    expect(extractMessageText({ videoMessage: { caption: 'Caption' } })).toBe('Caption')
  })

  it('should return null for empty message', () => {
    expect(extractMessageText(null)).toBeNull()
    expect(extractMessageText({})).toBeNull()
    expect(extractMessageText({ stickerMessage: {} })).toBeNull()
  })
})
