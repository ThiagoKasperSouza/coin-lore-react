import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router';
import './index.css'
import App from './App.jsx'
import Home from './pages/home/Home.jsx'
import CoinMarkets from './pages/markets/Markets.jsx'

// 1. Defina suas rotas em formato de objeto
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "markets", element: <CoinMarkets /> },
      { path: "markets/:id", element: <CoinMarkets /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
