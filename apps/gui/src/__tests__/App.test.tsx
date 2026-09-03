import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn((_key: string, defaultValue: unknown) => [defaultValue, vi.fn()]),
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Physics Foundry identity and provenance boundary', () => {
    render(<App />)

    expect(screen.getByText('Physics Foundry')).toBeInTheDocument()
    expect(screen.getByText('Mixed provenance prototype')).toBeInTheDocument()
    expect(
      screen.getByText(/Pipeline and system panels read backend state/i),
    ).toBeInTheDocument()
  })

  it('renders the new project action', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: 'New Project' })).toBeInTheDocument()
  })

  it('opens project creation when the new project action is clicked', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'New Project' }))

    await waitFor(() => {
      expect(screen.getByText('Create New Physics Video Project')).toBeInTheDocument()
    })
  })

  it('exposes live-service and demo surfaces with explicit labels', () => {
    render(<App />)

    expect(screen.getByRole('tab', { name: 'Dashboard' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Pipeline' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Code Review' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Audio Review' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'QA Demo' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Preview Demo' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'System' })).toBeInTheDocument()
  })
})
