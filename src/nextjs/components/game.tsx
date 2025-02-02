"use client"

import { useState } from "react"

export default function Game() {
  const [count, setCount] = useState(0)

  const handleClick = () => {
    setCount(count + 1)
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="mb-8 w-32 h-32 relative">
        {" "}
        {/* w-64 h-64 から w-32 h-32 に変更 */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          style={{
            transform: `scale(${1 + count * 0.05})`,
            transition: "transform 300ms ease-in-out",
          }}
        >
          <circle cx="50" cy="50" r="45" fill="#FFD700" />
          <circle cx="35" cy="40" r="5" fill="#000" />
          <circle cx="65" cy="40" r="5" fill="#000" />
          <path d="M 35 70 Q 50 80 65 70" stroke="#000" strokeWidth="3" fill="none" />
        </svg>
      </div>
      <button
        onClick={handleClick}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
      >
        {count}
      </button>
      <button
        onClick={() => setCount(0)}
        className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-2 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 shadow-lg"
      >
        リセット
      </button>
    </div>
  )
}

