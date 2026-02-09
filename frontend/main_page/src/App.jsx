import { useState } from 'react'
import SideNav from './components/SideNav' // Import SideNav
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex">
      <SideNav />
      {/* Main content area */}
      <div className="flex-grow p-4 ml-20"> {/* Adjust ml-xx based on retracted nav width */}
        <h1>Welcome to Main Page</h1>
        <p>This is your main content area.</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
    </div>
  )
}

export default App
