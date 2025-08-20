import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import App from '../App'

// Mock the @github/spark/hooks module
vi.mock('@github/spark/hooks', () => ({
  useKV: vi.fn(() => [[], vi.fn()]),
}))

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the main heading', () => {
    render(<App />)
    expect(screen.getByText('Physics Video Pipeline')).toBeInTheDocument()
  })

  it('renders the new project button', () => {
    render(<App />)
    expect(screen.getByText('New Project')).toBeInTheDocument()
  })

  it('opens project creation dialog when new project button is clicked', async () => {
    render(<App />)
    const newProjectButton = screen.getByText('New Project')
    fireEvent.click(newProjectButton)
    
    await waitFor(() => {
      expect(screen.getByText('Create New Physics Video Project')).toBeInTheDocument()
    })
  })

  it('displays different tabs correctly', () => {
    render(<App />)
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Pipeline')).toBeInTheDocument()
    expect(screen.getByText('Quality Assurance')).toBeInTheDocument()
  })
})