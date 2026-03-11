#!/usr/bin/env node
import {createClient} from '@sanity/client'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  const preferDotenvKeys = new Set(['APPS_SCRIPT_URL'])
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const eq = trimmed.indexOf('=')
    if (eq <= 0) continue

    const key = trimmed.slice(0, eq).trim()
    if (!key) continue
    if (process.env[key] !== undefined && !preferDotenvKeys.has(key)) continue

    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    process.env[key] = value
  }
}
loadEnvFile()

const APPS_SCRIPT_URL =
  process.env.APPS_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbxWN-9Jo818-tk-i4OjegDIZclZ7h5zZLU9ME56HPFfABZhij5VXlDRZsIohrDOBNwV/exec'

const SANITY_PROJECT_ID = process.env.SANITY_PROJECT_ID
const SANITY_DATASET = process.env.SANITY_DATASET
const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN
const FORCE_IMAGES = process.argv.includes('--force-images')
const APPS_SCRIPT_BASE_URL = APPS_SCRIPT_URL.split('?')[0]
const DEFAULT_PDF_PATH = '/cookbook.pdf'
const PDF_PAGE_OFFSET = 6

if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_WRITE_TOKEN) {
  throw new Error(
    'Missing required env vars: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_WRITE_TOKEN'
  )
}

if (APPS_SCRIPT_URL.includes('REPLACE_WITH_YOUR_DEPLOYMENT_ID')) {
  throw new Error('Set APPS_SCRIPT_URL to your Apps Script /exec endpoint URL before running.')
}

function assertAppsScriptExecUrl(urlValue) {
  let parsed
  try {
    parsed = new URL(urlValue)
  } catch {
    throw new Error('APPS_SCRIPT_URL must be a valid URL')
  }

  const host = parsed.hostname.toLowerCase()
  const path = parsed.pathname.toLowerCase()
  const full = `${host}${path}`

  if (full.includes('googleusercontent.com/macros/echo')) {
    throw new Error('APPS_SCRIPT_URL must use script.google.com/.../exec, not googleusercontent.com/macros/echo')
  }
  if (host !== 'script.google.com') {
    throw new Error('APPS_SCRIPT_URL must use script.google.com host')
  }
  if (!path.endsWith('/exec')) {
    throw new Error('APPS_SCRIPT_URL must be a web app deployment /exec URL')
  }
}
assertAppsScriptExecUrl(APPS_SCRIPT_BASE_URL)

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_WRITE_TOKEN,
  apiVersion: '2025-01-01',
  useCdn: false,
})

function slugify(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96)
}

function normalizeTitle(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function parseNumber(raw, {integer = false} = {}) {
  if (raw === undefined || raw === null) return null
  const text = String(raw).trim()
  if (!text) return null
  const match = text.match(/-?\d+(?:\.\d+)?/)
  const value = match ? Number(match[0]) : Number(text)
  if (!Number.isFinite(value)) return null
  return integer ? Math.trunc(value) : value
}

function parseSpoonLevel(raw) {
  const value = parseNumber(raw, {integer: true})
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.min(5, value))
}

function cleanUrl(value = '') {
  return String(value || '')
    .trim()
    .replace(/[>\],.;:!?]+$/g, '')
}

function extractFirstUrl(value = '') {
  const match = String(value).match(/https?:\/\/[^\s)]+/i)
  return match?.[0] ? cleanUrl(match[0]) : ''
}

function extractVoiceNoteUrlFromDocText(docText = '') {
  const lines = String(docText || '')
    .split(/\r?\n/)
    .map((line) => String(line || '').trim())
    .filter(Boolean)

  if (!lines.length) return ''

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    if (!/^voice\s*note\s*:/i.test(line)) continue

    const inline = extractFirstUrl(line)
    if (inline) return inline

    for (let j = i + 1; j < Math.min(i + 4, lines.length); j += 1) {
      const nearby = extractFirstUrl(lines[j])
      if (nearby) return nearby
    }
  }

  return ''
}

function pickFirstNonEmpty(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue
    const text = cleanUrl(value)
    if (text) return text
  }
  return ''
}

function firstArray(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value
  }
  return []
}

function stripMaybeHeaderRows(rows) {
  return rows.filter((row) => {
    const title = pickFirstNonEmpty(row?.title, row?.recipeName, row?.name)
    return title && !/^(recipe name|title)$/i.test(title)
  })
}

