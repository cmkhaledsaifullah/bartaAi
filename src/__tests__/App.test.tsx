import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../views/App'

afterEach(() => {
  cleanup()
})

describe('App', () => {
  it('renders the knowledge base header and default articles', () => {
    render(<App />)

    expect(screen.getByText('Knowledge Base')).toBeInTheDocument()
    expect(screen.getByTestId('article-card-1')).toHaveTextContent('মেট্রোরেল')
    expect(screen.getByTestId('article-card-2')).toHaveTextContent('বিশ্বকাপ ক্রিকেট')
  })
})
