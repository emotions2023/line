"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { Input } from "@/components/ui/input"
import { sendMessageToDify } from "@/lib/dify"
import { SegmentViewer } from "@/components/segment-viewer"
import { ExternalLink } from "lucide-react"
import { initializeLiff, getLiffUserId, isLoggedIn } from "@/lib/liff"

interface Reference {
  dataset_name: string
  document_name: string
  document_id: string
  segment_id: string
  dataset_id: string
}

interface Message {
  id: string
  text: string
  isUser: boolean
  references?: Reference[]
}

interface SelectedDocument {
  id: string
  name: string
  datasetId: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<SelectedDocument | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        await initializeLiff()
        if (isLoggedIn()) {
          const id = await getLiffUserId()
          setUserId(id)
        }
      } catch (error) {
        console.error("LIFFの初期化に失敗しました", error)
      } finally {
        setIsInitializing(false)
      }
    }

    init()
  }, [])

  const handleLogin = async () => {
    try {
      await getLiffUserId()
      const id = await getLiffUserId()
      setUserId(id)
    } catch (error) {
      console.error("ログインに失敗しました", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !userId) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const result = await sendMessageToDify(input, userId)
      if (result.message) {
        const botMessage: Message = {
          id: Date.now().toString(),
          text: result.message,
          isUser: false,
          references: result.retriever_resources,
        }
        setMessages((prev) => [...prev, botMessage])
      }
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "申し訳ありません。エラーが発生しました。",
        isUser: false,
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDocumentClick = (documentId: string, documentName: string, datasetId: string) => {
    setSelectedDocument({
      id: documentId,
      name: documentName,
      datasetId,
    })
  }

  if (selectedDocument) {
    return (
      <SegmentViewer
        documentId={selectedDocument.id}
        documentName={selectedDocument.name}
        onClose={() => setSelectedDocument(null)}
        datasetId={selectedDocument.datasetId}
      />
    )
  }

  if (isInitializing) {
    return <div className="flex justify-center items-center h-screen">初期化中...</div>
  }

  if (!userId) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="mb-4">LINEアカウントでログインしてください</p>
        <Button onClick={handleLogin}>ログイン</Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {message.text}
              {message.references && message.references.length > 0 && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground font-medium">引用：</p>
                  <ul className="mt-1 space-y-1">
                    {message.references.map((ref, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleDocumentClick(ref.document_id, ref.document_name, ref.dataset_id)}
                          className="text-xs text-primary hover:underline flex items-center gap-2"
                        >
                          <span className="flex-shrink-0">📄</span>
                          <span>{ref.document_name}</span>
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            <Button type="submit" disabled={isLoading} className="bg-[#FFB5B5] text-black">
              {isLoading ? "送信中..." : "送信"}
            </Button>
          </div>
        </form>
      </div>

      <div className="h-16">
        <BottomNav />
      </div>
    </div>
  )
}

