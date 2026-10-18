import { workspaceSchema } from './model'
import type { Workspace } from './model'

export type LocalWorkspace = {
  scope: string
  mode: string
  revision: number
  sequence: number
  base: Workspace
  data: Workspace
  pending: boolean
}

// Netlify Database remains authoritative. IndexedDB holds a per-owner offline
// replica and durable outbox; no credentials or API responses go in CacheStorage.
async function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('daystar-offline-v1', 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore('workspaces', { keyPath: 'scope' })
      request.result.createObjectStore('metadata')
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('Local storage is unavailable. Export a backup and keep unsaved text open.'))
    request.onblocked = () => reject(new Error('Close other Daystar tabs to finish opening local storage.'))
  })
}

export async function readLocal(scope?: string): Promise<LocalWorkspace | undefined> {
  const db = await open()
  try {
    return await new Promise<LocalWorkspace | undefined>((resolve, reject) => {
      const tx = db.transaction(['workspaces', 'metadata'])
      const get = (key: string) => {
        const request = tx.objectStore('workspaces').get(key)
        request.onsuccess = () => {
          const value = request.result as LocalWorkspace | undefined
          if (value) {
            try {
              workspaceSchema.parse(value.data)
              workspaceSchema.parse(value.base)
            } catch { reject(new Error('Local records need recovery from a private export.')); return }
          }
          resolve(value)
        }
      }
      if (scope) get(scope)
      else {
        const request = tx.objectStore('metadata').get('active')
        request.onsuccess = () => request.result ? get(request.result) : resolve(undefined)
      }
      tx.onabort = () => reject(new Error('Unable to read local records.'))
    })
  } finally { db.close() }
}

export async function activateLocal(scope: string | null) {
  const db = await open()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('metadata', 'readwrite')
      tx.objectStore('metadata').put(scope, 'active')
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(new Error('Unable to protect the offline account boundary.'))
    })
  } finally { db.close() }
}

export async function writeLocal(value: LocalWorkspace, expected: number | null) {
  const db = await open()
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('workspaces', 'readwrite')
      const store = tx.objectStore('workspaces')
      const request = store.get(value.scope)
      request.onsuccess = () => {
        const current = request.result as LocalWorkspace | undefined
        if ((current?.sequence ?? null) !== expected) { tx.abort(); return }
        store.put(value)
      }
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(new Error('Another tab changed local records or storage is full. Keep this form open, export a backup, and reconnect.'))
    })
  } finally { db.close() }
}

export async function workspaceRequest(init?: RequestInit) {
  return fetch('/.netlify/functions/workspace', {
    ...init,
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  })
}

export function same(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false
  if (Array.isArray(a) || Array.isArray(b))
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v, i) => same(v, b[i]))
  const left = a as Record<string, unknown>, right = b as Record<string, unknown>
  return Object.keys(left).length === Object.keys(right).length && Object.keys(left).every((k) => Object.hasOwn(right, k) && same(left[k], right[k]))
}

// Deliberately conservative: disjoint fields merge; any overlapping change is
// retained locally and requires recovery. No last-writer-wins or stale overwrite.
export function reconcile(base: unknown, local: unknown, remote: unknown): unknown {
  if (same(local, base)) return remote
  if (same(remote, base) || same(local, remote)) return local
  if ([base, local, remote].every((v) => !!v && typeof v === 'object' && !Array.isArray(v))) {
    const b = base as Record<string, unknown>, l = local as Record<string, unknown>, r = remote as Record<string, unknown>
    return Object.fromEntries([...new Set([...Object.keys(b), ...Object.keys(l), ...Object.keys(r)])].map((key) => [key, reconcile(b[key], l[key], r[key])]).filter(([, value]) => value !== undefined))
  }
  // Collections merge by stable IDs. Atomic non-record arrays conflict safely.
  if ([base, local, remote].every((v) => Array.isArray(v) && v.every((item) => item && typeof item === 'object' && typeof item.id === 'string'))) {
    const b = base as { id: string }[], l = local as { id: string }[], r = remote as { id: string }[]
    const bm = new Map(b.map((item) => [item.id, item])), lm = new Map(l.map((item) => [item.id, item])), rm = new Map(r.map((item) => [item.id, item]))
    const ids = [...new Set([...rm.keys(), ...lm.keys(), ...bm.keys()])]
    return ids.map((id) => reconcile(bm.get(id), lm.get(id), rm.get(id))).filter((v) => v !== undefined)
  }
  throw new Error('Both devices changed the same record. Your local edits are retained. Export this workspace before resolving the conflict; remote records have not been overwritten.')
}
