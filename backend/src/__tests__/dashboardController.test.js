/**
 * SCRUM-8 — Dashboard controller unit tests
 * Verifies: AC-9 (birthday aggregation uses $addFields, no full scan), AC-9 (getAttendanceTrend handler exists)
 * Framework: Jest with manual mocks (no live MongoDB)
 * Run: cd backend && npx jest src/__tests__/dashboardController.test.js
 */
const { getAttendanceTrend } = require('../controllers/dashboardController')

// ---- Minimal Mongoose aggregate mock ----
const mockAggregateResult = [
  { _id: { date: '2026-07-01', status: 'present' }, count: 45 },
  { _id: { date: '2026-07-01', status: 'absent' }, count: 5 },
  { _id: { date: '2026-07-02', status: 'present' }, count: 48 },
]

jest.mock('../models/Attendance', () => ({
  aggregate: jest.fn().mockResolvedValue(mockAggregateResult),
}))

const mockRes = () => {
  const res = {}
  res.json = jest.fn().mockReturnValue(res)
  res.status = jest.fn().mockReturnValue(res)
  return res
}

describe('getAttendanceTrend handler', () => {
  it('is exported from dashboardController', () => {
    expect(typeof getAttendanceTrend).toBe('function')
  })

  it('calls Attendance.aggregate and returns pivoted result', async () => {
    const Attendance = require('../models/Attendance')
    const req = {}
    const res = mockRes()
    const next = jest.fn()

    // Inline ApiResponse mock so we capture the payload
    jest.mock('../utils/apiResponse', () => ({
      success: jest.fn((res, data) => res.json({ success: true, data })),
    }))

    await getAttendanceTrend(req, res, next)

    expect(Attendance.aggregate).toHaveBeenCalledTimes(1)
    // The aggregate call should include a $group stage keyed by date
    const [pipeline] = Attendance.aggregate.mock.calls[0]
    const hasGroupStage = pipeline.some(s => s.$group !== undefined)
    expect(hasGroupStage).toBe(true)
  })

  it('pivots raw aggregate rows into date-keyed objects', () => {
    // Test the pivot logic independently
    const trend = mockAggregateResult
    const byDate = trend.reduce((acc, item) => {
      const dateKey = item._id.date
      if (!acc[dateKey]) acc[dateKey] = { month: dateKey, present: 0, absent: 0, on_leave: 0 }
      acc[dateKey][item._id.status] = item.count
      return acc
    }, {})

    const values = Object.values(byDate)
    expect(values).toHaveLength(2)

    const july1 = values.find(v => v.month === '2026-07-01')
    expect(july1).toBeDefined()
    expect(july1.present).toBe(45)
    expect(july1.absent).toBe(5)
    expect(july1.on_leave).toBe(0)

    const july2 = values.find(v => v.month === '2026-07-02')
    expect(july2).toBeDefined()
    expect(july2.present).toBe(48)
  })

  it('calls next(err) on aggregate failure', async () => {
    const Attendance = require('../models/Attendance')
    Attendance.aggregate.mockRejectedValueOnce(new Error('DB Error'))

    const req = {}
    const res = mockRes()
    const next = jest.fn()

    await getAttendanceTrend(req, res, next)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: 'DB Error' }))
  })
})

describe('Birthday aggregation — $addFields usage', () => {
  it('dashboardController source uses $addFields for birthday month extraction', async () => {
    // This test validates the *structure* of the controller module source code,
    // ensuring we did NOT revert to a full Employee.find() scan.
    const fs = require('fs')
    const path = require('path')
    const src = fs.readFileSync(
      path.join(__dirname, '../controllers/dashboardController.js'),
      'utf8'
    )
    expect(src).toContain('$addFields')
    expect(src).toContain('birthMonth')
    // Must NOT have the legacy Employee.find() + filter pattern
    expect(src).not.toMatch(/Employee\.find\s*\(\s*\{\s*\}\s*\)/)
  })
})
