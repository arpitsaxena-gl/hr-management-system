const { describe, it, expect, vi, beforeEach } = require('vitest')

const payrollFindById = vi.fn()
const payrollFindOne = vi.fn()
const payrollCreate = vi.fn()
const payrollFindByIdAndUpdate = vi.fn()
const employeeFindOne = vi.fn()
const employeeFind = vi.fn()
const payrollAggregate = vi.fn()

vi.mock('../models/Payroll', () => ({
  default: {
    find: vi.fn(),
    findOne: payrollFindOne,
    create: payrollCreate,
    findById: payrollFindById,
    findByIdAndUpdate: payrollFindByIdAndUpdate,
    countDocuments: vi.fn(),
    aggregate: payrollAggregate,
  },
}))

vi.mock('../models/Employee', () => ({
  default: {
    findOne: employeeFindOne,
    find: employeeFind,
    countDocuments: vi.fn(),
  },
}))

vi.mock('../services/payrollService', () => ({
  calculatePayroll: vi.fn().mockResolvedValue({
    earnings: { grossEarnings: 100000 },
    deductions: { totalDeductions: 12000 },
    netSalary: 88000,
  }),
}))

vi.mock('../utils/apiResponse', () => ({
  default: {
    success: vi.fn(),
    paginated: vi.fn(),
  },
}))

vi.mock('../utils/helpers', () => ({
  createError: (message, statusCode) => Object.assign(new Error(message), { statusCode }),
}))

const Payroll = require('../models/Payroll').default
const ApiResponse = require('../utils/apiResponse').default
const { processPayroll, approvePayroll, markAsPaid, getPayrollSummary } = require('./payrollController')

describe('payrollController', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects invalid payroll periods before processing', async () => {
    // SCRUM-7 AC: backend validation must block invalid month/year values.
    const next = vi.fn()
    await processPayroll({ body: { month: 13, year: 2026 }, user: { _id: 'u-1' } }, {}, next)

    expect(next).toHaveBeenCalledOnce()
    expect(next.mock.calls[0][0].message).toMatch(/Valid month is required/)
  })

  it('rejects approval when payroll is not in draft state', async () => {
    const payroll = { status: 'processed', save: vi.fn() }
    payrollFindById.mockResolvedValue(payroll)
    const next = vi.fn()

    await approvePayroll({ params: { id: 'p-1' }, user: { _id: 'u-1' } }, {}, next)

    expect(next).toHaveBeenCalledOnce()
    expect(next.mock.calls[0][0].message).toBe('Only draft payrolls can be approved')
    expect(payroll.save).not.toHaveBeenCalled()
  })

  it('requires a payment method before marking payroll as paid', async () => {
    const next = vi.fn()

    await markAsPaid({ params: { id: 'p-1' }, body: {}, user: { _id: 'u-1' } }, {}, next)

    expect(next).toHaveBeenCalledOnce()
    expect(next.mock.calls[0][0].message).toBe('paymentMethod is required')
  })

  it('returns the payroll summary payload for the selected period', async () => {
    payrollAggregate.mockResolvedValue([{ _id: 'processed', count: 2, totalNet: 176000, totalDeductions: 24000 }])
    const res = {}
    const next = vi.fn()
    await getPayrollSummary({ query: { month: 6, year: 2026 } }, res, next)

    expect(next).not.toHaveBeenCalled()
    expect(ApiResponse.success).toHaveBeenCalled()
    expect(ApiResponse.success.mock.calls[0][1]).toEqual({
      month: 6,
      year: 2026,
      summary: [{ _id: 'processed', count: 2, totalNet: 176000, totalDeductions: 24000 }],
    })
  })
})
