import { useRouter } from "next/router"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"
import { MessageCircle, FileText } from "lucide-react" // アイコンをインポート
import type React from "react" // Added import for React

export default function Home() {
  const router = useRouter()

  const renderButton = (label: string, route: string, icon: React.ReactNode) => (
    <Button
      variant="secondary"
      className="w-64 h-12 text-gray-700 bg-white hover:bg-gray-100 rounded-lg flex items-center gap-2"
      onClick={() => router.push(route)}
    >
      {icon}
      <span>{label}</span>
    </Button>
  )

  return (
    <main className="min-h-screen bg-[#FFB5B5] flex flex-col items-center px-4">
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-12 mt-8">
        <div className="w-48 relative">
          <Image
            src="/img/background-off-squ.svg"
            alt="Background"
            width={500}
            height={300}
            style={{
              maxWidth: "100%",
              height: "auto",
            }}
          />
        </div>
        <div className="w-full flex flex-col items-center space-y-4">
          {renderButton("しつもんボタン", "/chat", <MessageCircle size={20} />)}
          {renderButton("資料一覧ボタン", "/documents", <FileText size={20} />)}
        </div>
      </div>
      <BottomNav />
    </main>
  )
}

