
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './page/home'
import MainChat from './page/main-chat'
import AuthPage from './page/auth'
function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/chat" element={<MainChat />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </BrowserRouter>

)
}

export default App
