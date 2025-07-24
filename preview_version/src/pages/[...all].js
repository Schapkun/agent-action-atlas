import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const parts = params.all || []
  let filePath = path.join(process.cwd(), 'preview_version', ...parts)

  // Als het een map is, serve index.html binnen die map
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html')
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.notFound()
  }

  const buffer = fs.readFileSync(filePath)
  const ext = path.extname(filePath).slice(1)
  const contentType = {
    js:  'application/javascript',
    css: 'text/css',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
    html:'text/html'
  }[ext] || 'application/octet-stream'

  return new NextResponse(buffer, {
    status: 200,
    headers: { 'Content-Type': contentType }
  })
}
