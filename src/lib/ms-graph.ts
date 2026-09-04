/**
 * Minimal Microsoft Graph client (app-only / client-credentials flow) used to
 * read and write the guest-list workbook that lives in a colleague's OneDrive
 * for Business. Needs the app registration to have the **application** permission
 * `Files.ReadWrite.All` with admin consent granted.
 */

const GRAPH = 'https://graph.microsoft.com/v1.0'

type GraphConfig = {
  tenantId: string
  clientId: string
  clientSecret: string
  /** UPN of the user whose OneDrive holds the file, e.g. giang.nguyen@bateco.com.vn */
  driveUser: string
  /** Filename (or a distinctive part) to locate the workbook by search. */
  fileName: string
}

export const getGraphConfig = (): GraphConfig => {
  const {
    MS_GRAPH_TENANT_ID,
    MS_GRAPH_CLIENT_ID,
    MS_GRAPH_CLIENT_SECRET,
    MS_GRAPH_DRIVE_USER,
    MS_GRAPH_FILE_NAME,
  } = process.env

  if (!MS_GRAPH_TENANT_ID || !MS_GRAPH_CLIENT_ID || !MS_GRAPH_CLIENT_SECRET) {
    throw new Error('Thiếu MS_GRAPH_TENANT_ID / MS_GRAPH_CLIENT_ID / MS_GRAPH_CLIENT_SECRET.')
  }
  if (!MS_GRAPH_DRIVE_USER) throw new Error('Thiếu MS_GRAPH_DRIVE_USER (email chủ file OneDrive).')
  if (!MS_GRAPH_FILE_NAME) throw new Error('Thiếu MS_GRAPH_FILE_NAME (tên file Excel cần ghi).')

  return {
    tenantId: MS_GRAPH_TENANT_ID,
    clientId: MS_GRAPH_CLIENT_ID,
    clientSecret: MS_GRAPH_CLIENT_SECRET,
    driveUser: MS_GRAPH_DRIVE_USER,
    fileName: MS_GRAPH_FILE_NAME,
  }
}

export const getGraphToken = async (config: GraphConfig): Promise<string> => {
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  })
  const response = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    { method: 'POST', body },
  )
  const json = (await response.json()) as { access_token?: string; error_description?: string }
  if (!response.ok || !json.access_token) {
    throw new Error(`Không lấy được token Microsoft: ${json.error_description ?? response.status}`)
  }
  return json.access_token
}

type GraphFetch = <T>(path: string, init?: RequestInit) => Promise<T>

export const createGraphClient = (token: string): GraphFetch => {
  return async <T>(path: string, init: RequestInit = {}) => {
    const response = await fetch(path.startsWith('http') ? path : `${GRAPH}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
    const text = await response.text()
    const json = text ? JSON.parse(text) : null
    if (!response.ok) {
      const message = json?.error?.message ?? response.statusText
      throw new Error(`Graph ${init.method ?? 'GET'} ${path} → ${response.status}: ${message}`)
    }
    return json as T
  }
}

type DriveItem = { id: string; name: string; webUrl: string }

/** Finds the workbook's driveItem id in the target user's OneDrive by filename search. */
export const findWorkbookItem = async (
  graph: GraphFetch,
  config: GraphConfig,
): Promise<DriveItem> => {
  const query = encodeURIComponent(config.fileName.replace(/\.[^.]+$/, ''))
  const result = await graph<{ value: DriveItem[] }>(
    `/users/${encodeURIComponent(config.driveUser)}/drive/root/search(q='${query}')`,
  )
  const item =
    result.value.find((entry) => entry.name.toLowerCase().endsWith('.xlsx')) ?? result.value[0]
  if (!item) throw new Error(`Không tìm thấy file "${config.fileName}" trong OneDrive.`)
  return item
}

/** Base Graph path for the workbook, e.g. `/users/{u}/drive/items/{id}/workbook`. */
export const workbookBase = (config: GraphConfig, itemId: string): string =>
  `/users/${encodeURIComponent(config.driveUser)}/drive/items/${itemId}/workbook`

/** Column letter for a 0-based column index (0 → A, 26 → AA). */
export const columnLetter = (index: number): string => {
  let result = ''
  let n = index
  do {
    result = String.fromCharCode((n % 26) + 65) + result
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return result
}
