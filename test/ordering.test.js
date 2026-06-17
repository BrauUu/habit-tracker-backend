import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { moveItemToPosition } from '../src/utils/ordering.js'

describe('moveItemToPosition', () => {
  const items = [
    { id: 'a', order: 1 },
    { id: 'b', order: 2 },
    { id: 'c', order: 3 },
  ]

  it('moves an item down and returns contiguous orders', () => {
    assert.deepEqual(moveItemToPosition(items, 'a', 3), [
      { id: 'b', order: 1 },
      { id: 'c', order: 2 },
      { id: 'a', order: 3 },
    ])
  })

  it('moves an item up and returns contiguous orders', () => {
    assert.deepEqual(moveItemToPosition(items, 'c', 1), [
      { id: 'c', order: 1 },
      { id: 'a', order: 2 },
      { id: 'b', order: 3 },
    ])
  })

  it('keeps the list consistent when the item stays in the same position', () => {
    assert.deepEqual(moveItemToPosition(items, 'b', 2), [
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
      { id: 'c', order: 3 },
    ])
  })

  it('rejects positions outside the list', () => {
    assert.throws(() => moveItemToPosition(items, 'a', 0), /newPosition/)
    assert.throws(() => moveItemToPosition(items, 'a', 4), /newPosition/)
  })
})
