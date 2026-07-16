const CLOUD_ENV_KEY = 'cloudEnvId'

interface CloudWx {
  cloud: {
    init(options: { env?: string; traceUser: boolean }): void
    callFunction(options: {
      name: string
      data: Record<string, unknown>
    }): Promise<{ result?: unknown }>
    uploadFile(options: { cloudPath: string; filePath: string }): Promise<{ fileID: string }>
  }
}

const wxApi = (globalThis as typeof globalThis & { wx?: CloudWx }).wx

export function initCloud(): void {
  if (!wxApi?.cloud) return
  wxApi.cloud.init({ env: uni.getStorageSync<string>(CLOUD_ENV_KEY) || undefined, traceUser: true })
}

export function saveCloudEnv(envId: string): void {
  uni.setStorageSync(CLOUD_ENV_KEY, envId.trim())
  initCloud()
}

interface CloudResult<T> {
  ok: boolean
  data?: T
  message?: string
}
export async function callCloud<T>(name: string, data: Record<string, unknown> = {}): Promise<T> {
  if (!wxApi?.cloud) throw new Error('请在微信开发者工具中运行')
  const response = await wxApi.cloud.callFunction({ name, data })
  const result = response.result as CloudResult<T>
  if (!result?.ok || result.data === undefined) throw new Error(result?.message || '服务暂时不可用')
  return result.data
}

export async function uploadImages(paths: string[]): Promise<string[]> {
  return Promise.all(
    paths.map(async (path, index) => {
      const ext = path.split('.').pop() || 'jpg'
      const cloudPath = `items/${Date.now()}-${index}-${Math.random().toString(36).slice(2)}.${ext}`
      if (!wxApi?.cloud) throw new Error('请在微信开发者工具中运行')
      const uploaded = await wxApi.cloud.uploadFile({ cloudPath, filePath: path })
      return uploaded.fileID
    }),
  )
}