function toWebsiteRow(row) {
  const title = pickFirstNonEmpty(row?.title, row?.recipeName, row?.name)
  const pageStart = parseNumber(
    row?.pageStart ??
      row?.pagestart ??
      row?.page_start ??
      row?.['page start'] ??
      row?.['page start '] ??
      row?.['page start?'],
    {integer: true}
  )
  const pageEnd = parseNumber(
    row?.pageEnd ??
      row?.pageend ??
      row?.page_end ??
      row?.['page end'] ??
      row?.['page end '] ??
      row?.['page end?'],
    {integer: true}
  )
  const spoonLevel = parseSpoonLevel(row?.spooniverse ?? row?.spoonLevel ?? row?.spoon)

  return {
    type: pickFirstNonEmpty(row?.type),
    title,
    spoonLevel,
    pageStart,
    pageEnd,
    voiceNoteUrl: pickFirstNonEmpty(
      row?.voicenote,
      row?.['voicenote?'],
      row?.voiceNote,
      row?.voiceNoteUrl
    ),
    videoUrl: pickFirstNonEmpty(row?.video, row?.['video?'], row?.videoUrl),
  }
}

function toRecipeRow(row) {
  const contentText = pickFirstNonEmpty(row?.docText)
  const voiceNoteUrl = extractVoiceNoteUrlFromDocText(contentText)

  return {
    title: pickFirstNonEmpty(row?.recipeName, row?.title, row?.name),
    chef: pickFirstNonEmpty(row?.chef),
    spoonLevel: parseSpoonLevel(row?.spoonLevel ?? row?.spooniverse),
    docUrl: pickFirstNonEmpty(row?.docUrl),
    contentText,
    voiceNoteUrl,
    imageUrl: pickFirstNonEmpty(row?.imageUrl),
    imageFileId: pickFirstNonEmpty(row?.imageFileId),
  }
}

