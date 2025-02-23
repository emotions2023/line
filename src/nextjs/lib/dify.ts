// ---------------------------------------------------------
// 環境変数を取得
// ---------------------------------------------------------

// Dify共通のURL
const DIFY_API_URL = process.env.NEXT_PUBLIC_DIFY_API_URL?.replace(/\/$/, "");
const DIFY_MD_API_URL = process.env.NEXT_PUBLIC_DIFY_MD_API_URL;

// ユーザーからの質問へ回答
const DIFY_API_KEY = process.env.NEXT_PUBLIC_DIFY_API_KEY;

// PDF→マークダウンへ変換
const DIFY_MD_API_KEY = process.env.NEXT_PUBLIC_DIFY_MD_API_KEY;

// ナレッジのAPIキー
const DIFY_KNOWLEDGE_API_KEY = process.env.NEXT_PUBLIC_DIFY_KNOWLEDGE_API_KEY;

// ナレッジのdatasetID
const DIFY_KNOWLEDGE_DATASET_ID = process.env.NEXT_PUBLIC_DIFY_DATASETS_ID;


if (!DIFY_API_KEY || !DIFY_API_URL) {
  throw new Error("Dify API configuration is missing");
}

if (!DIFY_KNOWLEDGE_API_KEY) {
  throw new Error("Dify Knowledge API key is missing");
}

if (!DIFY_MD_API_KEY || !DIFY_MD_API_URL) {
  throw new Error("Dify マークダウン変換APIの設定が不足しています");
}

// 既存のDifyResponseインターフェースを更新
export interface DifyResponse {
  message: string
  conversation_id: string | null
  retriever_resources?: {
    dataset_name: string
    document_name: string
    document_id: string
    segment_id: string
    dataset_id: string
  }[]
}


// 参照情報の型定義
export interface RetrieverResource {
  position: number
  dataset_id: string
  dataset_name: string
  document_id: string
  document_name: string
  segment_id: string
  score: number
  content: string
}

interface Message {
  id: string
  role: string
  content: string
  created_at: string
  updated_at: string
  metadata?: any
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  permission: string;
  data_source_type: string;
  indexing_technique: string;
  app_count: number;
  document_count: number;
  word_count: number;
  created_by: string;
  created_at: number;
  updated_by: string;
  updated_at: number;
}

export interface Document {
  id: string;
  position: number;
  data_source_type: string;
  data_source_info: any;
  dataset_process_rule_id: string | null;
  name: string;
  created_from: string;
  created_by: string;
  created_at: number;
  tokens: number;
  indexing_status: string;
  error: string | null;
  enabled: boolean;
  disabled_at: number | null;
  disabled_by: string | null;
  archived: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean;
  limit: number;
  total: number;
  page: number;
}

interface UploadDocumentResponse {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  file_size: number;
  status: string;
  indexing_technique: string;
  process_rule: {
    mode: string;
    rules: {
      pre_processing_rules: Array<{
        id: string;
        enabled: boolean;
      }>;
      segmentation: {
        separator: string;
        max_tokens: number;
      };
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

type UploadResult = {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    status: number;
  };
};

export interface Segment {
  id: string;
  position: number;
  document_id: string;
  content: string;
  answer: string | null;
  word_count: number;
  tokens: number;
  keywords: string[];
  index_node_id: string;
  index_node_hash: string;
  hit_count: number;
  enabled: boolean;
  disabled_at: null | string;
  disabled_by: null | string;
  status: string;
  created_by: string;
  created_at: number;
  updated_at: number;
  updated_by: null | string;
  indexing_at: number;
  completed_at: number;
  error: null | string;
  stopped_at: null | string;
  child_chunks: any[];
}

export interface SegmentsResponse {
  data: Segment[];
  doc_form: string;
  total: number;
}

interface MarkdownConversionResult {
  success: boolean;
  markdown?: string;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

interface FileUploadResponse {
  id: string;
  name: string;
  size: number;
  extension: string;
  mime_type: string;
  created_by: string;
  created_at: number;
}


export async function sendMessageToDify(message: string, userId: string): Promise<DifyResponse> {
  console.log("Difyリクエスト開始:", { message, userId })

  const response = await fetch(`${DIFY_API_URL}/chat-messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: {},
      query: message,
      response_mode: "blocking",
      user: userId,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Dify APIリクエストが失敗しました。ステータス: ${response.status}: ${JSON.stringify(errorData)}`)
  }

  const data = await response.json()
  console.log("Dify API応答:", data)

  return {
    message: data.answer,
    conversation_id: data.conversation_id,
    retriever_resources: data.metadata?.retriever_resources || [],
  }
}

export async function getMessages(conversationId: string, user: string, firstId?: string, limit = 20) {
  const response = await fetch(
    `${DIFY_API_URL}/messages?conversation_id=${conversationId}&user=${user}&first_id=${firstId}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${DIFY_API_KEY}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Failed to fetch messages")
  }

  return response.json()
}

export async function getConversations(user: string, lastId?: string, limit = 20) {
  const response = await fetch(`${DIFY_API_URL}/conversations?user=${user}&last_id=${lastId}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch conversations")
  }

  return response.json()
}

export async function deleteConversation(conversationId: string, user: string) {
  const response = await fetch(`${DIFY_API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${DIFY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user }),
  })

  if (!response.ok) {
    throw new Error("Failed to delete conversation")
  }

  return response.json()
}




export async function getDatasets(page = 1, limit = 20): Promise<PaginatedResponse<Dataset>> {
  const response = await fetch(`https://api.dify.ai/v1/datasets?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch datasets: ${response.status}`);
  }

  return response.json();
}

export async function getDocuments(page = 1, limit = 20): Promise<PaginatedResponse<Document>> {
  const response = await fetch(`https://api.dify.ai/v1/datasets/${DIFY_KNOWLEDGE_DATASET_ID}/documents?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch documents: ${response.status}`);
  }

  return response.json();
}

const errorMessages: { [key: string]: string } = {
  "The capacity of the vector space has reached the limit of your subscription":
    "ストレージの容量制限に達しました。不要なドキュメントを削除してください。",
  "Failed to upload document": "ドキュメントのアップロードに失敗しました",
  "Network error": "ネットワークエラーが発生しました",
  "Dify configuration is missing": "Difyの設定が不足しています",
};

const translateErrorMessage = (message: string): string => {
  // Add your translation logic here if needed
  return message;
};

export async function uploadDocumentToDify(file: File, name: string): Promise<UploadResult> {
  if (!DIFY_KNOWLEDGE_DATASET_ID || !DIFY_KNOWLEDGE_API_KEY) {
    return {
      success: false,
      error: {
        code: "config_error",
        message: "Difyの設定が不足しています",
        status: 500,
      },
    };
  }

  const formData = new FormData();

  const data = {
    name: name,
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
  };

  formData.append("file", file);
  formData.append("data", JSON.stringify(data));

  try {
    const response = await fetch(`https://api.dify.ai/v1/datasets/${DIFY_KNOWLEDGE_DATASET_ID}/document/create-by-file`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
        Accept: "application/json",
      },
      body: formData,
      mode: "cors",
      credentials: "same-origin",
    });

