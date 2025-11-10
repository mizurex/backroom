import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import { postJson } from '@/lib/helper'
// icons used within child components; none needed directly here
import AuthForm from '@/components/chat/AuthForm'
import RoomGate from '@/components/chat/RoomGate'
import ChatHeader from '@/components/chat/ChatHeader'
import MembersPanel from '@/components/chat/MembersPanel'
import MessagesList from '@/components/chat/MessagesList'
import MessageInput from '@/components/chat/MessageInput'
import type { ChatMessage } from '@/types/chat'
import Header from '@/components/header'
// removed ResetIcon (quote uses lucide-react's Quote icon)

type Message = ChatMessage

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
  const [quoted, setQuoted] = useState<Message | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [typingUsers, setTypingUsers] = useState<Record<string, number>>({})
  const typingTimeoutRef = useRef<number | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement | null>(null)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [membersOpen, setMembersOpen] = useState(false)
  const [members, setMembers] = useState<{ userId: string; username: string }[]>([])
  const membersOpenRef = useRef(false)
  useEffect(() => { membersOpenRef.current = membersOpen }, [membersOpen])
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
    // fetch room info (owner and whether current user is owner)
    const fetch_room_info = async () => {
      const res = await fetch(`${API_BASE}/api/rooms/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const info = await res.json() as { roomId: string; ownerId: string; isOwner: boolean }
        setOwnerId(info.ownerId)
        setIsOwner(info.isOwner)
      } else {
        setOwnerId(null)
        setIsOwner(false)
      }
    }
    fetch_room_info()

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] })
    socketRef.current = socket

    socket.emit('room:join', { roomId })

    socket.on('connect', () => setIsConnected(true))
    socket.on('disconnect', () => setIsConnected(false))

    socket.on('room:message', (msg: { roomId: string; userId: string; username: string; text: string; ts: number }) => {
      setMessages((m) => [...m, { userId: msg.userId, username: msg.username, text: msg.text, ts: msg.ts }])
    })

    socket.on('user:joined', ({ username }) => {
      setMessages((m) => [...m, { userId: 'system', username: 'system', text: `${username} joined`, ts: Date.now() }])
      if (membersOpenRef.current && socketRef.current && roomId) {
        socketRef.current.emit('room:members', { roomId }, (resp: { ownerId: string; members: { userId: string; username: string }[] } | null) => {
          if (resp?.members) setMembers(resp.members)
        })
      }
    })

    socket.on('user:left', ({ username }) => {
      setMessages((m) => [...m, { userId: 'system', username: 'system', text: `${username} left`, ts: Date.now() }])
      if (membersOpenRef.current && socketRef.current && roomId) {
        socketRef.current.emit('room:members', { roomId }, (resp: { ownerId: string; members: { userId: string; username: string }[] } | null) => {
          if (resp?.members) setMembers(resp.members)
        })
      }
    })

    socket.on('user:typing', ({ username, isTyping }: { roomId: string; userId: string; username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = { ...prev }
        if (isTyping) {
          next[username] = Date.now() + 2000
        } else {
          delete next[username]
        }
        return next
      })
    })
    socket.on('user:kicked', ({ roomId: kickedRoom }: { roomId: string }) => {
      if (kickedRoom === roomId) {
        setMessages([])
        setRoomId('')
        localStorage.removeItem('roomId')
      }
    })

    return () => { socket.disconnect() }
  }, [token, roomId])
  
  useEffect(() => {
    const id = window.setInterval(() => {
      setTypingUsers((prev) => {
        const now = Date.now()
        const next: Record<string, number> = {}
        let changed = false
        for (const [name, until] of Object.entries(prev)) {
          if (until > now) next[name] = until
          else changed = true
        }
        return changed ? next : prev
      })
    }, 500)
    return () => window.clearInterval(id)
  }, [])
  
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }, [messages])
    
  function sendMessage() {
    const text = input.trim()
    if (!text || !socketRef.current || !roomId) return
    const finalText = quoted ? `> ${quoted.username}: ${quoted.text}\n${text}` : text
    socketRef.current.emit('room:message', { roomId, text: finalText })
    setInput('')
    setQuoted(null)
  } 
  
  function handleInputChange(value: string) {
    setInput(value)
    if (!socketRef.current || !roomId) return
    socketRef.current.emit('room:typing', { roomId, isTyping: true })
    if (typingTimeoutRef.current) {
      window.clearTimeout(typingTimeoutRef.current)
    }
    typingTimeoutRef.current = window.setTimeout(() => {
      socketRef.current?.emit('room:typing', { roomId, isTyping: false })
      typingTimeoutRef.current = null
    }, 1500)
  }
  // CornerPlus removed (moved styling into components)
    
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

  function quoteMessage(msg: Message) {
    if (msg.userId === 'system') return
    setQuoted(msg)
  }

  function clearQuote() {
    setQuoted(null)
  }

  function kickUser(targetUserId: string) {
    if (!socketRef.current || !roomId) return
    socketRef.current.emit('room:kick', { roomId, targetUserId }, () => {})
  }
  
  function toggleMembers() {
    setMembersOpen((prev) => {
      const next = !prev
      if (next && socketRef.current && roomId) {
        socketRef.current.emit('room:members', { roomId }, (resp: { ownerId: string; members: { userId: string; username: string }[] } | null) => {
          if (resp?.members) setMembers(resp.members)
          if (resp?.ownerId) setOwnerId(resp.ownerId)
        })
      }
      return next
    })
  }

  // parseQuotedText moved into MessagesList component

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
      <Header/>
      {/* Pixel Art Background Pattern */}
      <img src={"/home-bg.png"} alt="background" className="absolute inset-0 mix-blend-screen right-0 object-cover object-right-bottom opacity-70 pointer-events-none" loading="lazy" width={1000} height={1000} />
      
      {/* Pixel Door Decoration */}
   

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-lg">
          
    

          {/* Main Card */}
          <div className=" rounded-lg border border-neutral-800 shadow-2xl overflow-hidden">
            
            {/* AUTH SCREEN - Show when not authenticated */}
            {!isAuthed ? (
              <div className="py-6 sm:px-6">
                <AuthForm
                  username={username}
                  password={password}
                  isRegister={isRegister}
                  loginError={loginError}
                  registerError={registerError}
                  onUsernameChange={setUsername}
                  onPasswordChange={setPassword}
                  onSubmit={isRegister ? handleRegister : handleLogin}
                  onToggleRegister={() => setIsRegister(!isRegister)}
                />
              </div>
            ) : (
              /* CHAT INTERFACE - Show when authenticated */
              <div>
                {!isInRoom ? (
                  <RoomGate
                    joinRoomId={joinRoomId}
                    onJoinRoomIdChange={setJoinRoomId}
                    onJoin={joinRoom}
                    onCreate={createRoom}
                    onLogout={handleLogout}
                  />
                ) : (
                  <div className="p-8 ">
                    <ChatHeader
                      roomId={roomId}
                      copied={copied}
                      isConnected={isConnected}
                      onCopy={() => {
                        setCopied(true)
                        navigator.clipboard.writeText(roomId)
                        setTimeout(() => setCopied(false), 2000)
                      }}
                      onToggleMembers={toggleMembers}
                      onLeave={leaveRoom}
                    />
                    <MembersPanel
                      open={membersOpen}
                      members={members}
                      ownerId={ownerId}
                      isOwner={isOwner}
                      onKick={kickUser}
                      className="mb-2 px-3"
                    />
                    <MessagesList
                      ref={messagesContainerRef as React.MutableRefObject<HTMLDivElement | null>}
                      messages={messages}
                      ownerId={ownerId}
                      onQuote={quoteMessage}
                    />
                    {Object.keys(typingUsers).length > 0 && (
                      <div className="px-3 pb-2 text-xs text-neutral-500">
                        {Object.keys(typingUsers).slice(0, 3).join(', ')} {Object.keys(typingUsers).length > 1 ? 'are' : 'is'} typing...
                      </div>
                    )}
                    <MessageInput
                      input={input}
                      quoted={quoted}
                      onInputChange={handleInputChange}
                      onSend={sendMessage}
                      onClearQuote={clearQuote}
                    />
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