"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { sendMessageToDify } from "@/lib/dify"

interface Message {
  id: string
  text: string
  isUser: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await sendMessageToDify(input)
      if (result.message) {
        setMessages((prev) => [...prev, { id: Date.now().toString(), text: result.message, isUser: false }])
      }
    } catch (error) {
      console.error("Error:", error)
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), text: "申し訳ありません。エラーが発生しました。", isUser: false },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold">AIチャット</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted max-w-[80%] p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t bg-background">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "送信中..." : "送信"}
            </Button>
          </div>
        </form>
      </div>

      <div className="h-16">
        {" "}
        {/* BottomNavの高さ分のスペーサー */}
        <BottomNav />
      </div>
    </div>
  )
}