function buildEndpoint(mode, params = {}) {
  const url = new URL(APPS_SCRIPT_BASE_URL)
  url.searchParams.set('mode', mode)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim()) {
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

async function fetchJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Apps Script request failed for ${url}: HTTP ${response.status}`)
  }
  return response.json()
}

async function fetchRows() {
  const websiteUrl = buildEndpoint('website')
  const recipesUrl = buildEndpoint('recipes', {
    includeDocs: 'true',
    docFormat: 'text',
  })

  const [websiteJson, recipesData] = await Promise.all([
    fetchJson(websiteUrl),
    fetchJson(recipesUrl),
  ])

  let websiteRowsRaw = Array.isArray(websiteJson?.rows) ? websiteJson.rows : []
  const websiteCount = Number(websiteJson?.count)
  const websiteKeyList = Object.keys(websiteJson || {})

  if (websiteRowsRaw.length === 0) {
    const fallback = firstArray(websiteJson?.website, websiteJson?.recipes, websiteJson?.items)
    if (fallback.length) {
      websiteRowsRaw = fallback
      console.warn(
        `[WARN] mode=website returned non-standard payload; using fallback array key from: ${websiteKeyList.join(', ')}`
      )
    }
  }

  if (Number.isFinite(websiteCount) && websiteCount !== websiteRowsRaw.length) {
    const fallback = firstArray(websiteJson?.website, websiteJson?.recipes, websiteJson?.items)
    if (fallback.length === websiteCount) {
      websiteRowsRaw = fallback
      console.warn(
        `[WARN] website count mismatch on rows[]; using fallback array that matches count (${websiteCount})`
      )
    } else {
      console.error(
        `[ERROR] website count mismatch: count=${websiteCount}, rows.length=${websiteRowsRaw.length}`
      )
      console.error(`[ERROR] website response keys: ${websiteKeyList.join(', ')}`)
      throw new Error('Website payload invalid: count does not match rows.length')
    }
  }

  const recipeRowsRaw = firstArray(recipesData?.recipes, recipesData?.rows, recipesData?.items)

  const websiteRows = stripMaybeHeaderRows(websiteRowsRaw).map(toWebsiteRow).filter((row) => row.title)
  const recipeRows = stripMaybeHeaderRows(recipeRowsRaw).map(toRecipeRow).filter((row) => row.title)
  const hasAnyWebsitePageRange = websiteRows.some((row) => {
    const start = Number(row?.pageStart)
    const end = Number(row?.pageEnd)
    return (Number.isFinite(start) && start > 0) || (Number.isFinite(end) && end > 0)
  })

  if (websiteRows.length > 0 && !hasAnyWebsitePageRange) {
    throw new Error(
      `mode=website did not return usable pageStart/pageEnd values. ` +
        `This /exec deployment is likely running old Apps Script code. ` +
        `Redeploy the latest doc-export.gs (with handleWebsiteMode) and update APPS_SCRIPT_URL. ` +
        `Current website URL: ${websiteUrl.toString()}`
    )
  }

  return {
    websiteRows,
    websiteCount: Number.isFinite(websiteCount) ? websiteCount : null,
    recipeRows,
    websiteUrl: websiteUrl.toString(),
    recipesUrl: recipesUrl.toString(),
  }
}

function indexRowsByNormalizedTitle(rows, label) {
  const byTitle = new Map()

  for (const row of rows) {
    const key = normalizeTitle(row?.title)
    if (!key) continue
    if (byTitle.has(key)) {
      console.warn(`[WARN] duplicate ${label} title after normalization: "${row.title}" (keeping first)`)
      continue
    }
    byTitle.set(key, row)
  }

  return byTitle
}

function extractDriveFileId(urlOrId) {
  if (!urlOrId) return null
  const value = cleanUrl(urlOrId)
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value) && value.indexOf('http') !== 0) {
    return value
  }

  const patterns = [
    /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/u\/\d+\/file\/d\/([a-zA-Z0-9_-]+)(?:\/|$)/,
    /drive\.google\.com\/uc\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/thumbnail\?[^#]*[?&]id=([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ]

  for (const pattern of patterns) {
    const match = value.match(pattern)
    if (match?.[1]) return match[1]
  }

  return null
}

function filenameFromUrl(url) {
  try {
    const u = new URL(url)
    const pathname = u.pathname || ''
    const part = pathname.split('/').filter(Boolean).pop()
    if (part && /\.[a-zA-Z0-9]{2,8}$/.test(part)) return part
  } catch {
    // no-op
  }
  return `recipe-cover-${Date.now()}.jpg`
}

function extensionFromContentType(contentType = '', fallback = 'bin') {
  const normalized = String(contentType || '').toLowerCase().split(';')[0].trim()
  const map = {
    'audio/mpeg': 'mp3',
    'audio/mp3': 'mp3',
    'audio/wav': 'wav',
    'audio/x-wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/mp4': 'm4a',
    'audio/x-m4a': 'm4a',
    'audio/aac': 'aac',
    'audio/flac': 'flac',
    'audio/x-flac': 'flac',
    'audio/webm': 'webm',
    'application/octet-stream': fallback,
  }
  return map[normalized] || fallback
}

function detectAudioContentTypeFromFilename(filename = '') {
  const lower = String(filename || '').toLowerCase()
  if (/\.(mp3)(?:$|\?)/.test(lower)) return 'audio/mpeg'
  if (/\.(m4a)(?:$|\?)/.test(lower)) return 'audio/mp4'
  if (/\.(wav)(?:$|\?)/.test(lower)) return 'audio/wav'
  if (/\.(ogg)(?:$|\?)/.test(lower)) return 'audio/ogg'
  if (/\.(aac)(?:$|\?)/.test(lower)) return 'audio/aac'
  if (/\.(flac)(?:$|\?)/.test(lower)) return 'audio/flac'
  if (/\.(webm)(?:$|\?)/.test(lower)) return 'audio/webm'
  return 'audio/mpeg'
}

function ensureFilenameExtension(filename, contentType, fallbackBase) {
  const trimmed = String(filename || '').trim()
  if (trimmed && /\.[a-zA-Z0-9]{2,8}$/.test(trimmed)) return trimmed
  const ext = extensionFromContentType(contentType, 'bin')
  const base = trimmed || fallbackBase
  return `${base}.${ext}`
}

function buildFileProxyUrl({fileId, url} = {}) {
  if (fileId) {
    return `${APPS_SCRIPT_BASE_URL}?mode=file&fileId=${encodeURIComponent(fileId)}`
  }
  if (url) {
    return `${APPS_SCRIPT_BASE_URL}?mode=file&url=${encodeURIComponent(url)}`
  }
  throw new Error('Missing fileId/url for proxy request')
}

function createImageKey() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 12)
}

function hasCoverImage(doc) {
  return Boolean(doc?.coverImage?.asset?._ref)
}

function hasVoiceNoteFile(doc) {
  return Boolean(doc?.voiceNote?.asset?._ref)
}

async function fetchExistingRecipe(recipeId) {
  return client.fetch(
    `*[_id == $id][0]{
      _id,
      coverImage{asset},
      voiceNote{asset}
    }`,
    {id: recipeId}
  )
}

function isAcceptedAudioLikeType(contentType = '', filename = '') {
  const normalizedType = String(contentType || '').toLowerCase().split(';')[0]
  if (!normalizedType) return false
  if (normalizedType.startsWith('audio/')) return true
  if (normalizedType === 'application/octet-stream') return true
  if (normalizedType === 'video/mp4') return true

  const lowerName = String(filename || '').toLowerCase()
  return /\.(mp3|m4a|wav|ogg|aac|flac|webm)(?:$|\?)/.test(lowerName)
}

async function downloadImagePayload({imageUrl, imageFileId}) {
  const directUrl = String(imageUrl || '').trim()
  const driveId = String(imageFileId || '').trim() || extractDriveFileId(directUrl)

  if (driveId) {
    const proxyUrl = buildFileProxyUrl(driveId)
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error(`proxy download failed: HTTP ${response.status}`)
    }

    const contentTypeRaw = String(response.headers.get('content-type') || '').toLowerCase()

    if (contentTypeRaw.includes('application/json')) {
      const payload = await response.json()
      if (!payload?.ok) {
        throw new Error(`proxy returned error JSON: ${payload?.error || 'unknown error'}`)
      }

      const payloadType = String(payload?.contentType || '').toLowerCase()
      if (!payloadType.startsWith('image/')) {
        throw new Error(`proxy JSON contentType is not image/* (${payloadType || 'missing'})`)
      }

      if (!payload?.dataBase64) {
        throw new Error('proxy JSON missing dataBase64')
      }

      return {
        buffer: Buffer.from(payload.dataBase64, 'base64'),
        contentType: payloadType.split(';')[0] || 'image/jpeg',
        filename: String(payload?.filename || '').trim() || filenameFromUrl(directUrl),
      }
    }

    if (!contentTypeRaw.startsWith('image/')) {
      throw new Error(`proxy response content-type is not image/* (${contentTypeRaw || 'missing'})`)
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: contentTypeRaw.split(';')[0] || 'image/jpeg',
      filename: filenameFromUrl(directUrl),
    }
  }

  if (!directUrl) {
    throw new Error('no image URL provided')
  }

  const response = await fetch(directUrl)
  if (!response.ok) {
    throw new Error(`image download failed: HTTP ${response.status}`)
  }

  const contentTypeRaw = String(response.headers.get('content-type') || '').toLowerCase()
  if (!contentTypeRaw.startsWith('image/')) {
    throw new Error(`image content-type is not image/* (${contentTypeRaw || 'missing'})`)
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: contentTypeRaw.split(';')[0] || 'image/jpeg',
    filename: filenameFromUrl(directUrl),
  }
}

async function uploadCoverImage(recipeId, row, existingRecipe) {
  if (!row?.imageUrl && !row?.imageFileId) {
    return {uploaded: false, reason: 'skipped (no imageUrl)'}
  }

  if (hasCoverImage(existingRecipe) && !FORCE_IMAGES) {
    return {uploaded: false, reason: 'skipped (coverImage exists)'}
  }

  const payload = await downloadImagePayload(row)
  const asset = await client.assets.upload('image', payload.buffer, {
    filename: payload.filename,
    contentType: payload.contentType,
  })

  await client
    .patch(recipeId)
    .set({
      coverImage: {
        _type: 'image',
        _key: createImageKey(),
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
    })
    .commit()

  return {uploaded: true, reason: 'uploaded'}
}

async function downloadAudioPayload(voiceNoteUrl) {
  const directUrl = String(voiceNoteUrl || '').trim()
  const driveId = extractDriveFileId(directUrl)

  if (driveId || /drive\.google\.com/i.test(directUrl)) {
    const proxyUrl = buildFileProxyUrl({fileId: driveId, url: directUrl})
    const response = await fetch(proxyUrl)
    if (!response.ok) {
      throw new Error(`proxy download failed: HTTP ${response.status}`)
    }

    const contentTypeRaw = String(response.headers.get('content-type') || '').toLowerCase()

    if (contentTypeRaw.includes('application/json')) {
      const payload = await response.json()
      if (!payload?.ok) {
        throw new Error(`proxy returned error JSON: ${payload?.error || 'unknown error'}`)
      }

      const payloadType = String(payload?.contentType || '').toLowerCase().split(';')[0]
      const payloadFilename = String(payload?.filename || '').trim() || filenameFromUrl(directUrl)
      if (!isAcceptedAudioLikeType(payloadType, payloadFilename)) {
        throw new Error(`proxy JSON contentType is not audio/* (${payloadType || 'missing'})`)
      }

      if (!payload?.dataBase64) {
        throw new Error('proxy JSON missing dataBase64')
      }

      return {
        buffer: Buffer.from(payload.dataBase64, 'base64'),
        contentType: payloadType || detectAudioContentTypeFromFilename(payloadFilename),
        filename: ensureFilenameExtension(
          payloadFilename,
          payloadType || detectAudioContentTypeFromFilename(payloadFilename),
          `voice-note-${Date.now()}`
        ),
      }
    }

    const normalizedType = contentTypeRaw.split(';')[0]
    const rawFilename = filenameFromUrl(directUrl)
    if (!isAcceptedAudioLikeType(normalizedType, rawFilename)) {
      throw new Error(`proxy response content-type is not audio/* (${contentTypeRaw || 'missing'})`)
    }

    return {
      buffer: Buffer.from(await response.arrayBuffer()),
      contentType: normalizedType || detectAudioContentTypeFromFilename(rawFilename),
      filename: ensureFilenameExtension(rawFilename, normalizedType || detectAudioContentTypeFromFilename(rawFilename), `voice-note-${Date.now()}`),
    }
  }

  if (!directUrl) {
    throw new Error('no voice note URL provided')
  }

  const response = await fetch(directUrl)
  if (!response.ok) {
    throw new Error(`audio download failed: HTTP ${response.status}`)
  }

  const contentTypeRaw = String(response.headers.get('content-type') || '').toLowerCase()
  const normalizedType = contentTypeRaw.split(';')[0]
  const directFilename = filenameFromUrl(directUrl)
  if (!isAcceptedAudioLikeType(normalizedType, directFilename)) {
    throw new Error(`audio content-type is not audio/* (${contentTypeRaw || 'missing'})`)
  }

  return {
    buffer: Buffer.from(await response.arrayBuffer()),
    contentType: normalizedType || detectAudioContentTypeFromFilename(directFilename),
    filename: ensureFilenameExtension(directFilename, normalizedType || detectAudioContentTypeFromFilename(directFilename), `voice-note-${Date.now()}`),
  }
}

async function uploadVoiceNoteFile(recipeId, voiceNoteUrl, existingRecipe) {
  if (!voiceNoteUrl) {
    return {uploaded: false, reason: 'skipped (no voiceNoteUrl)'}
  }

  if (hasVoiceNoteFile(existingRecipe)) {
    return {uploaded: false, reason: 'skipped (voiceNote exists)'}
  }

  const payload = await downloadAudioPayload(voiceNoteUrl)
  const asset = await client.assets.upload('file', payload.buffer, {
    filename: payload.filename,
    contentType: payload.contentType,
  })

  await client
    .patch(recipeId)
    .set({
      voiceNote: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
    })
    .commit()

  return {uploaded: true, reason: 'uploaded'}
}

function cleanPatch(values) {
  const next = {}
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined) next[key] = value
  }
  return next
}

async function syncWebsiteRecipeRow(websiteRow, recipeByTitle) {
  const normalized = normalizeTitle(websiteRow.title)
  const recipeRow = recipeByTitle.get(normalized)
  const voiceNoteUrl = pickFirstNonEmpty(recipeRow?.voiceNoteUrl, websiteRow?.voiceNoteUrl) || undefined

  const slug = slugify(websiteRow.title)
  if (!slug) {
    console.log(`[SKIP] invalid slug: ${websiteRow.title}`)
    return
  }

  let pageStart = parseNumber(websiteRow.pageStart, {integer: true})
  let pageEnd = parseNumber(websiteRow.pageEnd, {integer: true})
  if (!Number.isFinite(pageStart) || !Number.isFinite(pageEnd) || pageStart < 1 || pageEnd < 1) {
    console.log('[SKIP] website row invalid page range')
    return
  }
  if (pageStart > pageEnd) {
    ;[pageStart, pageEnd] = [pageEnd, pageStart]
  }
  const rawPageStart = pageStart
  const rawPageEnd = pageEnd
  pageStart += PDF_PAGE_OFFSET
  pageEnd += PDF_PAGE_OFFSET

  const recipeId = `recipe-${slug}`
  const spoonLevel = Number.isFinite(websiteRow.spoonLevel)
    ? websiteRow.spoonLevel
    : parseSpoonLevel(recipeRow?.spoonLevel)

  const patch = cleanPatch({
    _type: 'recipe',
    title: websiteRow.title,
    slug: {_type: 'slug', current: slug},
    websiteListed: true,
    spoonLevel,
    pageStart,
    pageEnd,
    chef: pickFirstNonEmpty(recipeRow?.chef) || 'misery collective',
    docUrl: pickFirstNonEmpty(recipeRow?.docUrl) || undefined,
    contentText: pickFirstNonEmpty(recipeRow?.contentText) || undefined,
    pdfPath: DEFAULT_PDF_PATH,
    voiceNoteUrl,
    sourceUrl: websiteRow.videoUrl || undefined,
    extras: websiteRow.type || undefined,
  })

  await client
    .transaction()
    .createIfNotExists({_id: recipeId, _type: 'recipe'})
    .patch(recipeId, (p) => p.set(patch))
    .commit()

  const existingRecipe = await fetchExistingRecipe(recipeId)
  if (recipeRow) {
    try {
      await uploadCoverImage(recipeId, recipeRow, existingRecipe)
    } catch {
      // Keep sync resilient when image uploads fail.
    }
  }
  try {
    await uploadVoiceNoteFile(recipeId, voiceNoteUrl, existingRecipe)
  } catch {
    // Keep sync resilient when voice note uploads fail.
  }

  const docImported = Boolean(pickFirstNonEmpty(recipeRow?.contentText))
  console.log(
    `[SYNC] ${websiteRow.title}\npages(raw): ${rawPageStart}\u2013${rawPageEnd}\npages(saved): ${pageStart}\u2013${pageEnd}\nspoons: ${spoonLevel}\ndocTextImported: ${docImported}`
  )
  return recipeId
}

async function syncWebsiteListedFlags(activeRecipeIds) {
  const ids = Array.isArray(activeRecipeIds) ? activeRecipeIds : []
  const inactiveIds = await client.fetch(`*[_type=="recipe" && !(_id in $ids)]._id`, {ids})
  if (!Array.isArray(inactiveIds) || !inactiveIds.length) return

  let tx = client.transaction()
  let count = 0

  for (const id of inactiveIds) {
    tx = tx.patch(id, (p) => p.set({websiteListed: false}))
    count += 1
    if (count % 150 === 0) {
      // eslint-disable-next-line no-await-in-loop
      await tx.commit()
      tx = client.transaction()
    }
  }

  if (count % 150 !== 0) {
    await tx.commit()
  }
}

async function main() {
  const {websiteRows, websiteCount, recipeRows, websiteUrl, recipesUrl} = await fetchRows()
  const websiteRecipeRows = websiteRows.filter((row) => {
    const type = String(row?.type || '').trim().toLowerCase()
    return type === 'recipe'
  })
  const recipeByTitle = indexRowsByNormalizedTitle(recipeRows, 'sheet1')

  console.log(`Loaded ${websiteRows.length} website row(s) from ${websiteUrl}`)
  console.log(`Website recipe rows used for sync: ${websiteRecipeRows.length}`)
  console.log(`Website reported count: ${websiteCount ?? 'n/a'}`)
  console.log(`Website parsed rows.length: ${websiteRows.length}`)
  if (websiteRows.length > 0) {
    console.log('[DEBUG] website row sample', websiteRows[0])
  }
  if (websiteRows.length > 1) {
    console.log('[DEBUG] website row sample', websiteRows[1])
  }
  if (websiteRows.length > 2) {
    console.log('[DEBUG] website row sample', websiteRows[2])
  }
  console.log(`Loaded ${recipeRows.length} Sheet1 row(s) from ${recipesUrl}`)
  console.log(`Force images: ${FORCE_IMAGES}`)

  const syncedRecipeIds = new Set()
  for (const [index, websiteRow] of websiteRecipeRows.entries()) {
    try {
      // Keep serial for deterministic logs and easier retries.
      // eslint-disable-next-line no-await-in-loop
      const syncedId = await syncWebsiteRecipeRow(websiteRow, recipeByTitle)
      if (syncedId) syncedRecipeIds.add(syncedId)
    } catch (error) {
      console.error(`[ERROR] website recipe row ${index + 1}: ${error?.message || error}`)
    }
  }

  await syncWebsiteListedFlags([...syncedRecipeIds])

  console.log('Recipe sync complete')
}

void main()
