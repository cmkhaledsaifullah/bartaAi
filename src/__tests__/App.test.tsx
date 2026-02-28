import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../views/App'

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('renders the knowledge base header and default articles', () => {
    render(<App />)

    expect(screen.getAllByText('বার্তা ভাণ্ডার').length).toBeGreaterThan(0)
    
    // Switch to knowledge tab to see articles
    const knowledgeButton = screen.getAllByRole('button', { name: /বার্তা ভাণ্ডার/i })[0]
    fireEvent.click(knowledgeButton)
    
    expect(screen.getByTestId('article-card-1')).toHaveTextContent('মেট্রোরেল')
    expect(screen.getByTestId('article-card-2')).toHaveTextContent('বিশ্বকাপ ক্রিকেট')
  })
})
