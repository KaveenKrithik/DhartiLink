import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import OpenAI from 'openai'

// use 'nodejs' for app-router API that uses fs / native Node libs
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { filename, content } = body
    if (!filename || !content) {
      return NextResponse.json({ ok: false, message: 'Invalid request' }, { status: 400 })
    }

    const fileBuffer = Buffer.from(content, 'base64')

    // try text extraction from PDF (using pdfjs-dist)
    let extractedText = ''
    try {
      extractedText = await extractTextFromPdf(fileBuffer)
    } catch (err) {
      console.error('PDF text extraction failed', err)
      extractedText = ''
    }

    const coord = findCoordinates(extractedText)

    let coordinates = coord
    if (!coordinates) {
      const textForModel = extractedText || `Please extract GPS coordinates from the document: ${filename}`
      const aiExtract = await callGenAIExtract(textForModel)
      coordinates = findCoordinates(aiExtract || '')
    }

    // create a short unique fragment:
    // - if coordinates exist use fragments of lat/lon
    // - otherwise use a short hash of the file
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex').slice(0, 8)
    let frag = fileHash
    if (coordinates) {
      const latStr = String(Math.abs(coordinates.lat)).replace('.', '').slice(0, 6)
      const lonStr = String(Math.abs(coordinates.lon)).replace('.', '').slice(0, 6)
      frag = `${latStr}_${lonStr}`
    }

    const token = `TKN_${Date.now()}_${frag}`

    // persist uploaded file into data/uploads/<token>.pdf
    const uploadsDir = path.join(process.cwd(), 'data', 'uploads')
    await fs.mkdir(uploadsDir, { recursive: true })
    const uploadPath = path.join(uploadsDir, `${token}.pdf`)
    await fs.writeFile(uploadPath, fileBuffer)

    // create nft object (coordinates may be null)
    const nft = {
      id: token,
      sourceFile: filename,
      storagePath: `data/uploads/${token}.pdf`,
      coordinates: coordinates ?? null,
      mintedAt: new Date().toISOString(),
      owner: 'demo-wallet',
    }

    // persist nft list
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })
    const storePath = path.join(dataDir, 'nfts.json')

    let existing: any[] = []
    try {
      const raw = await fs.readFile(storePath, 'utf8')
      existing = JSON.parse(raw)
      if (!Array.isArray(existing)) existing = []
    } catch {
      existing = []
    }

    existing.unshift(nft)
    await fs.writeFile(storePath, JSON.stringify(existing, null, 2), 'utf8')

    // always return the token (and nft)
    return NextResponse.json({ ok: true, message: `Token created: ${token}`, token, nft })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ ok: false, message: 'Server error' }, { status: 500 })
  }
}

function findCoordinates(text: string | undefined | null) {
  if (!text) return null
  const re = /([+-]?\d{1,3}(?:\.\d+)?)[,;\s]+([+-]?\d{1,3}(?:\.\d+)?)/g
  const m = re.exec(text)
  if (!m) return null
  const lat = parseFloat(m[1])
  const lon = parseFloat(m[2])
  if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
    return { lat, lon }
  }
  return null
}

async function callGenAIExtract(text: string) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return ''
    const client = new OpenAI({ apiKey })
    const prompt = `Extract any GPS coordinates (decimal degrees or typical lat/long formats) from the input below. If none found reply with "NO_COORDINATES".\n\n====\n${text}\n====\nReturn only the coordinates or NO_COORDINATES.`
    const resp = await client.responses.create({
      model: 'gpt-4o-mini',
      input: prompt,
      max_output_tokens: 300,
    })
    const output = resp.output?.[0]?.content?.map((c: any) => c.text).join('') ?? ''
    return output
  } catch (err) {
    console.error('GenAI error', err)
    return ''
  }
}

/** new: extract text from PDF using pdfjs-dist (server-side) */
async function extractTextFromPdf(buffer: Buffer) {
  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.js')
    // run without a worker on Node server
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.workerSrc = null

    const loadingTask = pdfjs.getDocument({ data: buffer })
    const doc = await loadingTask.promise
    let fullText = ''
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const strings = content.items.map((s: any) => s.str || '')
      fullText += strings.join(' ') + '\n'
    }
    return fullText
  } catch (err) {
    console.error('extractTextFromPdf error', err)
    return ''
  }
}