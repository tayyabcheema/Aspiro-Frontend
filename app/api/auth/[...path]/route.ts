import { NextRequest } from 'next/server'
import { getBackendApiUrl } from '@/lib/api-config'

async function proxy(req: NextRequest, { params }: { params: { path: string[] } }) {
  const subpath = (params?.path || []).join('/')
  const url = getBackendApiUrl(`/auth/${subpath}`)

  // Clone headers and strip problematic ones for origin checks
  const headers = new Headers(req.headers)
  headers.delete('host')
  headers.delete('origin')
  headers.delete('referer')
  const xfwd = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
  headers.set('x-forwarded-for', xfwd)

  // Read body safely for non-GET/HEAD
  let body: BodyInit | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const json = await req.json().catch(() => undefined)
      body = json !== undefined ? JSON.stringify(json) : undefined
      headers.set('content-type', 'application/json')
    } else {
      body = await req.text().catch(() => undefined)
    }
  }

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
    redirect: 'manual',
  })

  // Stream response back, preserving status and headers
  const respHeaders = new Headers(res.headers)
  // Ensure CORS is not exposed to browser; we are same-origin
  respHeaders.delete('access-control-allow-origin')
  respHeaders.delete('access-control-allow-credentials')

  const data = await res.arrayBuffer()
  return new Response(data, {
    status: res.status,
    statusText: res.statusText,
    headers: respHeaders,
  })
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE, proxy as OPTIONS }
