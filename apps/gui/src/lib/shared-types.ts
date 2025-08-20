// Shared types integration for GUI
// This re-exports shared types from the packages directory

export * from '../../../packages/shared/ts/types'

// Additional GUI-specific extensions
export interface UIState {
  theme: 'light' | 'dark' | 'system'
  language: string
  sidebarCollapsed: boolean
  activeView: string
}

export interface NavigationItem {
  id: string
  label: string
  icon: string
  path: string
  badge?: string
}

export interface NotificationOptions {
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}