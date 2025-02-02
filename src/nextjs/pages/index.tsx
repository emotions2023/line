import Image from "next/image"
import { Button } from "@/components/ui/button"
import { BottomNav } from "@/components/bottom-nav"

export default function Home() {
  const renderButton = (label: string) => (
    <Button 
      variant="secondary" 
      className="w-full h-12 text-gray-700 bg-white hover:bg-gray-100"
    >
      {label}
    </Button>
  )

  return (
    <main className="min-h-screen bg-[#FFB5B5] flex flex-col items-center px-4">
      <div className="flex-1 w-full max-w-md flex flex-col items-center justify-center gap-6 -mt-20">
        <div className="w-32 h-32 relative">
          <Image 
            src="/img/background-off-squ.svg" 
            alt="Background Image" 
            layout="fill" 
            objectFit="cover" 
          />
        </div>
        <div className="w-full space-y-4">
          {renderButton("しつもんボタン")}
          {renderButton("資料一覧ボタン")}
        </div>
      </div>
      <BottomNav />
    </main>
  )
}