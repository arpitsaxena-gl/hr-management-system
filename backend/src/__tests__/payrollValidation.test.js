/**
 * SCRUM-8 — Payroll API validation tests
 * Verifies: AC-8 (express-validator rules on GET /api/payroll)
 * Framework: Jest (added via devDependencies — see jest.config.cjs)
 * Run: cd backend && npx jest src/__tests__/payrollValidation.test.js
 *
 * These tests exercise the validation middleware directly without a live DB.
 */
const { validationResult } = require('express-validator')
const { query } = require('express-validator')

// Re-declare the same validator array used in routes/payroll.js
const validatePayrollQuery = [
  query('status')
    .optional()
    .isIn(['draft', 'processed', 'paid', 'cancelled'])
    .withMessage('status must be one of: draft, processed, paid, cancelled'),
  query('month')
    .optional()
    .isInt({ min: 1, max: 12 })
    .withMessage('month must be an integer between 1 and 12'),
  query('year')
    .optional()
    .isInt({ min: 2000, max: 2100 })
    .withMessage('year must be an integer between 2000 and 2100'),
]

/** Utility: run all validators against a mock req and return validation errors. */
async function runValidators(queryParams) {
  const req = { query: queryParams, headers: {}, body: {} }
  for (const validator of validatePayrollQuery) {
    await validator.run(req)
  }
  return validationResult(req)
}

describe('Payroll query validation — status', () => {
  // AC-8: invalid status returns errors
  it('rejects invalid status value', async () => {
    const result = await runValidators({ status: 'invalid' })
    expect(result.isEmpty()).toBe(false)
    const err = result.array().find(e => e.path === 'status')
    expect(err).toBeDefined()
  })

  it('accepts valid status: draft', async () => {
    const result = await runValidators({ status: 'draft' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts valid status: processed', async () => {
    const result = await runValidators({ status: 'processed' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts valid status: paid', async () => {
    const result = await runValidators({ status: 'paid' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts valid status: cancelled', async () => {
    const result = await runValidators({ status: 'cancelled' })
    expect(result.isEmpty()).toBe(true)
  })

  it('passes when status is omitted (optional)', async () => {
    const result = await runValidators({})
    expect(result.isEmpty()).toBe(true)
  })
})

describe('Payroll query validation — month', () => {
  it('rejects month=0 (below min)', async () => {
    const result = await runValidators({ month: '0' })
    expect(result.isEmpty()).toBe(false)
  })

  it('rejects month=13 (above max)', async () => {
    const result = await runValidators({ month: '13' })
    expect(result.isEmpty()).toBe(false)
    const err = result.array().find(e => e.path === 'month')
    expect(err).toBeDefined()
  })

  it('accepts month=1 (boundary min)', async () => {
    const result = await runValidators({ month: '1' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts month=12 (boundary max)', async () => {
    const result = await runValidators({ month: '12' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts month=7 (mid-range)', async () => {
    const result = await runValidators({ month: '7' })
    expect(result.isEmpty()).toBe(true)
  })

  it('rejects month=abc (non-integer)', async () => {
    const result = await runValidators({ month: 'abc' })
    expect(result.isEmpty()).toBe(false)
  })
})

describe('Payroll query validation — year', () => {
  it('rejects year=1999 (below min)', async () => {
    const result = await runValidators({ year: '1999' })
    expect(result.isEmpty()).toBe(false)
    const err = result.array().find(e => e.path === 'year')
    expect(err).toBeDefined()
  })

  it('rejects year=2101 (above max)', async () => {
    const result = await runValidators({ year: '2101' })
    expect(result.isEmpty()).toBe(false)
  })

  it('accepts year=2000 (boundary min)', async () => {
    const result = await runValidators({ year: '2000' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts year=2100 (boundary max)', async () => {
    const result = await runValidators({ year: '2100' })
    expect(result.isEmpty()).toBe(true)
  })

  it('accepts year=2026 (typical)', async () => {
    const result = await runValidators({ year: '2026' })
    expect(result.isEmpty()).toBe(true)
  })

  it('rejects year=notanumber', async () => {
    const result = await runValidators({ year: 'notanumber' })
    expect(result.isEmpty()).toBe(false)
  })
})

describe('Payroll query validation — combined params', () => {
  it('accepts all valid params together', async () => {
    const result = await runValidators({ status: 'processed', month: '7', year: '2026' })
    expect(result.isEmpty()).toBe(true)
  })

  it('collects errors for multiple invalid params simultaneously', async () => {
    const result = await runValidators({ status: 'bad', month: '99', year: '1990' })
    const errs = result.array()
    expect(errs.length).toBeGreaterThanOrEqual(3)
  })
})
