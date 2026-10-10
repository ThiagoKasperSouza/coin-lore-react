import { Outlet, Link } from 'react-router';
import './App.css'

function App() {

  return (
    <>
     <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/markets">Markets</Link>
      </nav>

      <hr />

      {/* O Outlet renderiza a rota filha ativa (Home ou About) */}
      <main>
        <Outlet />
      </main>
    </div>
    </>
  )
}

export default App
