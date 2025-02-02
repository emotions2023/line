const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY
const DIFY_API_URL = process.env.NEXT_PUBLIC_DIFY_API_URL?.replace(/\/$/, "")
const DIFY_KNOWLEDGE_API_KEY = process.env.NEXT_PUBLIC_DIFY_KNOWLEDGE_API_KEY
const DIFY_DATASET_ID = process.env.NEXT_PUBLIC_DIFY_DATASETS_ID

if (!DIFY_API_KEY || !DIFY_API_URL) {
  throw new Error("Dify API configuration is missing")
}

if (!DIFY_KNOWLEDGE_API_KEY) {
    throw new Error("Dify Knowledge API key is missing")
}

// Chat Interfaces
interface DifyResponse {
  message: string
  conversation_id: string | null
}

// Document Interfaces
export interface Dataset {
    id: string
    name: string
    description: string
    permission: string
    data_source_type: string
    indexing_technique: string
    app_count: number
    document_count: number
    word_count: number
    created_by: string
    created_at: number
    updated_by: string
    updated_at: number
  }

export interface Document {
    id: string
    position: number
    data_source_type: string
    data_source_info: any
    dataset_process_rule_id: string | null
    name: string
    created_from: string
    created_by: string
    created_at: number
    tokens: number
    indexing_status: string
    error: string | null
    enabled: boolean
    disabled_at: number | null
    disabled_by: string | null
    archived: boolean
  }

export interface PaginatedResponse<T> {
    data: T[]
    has_more: boolean
    limit: number
    total: number
    page: number
}

export interface UploadDocumentResponse {
  id: string
  document: Document
  batch: string
}

export interface Segment {
  id: string
  position: number
  document_id: string
  content: string
  answer: string | null
  word_count: number
  tokens: number
  keywords: string[]
  index_node_id: string
  index_node_hash: string
  hit_count: number
  enabled: boolean
  disabled_at: null | string
  disabled_by: null | string
  status: string
  created_by: string
  created_at: number
  updated_at: number
  updated_by: null | string
  indexing_at: number
  completed_at: number
  error: null | string
  stopped_at: null | string
  child_chunks: any[]
}

export interface SegmentsResponse {
  data: Segment[]
  doc_form: string
  total: number
}

export async function sendMessageToDify(message: string): Promise<DifyResponse> {
    try {
      const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query: message,
          response_mode: "streaming",
          user: "default-user",
        }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to send message to Dify")
      }
  
      const reader = response.body?.getReader()
      const result: DifyResponse = {
        message: "",
        conversation_id: null,
      }
  
      if (reader) {
        const decoder = new TextDecoder()
        let buffer = ""
  
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
  
          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""
  
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const jsonStr = line.substring(6).trim()
                if (!jsonStr) continue
  
                // 不正なUnicodeエスケープを修正
                const fixedJsonStr = jsonStr.replace(/\\u([0-9A-Fa-f]{4})/g, (match, p1) => {
                  return String.fromCharCode(parseInt(p1, 16))
                })
  
                const data = JSON.parse(fixedJsonStr)
                if (data.event === "message" || data.event === "agent_message") {
                  result.message += data.answer || ""
                  if (data.conversation_id) {
                    result.conversation_id = data.conversation_id
                  }
                }
              } catch (e) {
                console.error("Error parsing line:", line)
                console.error("Parse error:", e)
                continue
              }
            }
          }
        }
      }
  
      return result
    } catch (error) {
      console.error("Error in sendMessageToDify:", error)
      throw error
    }
  }

// Document Functions
export async function getDatasets(page = 1, limit = 20): Promise<PaginatedResponse<Dataset>> {
    const response = await fetch(`https://api.dify.ai/v1/datasets?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
  
    if (!response.ok) {
      throw new Error(`Failed to fetch datasets: ${response.status}`)
    }
  
    return response.json()
  }

  export async function getDocuments(page = 1, limit = 20): Promise<PaginatedResponse<Document>> {
    const response = await fetch(`https://api.dify.ai/v1/datasets/${DIFY_DATASET_ID}/documents?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
        "Content-Type": "application/json",
      },
    })
  
    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.status}`)
    }
  
    return response.json()
  }
  
  export async function uploadDocumentToDify(file: File, name: string): Promise<UploadDocumentResponse> {
    if (!DIFY_DATASET_ID || !DIFY_KNOWLEDGE_API_KEY) {
      throw new Error("Dify configuration is missing")
    }
  
    const formData = new FormData()
  
    // APIリクエストのパラメータを設定
    const data = {
      indexing_technique: "high_quality",
      process_rule: {
        mode: "custom",
        rules: {
          pre_processing_rules: [
            {
              id: "remove_extra_spaces",
              enabled: true,
            },
            {
              id: "remove_urls_emails",
              enabled: true,
            },
          ],
          segmentation: {
            separator: "\n",
            max_tokens: 500,
          },
        },
      },
      retrieval_model: {
        search_method: "hybrid_search", // ハイブリッド検索を使用
        reranking_enable: true, // リランキングを有効化
        top_k: 10, // 上位10件の結果を返す
        score_threshold_enabled: true, // スコアしきい値を有効化
        score_threshold: 0.5, // しきい値を0.5に設定
      },
    }
  
    formData.append("data", JSON.stringify(data))
    formData.append("file", file)
  
    const response = await fetch(`https://api.dify.ai/v1/datasets/${DIFY_DATASET_ID}/document/create-by-file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
      },
      body: formData,
    })
  
    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.status}`)
    }
  
    return response.json()
  }
  
  
// セグメント取得関数
export async function getDocumentSegments(datasetId: string, documentId: string): Promise<SegmentsResponse> {
  if (!DIFY_KNOWLEDGE_API_KEY) {
    throw new Error("Dify Knowledge API key is missing")
  }

  const response = await fetch(`https://api.dify.ai/v1/datasets/${datasetId}/documents/${documentId}/segments`, {
    headers: {
      Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch document segments: ${response.status}`)
  }

  return response.json()
}

