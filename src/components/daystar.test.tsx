import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react'
import Daystar from './daystar'
import { initialWorkspace } from '@/lib/model'
import { writeLocal } from '@/lib/offline'

vi.mock('@/lib/offline', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/offline')>(),
  readLocal: vi.fn().mockResolvedValue(undefined),
  writeLocal: vi.fn().mockResolvedValue(undefined),
  activateLocal: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@netlify/identity', () => ({
  getUser: vi.fn().mockResolvedValue(null),
  getSettings: vi.fn().mockResolvedValue({ providers: {} }),
  handleAuthCallback: vi.fn().mockResolvedValue(null),
}))
vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }),
}))

beforeEach(() => {
  vi.mocked(writeLocal).mockReset().mockResolvedValue(undefined)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: initialWorkspace(),
        revision: 0,
        scope: 'private',
        mode: 'device',
      }),
    }),
  )
})

describe('saved workspace interactions', () => {
  it('opens every workspace destination with empty saved records', async () => {
    const { container } = render(<Daystar />)
    await screen.findByText('Private workspace')
    const sidebar = within(container.querySelector('aside')!)
    for (const name of [
      'Tasks',
      'Insights',
      'Journal',
      'Goals',
      'Planner',
      'Focus Room',
      'Accountability Coach',
      'Settings',
      'Home',
    ]) {
      fireEvent.click(sidebar.getByRole('button', { name }))
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    }
    expect(
      screen.queryByRole('button', { name: /reset/i }),
    ).not.toBeInTheDocument()
  })

  it('keeps an unsaved task form and its text after local persistence fails', async () => {
    render(<Daystar />)
    await screen.findByText('Private workspace')
    fireEvent.click(screen.getByRole('button', { name: /add task/i }))
    const dialog = within(screen.getByRole('dialog'))
    fireEvent.change(dialog.getByLabelText('Task name'), {
      target: { value: 'Read one chapter' },
    })
    vi.mocked(writeLocal).mockRejectedValueOnce(new Error('Local storage is full. Keep the form open.'))
    fireEvent.submit(
      dialog.getByRole('button', { name: 'Save' }).closest('form')!,
    )
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Local storage is full. Keep the form open.',
      ),
    )
    expect(dialog.getByLabelText('Task name')).toHaveValue('Read one chapter')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(vi.mocked(fetch).mock.calls.some(([, options]) => options?.method === 'PUT')).toBe(false)
  })
})
