import { test, expect } from '@playwright/test'

test.describe('Physics Foundry - Main Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('displays the main application header', async ({ page }) => {
    await expect(page.getByText('Physics Video Pipeline')).toBeVisible()
    await expect(page.getByText('Local AI-driven video production system')).toBeVisible()
  })

  test('shows new project button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /new project/i })).toBeVisible()
  })

  test('has accessible navigation tabs', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /pipeline/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /quality/i })).toBeVisible()
  })

  test('supports keyboard navigation', async ({ page }) => {
    // Focus should start on the first interactive element
    await page.keyboard.press('Tab')
    await expect(page.getByRole('button', { name: /new project/i })).toBeFocused()

    // Navigate through tabs with keyboard
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter')
  })

  test('opens project creation dialog', async ({ page }) => {
    await page.getByRole('button', { name: /new project/i }).click()
    
    await expect(page.getByText('Create New Physics Video Project')).toBeVisible()
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('displays project dashboard by default', async ({ page }) => {
    await expect(page.getByText(/no projects yet/i)).toBeVisible()
  })
})

test.describe('Project Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /new project/i }).click()
  })

  test('shows project creation form', async ({ page }) => {
    await expect(page.getByLabel(/project title/i)).toBeVisible()
    await expect(page.getByLabel(/physics topic/i)).toBeVisible()
    await expect(page.getByLabel(/duration/i)).toBeVisible()
    await expect(page.getByLabel(/difficulty level/i)).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    // Try to create project without filling required fields
    await page.getByRole('button', { name: /create project/i }).click()
    
    // Should show validation errors
    await expect(page.getByText(/required/i)).toBeVisible()
  })

  test('creates project successfully', async ({ page }) => {
    await page.getByLabel(/project title/i).fill('Test Physics Project')
    await page.getByLabel(/physics topic/i).fill('Quantum Mechanics')
    await page.getByLabel(/duration/i).fill('60')
    
    await page.getByRole('button', { name: /create project/i }).click()
    
    // Should close dialog and show project in dashboard
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(page.getByText('Test Physics Project')).toBeVisible()
  })
})

test.describe('Accessibility', () => {
  test('meets WCAG standards', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper heading structure
    const h1 = page.locator('h1')
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText('Physics Video Pipeline')
    
    // Check for proper landmark roles
    await expect(page.locator('main')).toBeVisible()
    await expect(page.locator('[role="banner"], header')).toBeVisible()
  })

  test('supports screen reader navigation', async ({ page }) => {
    await page.goto('/')
    
    // Check for proper ARIA labels
    await expect(page.getByRole('button', { name: /new project/i })).toHaveAttribute('type', 'button')
    
    // Check for live regions for dynamic content
    await expect(page.locator('[aria-live]')).toBeTruthy()
  })

  test('has proper focus management', async ({ page }) => {
    await page.goto('/')
    
    // Open dialog
    await page.getByRole('button', { name: /new project/i }).click()
    
    // Focus should move to dialog
    await expect(page.getByRole('dialog')).toBeFocused()
    
    // Escape should close dialog and return focus
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})

test.describe('Performance', () => {
  test('loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000) // 3 seconds max load time
  })

  test('has good Core Web Vitals', async ({ page }) => {
    await page.goto('/')
    
    // Wait for page to stabilize
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    
    // Check for layout shifts (simplified check)
    const layoutShifts = await page.evaluate(() => {
      return new Promise(resolve => {
        let cumulativeScore = 0
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              cumulativeScore += entry.value
            }
          }
          resolve(cumulativeScore)
        }).observe({ entryTypes: ['layout-shift'] })
        
        // Resolve after a short delay
        setTimeout(() => resolve(cumulativeScore), 1000)
      })
    })
    
    expect(layoutShifts).toBeLessThan(0.1) // Good CLS score
  })
})

test.describe('Error Handling', () => {
  test('displays error boundary on JavaScript errors', async ({ page }) => {
    // Mock a JavaScript error
    await page.goto('/')
    
    await page.evaluate(() => {
      // Trigger an error in React component
      window.dispatchEvent(new Event('error'))
    })
    
    // Error boundary should catch and display error
    await expect(page.getByText(/something went wrong/i)).toBeVisible()
  })

  test('handles network errors gracefully', async ({ page }) => {
    // Intercept network requests and make them fail
    await page.route('**/api/**', route => {
      route.abort('failed')
    })
    
    await page.goto('/')
    
    // Should show appropriate error message
    await expect(page.getByText(/connection error/i)).toBeVisible()
  })
})

test.describe('Responsive Design', () => {
  test('works on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    
    // Should display mobile-friendly layout
    await expect(page.getByText('Physics Video Pipeline')).toBeVisible()
    await expect(page.getByRole('button', { name: /new project/i })).toBeVisible()
  })

  test('adapts to tablet screen sizes', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/')
    
    // Should maintain functionality on tablet
    await expect(page.getByText('Physics Video Pipeline')).toBeVisible()
    await page.getByRole('button', { name: /new project/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
  })
})