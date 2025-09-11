import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import '@ant-design/v5-patch-for-react-19'

import RootRoutes from './routes/RootRoutes.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <RootRoutes />
        </BrowserRouter>
    </StrictMode>
)
