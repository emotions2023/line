import liff from "@line/liff"

export async function initializeLiff(): Promise<void> {
  try {
    await liff.init({ liffId: process.env.NEXT_PUBLIC_LIFF_ID as string })
    if (!liff.isLoggedIn()) {
      await liff.login()
    }
  } catch (error) {
    console.error("LIFFの初期化に失敗しました", error)
    throw error
  }
}

export async function getLiffUserId(): Promise<string> {
  if (!liff.isLoggedIn()) {
    throw new Error("ユーザーがログインしていません")
  }
  const profile = await liff.getProfile()
  return profile.userId
}

