import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import Home from './views/Home.tsx'
import { MOCK_ARTICLES } from './config/constants'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home articles={MOCK_ARTICLES} />
  </StrictMode>,
)