    if (!response.ok) {
      let errorMessage = "アップロードに失敗しました";
      let errorCode = "upload_failed";

      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = translateErrorMessage(errorData.message);
          errorCode = errorData.code || errorCode;
        }
      } catch {
        if (response.status === 0) {
          errorMessage = "ネットワークエラーが発生しました。インターネット接続を確認してください。";
          errorCode = "network_error";
        } else if (response.status === 403) {
          errorMessage = "アクセスが拒否されました。APIキーを確認してください。";
          errorCode = "access_denied";
        }
      }

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          status: response.status,
        },
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: {
        code: "network_error",
        message: "ネットワークエラーが発生しました",
        status: 500,
      },
    };
  }
}

export async function getDocumentSegments(datasetId: string, documentId: string): Promise<SegmentsResponse> {
  if (!DIFY_KNOWLEDGE_API_KEY) {
    throw new Error("Dify Knowledge API key is missing");
  }

  const response = await fetch(`https://api.dify.ai/v1/datasets/${datasetId}/documents/${documentId}/segments`, {
    headers: {
      Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch document segments: ${response.status}`);
  }

  return response.json();
}

// -------------------------------------------------------------------------------------------------------------------
export async function convertAndAddToKnowledgeBase(file: File, fileName: string, datasetId: string): Promise<void> {  
  // ファイルアップロード
  const formData = new FormData()
  formData.append("file", file)
  formData.append("user", "pdf-uploader")

  const uploadResponse = await fetch(`${DIFY_MD_API_URL}/files/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${DIFY_MD_API_KEY}` },
    body: formData,
  })

  if (!uploadResponse.ok) {
    throw new Error(`File upload failed: ${uploadResponse.status}`)
  }

  const { id: fileId } = await uploadResponse.json()

  // チャットメッセージ送信（変換リクエスト）
  const chatResponse = await fetch(`${DIFY_MD_API_URL}/chat-messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIFY_MD_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: "このPDFファイルの内容をマークダウン形式に変換してください。",
      user: "pdf-uploader",
      files: [{ type: "document", transfer_method: "local_file", upload_file_id: fileId }],
      inputs: {},
      response_mode: "blocking",
    }),
  })

  if (!chatResponse.ok) {
    throw new Error(`Conversion request failed: ${chatResponse.status}`)
  }

  const { answer: markdownContent } = await chatResponse.json()

  // ナレッジベースに追加
  const knowledgeResponse = await fetch(
    `${DIFY_API_URL}/datasets/${DIFY_KNOWLEDGE_DATASET_ID}/document/create-by-text`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${DIFY_KNOWLEDGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: fileName,
        text: markdownContent,
        indexing_technique: "high_quality",
        process_rule: { mode: "automatic" },
      }),
    },
  )

  if (!knowledgeResponse.ok) {
    const errorData = await knowledgeResponse.json()
    throw new Error(
      `Failed to add document to knowledge base: ${knowledgeResponse.status} ${JSON.stringify(errorData)}`,
    )
  }

  const data = await knowledgeResponse.json()
  console.log("Document added to knowledge base:", data)
}
