/**
 * SCRUM-8 — formatters.ts unit tests
 * Verifies: AC-3 (₹ currency symbol), AC-6 (stat cards show ₹), formatLakhs thresholds
 * Framework: Vitest
 * Run: cd client && npx vitest run src/lib/formatters.test.ts
 */
import { describe, it, expect } from 'vitest'
import { formatINR, formatLakhs } from '../lib/formatters'

describe('formatINR', () => {
  // Happy path — correct ₹ symbol and en-IN grouping
  it('formats zero as ₹0', () => {
    expect(formatINR(0)).toMatch(/₹/)
    expect(formatINR(0)).toMatch(/0/)
  })

  it('formats a typical monthly salary (50000) with ₹ symbol', () => {
    const result = formatINR(50000)
    expect(result).toMatch(/₹/)
    expect(result).toContain('50')
  })

  it('formats a large payroll amount (1234567) using en-IN grouping', () => {
    const result = formatINR(1234567)
    expect(result).toMatch(/₹/)
    // en-IN: 12,34,567
    expect(result).toContain('12,34,567')
  })

  it('formats negative value with ₹ symbol', () => {
    const result = formatINR(-1000)
    expect(result).toMatch(/₹/)
  })

  // No decimal digits (maximumFractionDigits: 0)
  it('rounds to integer — no decimal digits', () => {
    const result = formatINR(1234.56)
    expect(result).not.toMatch(/\.\d/)
  })

  // Regression — must NOT use "Rs." legacy notation
  it('does NOT use legacy "Rs." prefix', () => {
    expect(formatINR(5000)).not.toContain('Rs.')
    expect(formatINR(5000)).not.toContain('INR')
  })
})

describe('formatLakhs', () => {
  // Boundary: < 1000 → plain ₹ format
  it('returns formatINR result for values below 1000', () => {
    expect(formatLakhs(500)).toMatch(/₹/)
    expect(formatLakhs(500)).toMatch(/500/)
  })

  // Boundary: 1000–99999 → K notation
  it('formats 1000 as ₹1.0K', () => {
    expect(formatLakhs(1000)).toBe('₹1.0K')
  })

  it('formats 5500 as ₹5.5K', () => {
    expect(formatLakhs(5500)).toBe('₹5.5K')
  })

  // Boundary: 100000 (1 Lakh)
  it('formats 100000 as ₹1.0L', () => {
    expect(formatLakhs(100000)).toBe('₹1.0L')
  })

  it('formats 250000 as ₹2.5L', () => {
    expect(formatLakhs(250000)).toBe('₹2.5L')
  })

  // Boundary: 10000000 (1 Crore)
  it('formats 10000000 as ₹1.00Cr', () => {
    expect(formatLakhs(10000000)).toBe('₹1.00Cr')
  })

  it('formats 25000000 as ₹2.50Cr', () => {
    expect(formatLakhs(25000000)).toBe('₹2.50Cr')
  })

  // Edge: exact boundary between K and L (99999 stays K, 100000 flips to L)
  it('formats 99999 with K notation', () => {
    expect(formatLakhs(99999)).toContain('K')
  })

  it('formats 100000 with L notation not K', () => {
    const result = formatLakhs(100000)
    expect(result).toContain('L')
    expect(result).not.toContain('K')
  })
})
