import React from 'react'
import ReactDOM from 'react-dom/client'
import {Toaster} from 'react-hot-toast'

import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App/>
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#363636',
                    color: '#fff',
                },
                success: {
                    style: {
                        background: '#10b981',
                    },
                },
                error: {
                    style: {
                        background: '#ef4444',
                    },
                },
            }}
        />
    </React.StrictMode>,
)