import { describe, expect, it } from 'vitest'
import { reconcile, same } from './offline'

describe('conservative offline reconciliation', () => {
  it('combines independent new records by stable ID without duplication', () => {
    expect(reconcile([], [{ id: 'local', title: 'Read' }], [{ id: 'remote', title: 'Walk' }])).toEqual([
      { id: 'remote', title: 'Walk' }, { id: 'local', title: 'Read' },
    ])
  })
  it('recognises an interrupted successful write without resubmitting duplicates', () => {
    const desired = [{ id: 'entry', value: 5 }]
    expect(reconcile([], desired, desired)).toEqual(desired)
    expect(same({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true)
  })
  it('merges changes to independent fields of the same record', () => {
    expect(reconcile({ title: 'Read', done: false }, { title: 'Read slowly', done: false }, { title: 'Read', done: true })).toEqual({ title: 'Read slowly', done: true })
  })
  it('rejects edits to the same field and preserves both caller-owned inputs', () => {
    const local = { title: 'Local' }, remote = { title: 'Remote' }
    expect(() => reconcile({ title: 'Base' }, local, remote)).toThrow(/retained/)
    expect(local.title).toBe('Local')
    expect(remote.title).toBe('Remote')
  })
  it('does not silently delete a record edited remotely', () => {
    expect(() => reconcile([{ id: 'j', text: 'Base' }], [], [{ id: 'j', text: 'Edited' }])).toThrow()
  })
  it('preserves remote-only changes and detects conflicting atomic arrays', () => {
    expect(reconcile({ a: 1 }, { a: 1 }, { a: 2 })).toEqual({ a: 2 })
    expect(() => reconcile([1], [2], [3])).toThrow()
  })
})
