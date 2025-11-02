import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { postJson } from '@/lib/helper'
import { LogOut, Plus, ArrowRight, UserPlus, LogIn, Copy } from 'lucide-react'

type Message = { userId: string; username: string; text: string; ts: number }

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:5000'
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:5000'

export default function MainChat() {
  const [token, setToken] = useState<string>('')
  const [roomId, setRoomId] = useState('')
  const [joinRoomId, setJoinRoomId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const socketRef = useRef<Socket | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [loginError, setLoginError] = useState(false)
  const [registerError, setRegisterError] = useState(false)
  const [copied, setCopied] = useState(false)
  useEffect(() => {
    const savedToken = localStorage.getItem('token') || ''
    const savedRoomId = localStorage.getItem('roomId') || ''
    if (savedToken) {
      setToken(savedToken)
    }
    if (savedRoomId) {
      setRoomId(savedRoomId)
      setJoinRoomId(savedRoomId)
    }
  }, [])
    
  async function createRoom() {
    const res = await postJson<{ roomId: string }>(`${API_BASE}/api/rooms`, undefined, token)
    setRoomId(res.roomId)
    setJoinRoomId(res.roomId)
    localStorage.setItem('roomId', res.roomId)
  }

  // Socket connection effect
  useEffect(() => {
    if (!token || !roomId) return

    const fetch_message = async () => {
        const res = await fetch(`${API_BASE}/api/rooms/${roomId}/messages?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json() as { messages: { userId: string; username: string; text: string; ts: number }[] }
          setMessages(data.messages)
        }
 
    }
    fetch_message()

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] })
    socketRef.current = socket

    socket.emit('room:join', { roomId })

    socket.on('room:message', (msg: { roomId: string; userId: string; username: string; text: string; ts: number }) => {
      setMessages((m) => [...m, { userId: msg.userId, username: msg.username, text: msg.text, ts: msg.ts }])
    })

    socket.on('user:joined', ({ username }) => {
      setMessages((m) => [...m, { userId: 'system', username: 'system', text: `${username} joined`, ts: Date.now() }])
    })

    socket.on('user:left', ({ username }) => {
      setMessages((m) => [...m, { userId: 'system', username: 'system', text: `${username} left`, ts: Date.now() }])
    })

    return () => { socket.disconnect() }
  }, [token, roomId])
    
  function sendMessage() {
    const text = input.trim()
    if (!text || !socketRef.current || !roomId) return
    socketRef.current.emit('room:message', { roomId, text })
    setInput('')
  }
    
  function leaveRoom() {
    if (!socketRef.current || !roomId) return
    socketRef.current.emit('room:leave', { roomId }, () => {})
    postJson(`${API_BASE}/api/rooms/leave`, { roomId }, token).catch(() => {})
    setMessages([])
    setRoomId('')
    localStorage.removeItem('roomId')
  }

  async function joinRoom() {
    await postJson(`${API_BASE}/api/rooms/join`, { roomId: joinRoomId }, token)
    setRoomId(joinRoomId)
    localStorage.setItem('roomId', joinRoomId)
  }

  const handleLogin = async () => {
    try {
      const data = await postJson<{ token: string; user: { username: string } }>(
        `${API_BASE}/api/auth/login`, 
        { username, password }
      )
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUsername('')
      setPassword('')
    } catch (error) {
      setLoginError(true)
      console.error(error)
    }
  }

  const handleRegister = async () => {
    try {
      const data = await postJson<{ token: string; user: { username: string } }>(
        `${API_BASE}/api/auth/register`, 
        { username, password }
      )
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUsername('')
      setPassword('')
    } catch (error) {
      setRegisterError(true)
      console.error(error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('roomId')
    setToken('')
    setRoomId('')
    setMessages([])
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
  }

  const isAuthed = !!token
  const isInRoom = !!roomId

  return (
    <main className="w-full min-h-screen bg-neutral-900 relative overflow-hidden font-mono">
      {/* Pixel Art Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, #fff 0px, #fff 4px, transparent 4px, transparent 8px),
          repeating-linear-gradient(90deg, #fff 0px, #fff 4px, transparent 4px, transparent 8px)
        `,
        backgroundSize: '32px 32px'
      }}></div>
      
      {/* Pixel Door Decoration */}
   

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl">
          
    

          {/* Main Card */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 shadow-2xl overflow-hidden">
            
            {/* AUTH SCREEN - Show when not authenticated */}
            {!isAuthed ? (
              <div className="p-8">
               
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Username
                    </label>
                    <input 
                      type="text" 
                      placeholder="enter username"
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (isRegister ? handleRegister() : handleLogin())}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-2">
                      Password
                    </label>
                    <input 
                      type="password" 
                      placeholder="enter password"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (isRegister ? handleRegister() : handleLogin())}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-sm px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
                    />
                  </div>

                  <button 
                    onClick={isRegister ? handleRegister : handleLogin}
                    disabled={!username.trim() || !password.trim()}
                    className="w-full cursor-pointer bg-violet-300 hover:bg-violet-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 py-3 rounded-sm transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                  >
                    {isRegister ? (
                      <>
                        <UserPlus className="w-4 h-4" />
                        Register
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        Login
                      </>
                    )}
                    
                  </button>
                  <div className="flex justify-center"> 
                    {loginError &&(
                      <p className="text-red-500 text-sm">Invalid username or password</p>
                    )}
                    {registerError &&(
                      <p className="text-red-500 text-sm">Username already exists</p>
                    )}
                  </div>
                </div>

                {/* Toggle between login/register */}
                <div className="mt-6 text-center">
                  <button 
                    onClick={() => setIsRegister(!isRegister)}
                    className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
                  </button>
                </div>
              </div>
            ) : (
              /* CHAT INTERFACE - Show when authenticated */
              <div>
                {!isInRoom ? (
                  <div className="p-8">
                    {/* User info and logout */}
                    <div className="flex justify-end mb-6">
                      <button 
                        onClick={handleLogout}
                        className="text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-2 text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                    <div className="mb-8">
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-3">
                        Enter Room ID
                      </label>
                      <div className="flex gap-2">
                        <input 
                          value={joinRoomId}
                          onChange={(e) => setJoinRoomId(e.target.value)}
                          type="text" 
                          placeholder="room id"
                          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-sm px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
                          onKeyDown={(e) => e.key === 'Enter' && joinRoom()}
                        />
                        <button 
                          onClick={joinRoom}
                          disabled={!joinRoomId.trim()}
                          className="bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-900 disabled:text-neutral-700 text-neutral-200 px-5 rounded-sm transition-colors duration-200 flex items-center gap-2 border border-neutral-800"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="relative my-8">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-neutral-700"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-neutral-800 px-3 text-neutral-500 tracking-wider">or</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-neutral-400 mb-3">
                        Create New Room
                      </label>
                      <button 
                        onClick={createRoom}
                        className="w-full bg-violet-300 hover:bg-violet-400 text-neutral-900 py-3 rounded-sm transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        New Backroom
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-700">
                      <div className="flex items-center gap-2">
                        
                        <span className="text-xs text-neutral-500 font-mono">{roomId}</span>
                        {copied ?( <span className="text-xs text-neutral-400 font-mono">Copied</span>): (
                             <Copy className="w-3 h-3 text-neutral-400 cursor-pointer mr-3 sm:mr-0" onClick = {()=>{
                              setCopied(true)
                              navigator.clipboard.writeText(roomId)
                              setTimeout(()=>{
                                setCopied(false)
                              }, 2000)
                            }} />
                        )}
                    

                      </div>
                      <button 
                        onClick={leaveRoom}
                        className="text-neutral-400 hover:text-neutral-200 transition-colors p-1"
                        title="Leave room"
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mb-4 h-[61vh] md:h-[66vh] overflow-y-auto space-y-3 scrollbar-hidden px-3">
                      {messages.length === 0 ? (
                        <div className="text-center text-neutral-600 text-sm py-12">
                          No messages yet.
                        </div>
                      ) : (
                        messages.map((msg, i) => (
                          <div key={i} className={msg.userId === 'system' ? 'text-center' : ''}>
                            {msg.userId === 'system' ? (
                              <span className="text-xs text-neutral-600 italic">{msg.text}</span>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-xs text-neutral-500">{msg.username}</div>
                                <div className="text-sm text-neutral-200">{msg.text}</div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        type="text"
                        placeholder="message..."
                        className="flex-1 border border-neutral-800 rounded-sm px-4 py-3 text-neutral-100 placeholder-neutral-600 text-sm focus:outline-none focus:border-violet-500/60 transition-colors"
                      />
                      <button 
                        onClick={sendMessage}
                        disabled={!input.trim()}
                        className="cursor-pointer bg-violet-300 hover:bg-violet-400 disabled:bg-neutral-800 disabled:text-neutral-600 text-neutral-900 p-4 rounded-full transition-colors duration-200"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
    </main>
  )
}