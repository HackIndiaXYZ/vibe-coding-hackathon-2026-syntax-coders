'use client'
import { useState } from 'react'

type Message = {
  role: 'user' | 'ai'
  text: string
}

export default function ChatPage() {
  const [message, setMessage] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  async function sendMessage() {
    if (!message.trim()) return

    const userMessage = message.trim()
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, symptoms })
      })

      const data = await res.json()

      if (data.success) {
        setMessages(prev => [...prev, { role: 'ai', text: data.reply }])
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Could not connect. Check your internet and try again.' }])
    }

    setLoading(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <h1 className="text-xl font-bold text-blue-600">LifeLink</h1>
        <p className="text-xs text-gray-400">AI health assistant · Not a substitute for a real doctor</p>
      </div>

      {/* Symptoms bar */}
      <div className="bg-blue-50 border-b border-blue-100 px-6 py-3">
        <label className="text-xs font-medium text-blue-600 block mb-1">
          Current symptoms (optional — helps AI give better answers)
        </label>
        <input
          type="text"
          className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="e.g. fever, headache, fatigue for 2 days"
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
        />
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center mt-16">
            <div className="text-4xl mb-4">🩺</div>
            <p className="text-gray-500 font-medium">How can I help you today?</p>
            <p className="text-gray-400 text-sm mt-1">Ask about symptoms, medications, or health reports</p>

            {/* Quick prompts */}
            <div className="mt-6 flex flex-col gap-2 max-w-sm mx-auto">
              {[
                'I have a headache and fever since yesterday',
                'What does high creatinine in blood report mean?',
                'I feel very tired all the time, what could it be?'
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setMessage(prompt)}
                  className="text-sm text-left px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
                AI
              </div>
            )}
            <div
              className={`max-w-xs md:max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Loading bubble */}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
              AI
            </div>
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-sm">
              <div className="flex gap-1 items-center h-4">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'150ms'}}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex gap-3 items-end max-w-3xl mx-auto">
          <textarea
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 max-h-32"
            placeholder="Type your health question... (Enter to send)"
            rows={1}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white px-5 py-3 rounded-xl font-medium text-sm transition-colors flex-shrink-0"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-gray-300 mt-2">
          Always consult a qualified doctor for medical advice
        </p>
      </div>

    </div>
  )
}