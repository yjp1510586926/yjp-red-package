import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

// 生产模式使用 StrictMode，开发模式不使用以避免双重渲染
root.render(
  import.meta.env.MODE === 'production' ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
)
