"use client"

import { useState, useEffect } from "react"
import type { AppProps } from "next/app"
import { inter } from "@/styles/fonts"
import "@/styles/globals.css"
import liff from "@line/liff"

export default function MyApp({ Component, pageProps }: AppProps) {
  const [liffObject, setLiffObject] = useState<typeof liff | null>(null)
  const [liffError, setLiffError] = useState<string | null>(null)

  useEffect(() => {
    console.log("start liff.init()...")
    liff
      .init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID as string })
      .then(() => {
        console.log("liff.init() done")
        setLiffObject(liff)
      })
      .catch((error: Error) => {
        console.log(`liff.init() failed: ${error}`)
        if (!process.env.NEXT_PUBLIC_LIFF_ID) {
          console.info(
            "LIFF Starter: Please make sure that you provided `NEXT_PUBLIC_LIFF_ID` as an environmental variable.",
          )
        }
        setLiffError(error.toString())
      })
  }, [])

  const enhancedPageProps = {
    ...pageProps,
    liff: liffObject,
    liffError: liffError,
  }

  return (
    <div className={`${inter.variable} font-sans`}>
      <Component {...enhancedPageProps} />
    </div>
  )
}

