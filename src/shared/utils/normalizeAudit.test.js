import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeAudit } from './normalizeAudit.js'

test('normalizeAudit assigns fallback ranks to competitors when rank data is missing', () => {
  const audit = normalizeAudit({
    id: 'audit-1',
    url: 'https://example.com',
    keyword: 'cheap laptops',
    competitors: [
      { domain: 'one.com' },
      null,
      { rank: 5, domain: 'five.com' },
    ],
  })

  assert.ok(audit)
  assert.equal(audit.competitors.length, 3)
  assert.equal(audit.competitors[0].rank, 1)
  assert.equal(audit.competitors[1].rank, 2)
  assert.equal(audit.competitors[2].rank, 5)
  assert.equal(audit.competitors[0].domain, 'one.com')
})
