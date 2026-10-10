import { Outlet, Link } from 'react-router';
import './App.css'

function App() {

  return (
    <>
      {/* O Outlet renderiza a rota filha ativa (Home ou About) */}
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default App
