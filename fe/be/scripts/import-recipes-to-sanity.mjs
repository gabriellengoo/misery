#!/usr/bin/env node
import {createClient} from '@sanity/client'
import config from '../sanity.config.js'

const SANITY_TOKEN =
  process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN
const RECIPE_SHEET_ENDPOINT =
  process.env.RECIPE_SHEET_ENDPOINT || process.env.DOC_EXPORT_ENDPOINT || ''

if (!SANITY_TOKEN) {
  throw new Error('Set SANITY_API_TOKEN (or SANITY_WRITE_TOKEN) before running this script')
}

if (!RECIPE_SHEET_ENDPOINT) {
  throw new Error('Set RECIPE_SHEET_ENDPOINT (or DOC_EXPORT_ENDPOINT) before running this script')
}

const client = createClient({
  projectId: config.projectId,
  dataset: config.dataset,
  apiVersion: '2025-01-01',
  token: SANITY_TOKEN,
  useCdn: false,
})

function slugify(value = '') {
  return value
    .toString()
    .toLowerCase()
    .replace(/[^\w]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function normalizeRow(row = {}) {
  const normalized = {}
  Object.entries(row).forEach(([rawKey, value]) => {
    if (!rawKey) return
    normalized[rawKey.trim().toLowerCase()] =
      typeof value === 'string' ? value.trim() : value
  })
  return normalized
}

function getValue(row, keys) {
  for (const key of keys) {
    if (!key) continue
    const lookup = key.trim().toLowerCase()
    if (row[lookup] !== undefined && row[lookup] !== null && row[lookup] !== '') {
      return row[lookup]
    }
  }
  return null
}

function parseSpoonLevel(raw) {
  if (!raw) return 0
  const digits = raw.toString().match(/\d+/)
  const parsed = digits ? Number(digits[0]) : NaN
  if (Number.isNaN(parsed)) return 0
  return Math.min(5, Math.max(0, parsed))
}

function parseVegan(raw) {
  if (typeof raw !== 'string') return Boolean(raw)
  return /^(y(es)?|true|vegan)$/i.test(raw.trim())
}

function normalizeEndpoint(base, includeDocs = true) {
  const separator = base.includes('?') ? '&' : '?'
  const suffix = includeDocs
    ? 'mode=recipes&includeDocs=true&docFormat=both'
    : 'mode=recipes'
  return `${base}${separator}${suffix}`
}

async function loadRecipesFromEndpoint() {
  const endpoint = normalizeEndpoint(RECIPE_SHEET_ENDPOINT, true)
  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error(`Recipe endpoint failed with ${response.status}`)
  }

  const payload = await response.json()
  if (!payload?.ok) {
    throw new Error(payload?.error || 'Recipe endpoint returned an error')
  }

  const rows = Array.isArray(payload.recipes) ? payload.recipes : []
  if (!rows.length) {
    throw new Error('No recipe rows returned from recipe endpoint')
  }

  return rows.map(normalizeRow)
}

async function importRecipe(batchRow, index) {
  const title = getValue(batchRow, ['recipe name', 'recipename', 'recipe', 'title', 'name'])
  if (!title) {
    console.warn(`Skipping row ${index + 1}: missing title`)
    return null
  }

  const slug = slugify(title)
  if (!slug) {
    console.warn(`Skipping "${title}": could not build a slug`)
    return null
  }

  const chef = getValue(batchRow, ['chef', 'author']) || 'misery collective'
  const spoonLevel = parseSpoonLevel(getValue(batchRow, ['spoon level', 'spoons']))
  const vegan = parseVegan(getValue(batchRow, ['vn', 'vegan']))
  const extras = getValue(batchRow, ['extras?', 'extras', 'notes']) || ''
  const docUrl = getValue(batchRow, ['doc url', 'docUrl', 'google doc', 'doc'])
  const contentText = getValue(batchRow, ['contenttext', 'content text'])
  const contentHtml = getValue(batchRow, ['contenthtml', 'content html'])
  const voiceNoteUrl = getValue(batchRow, [
    'voice note url',
    'voice note',
    'voicenote',
    'audio link',
  ])
  const payload = {
    _id: `recipe-${slug}`,
    _type: 'recipe',
    title,
    chef,
    spoonLevel,
    vegan,
    slug: {
      _type: 'slug',
      current: slug,
    },
    extras: extras || undefined,
    docUrl: docUrl || undefined,
    voiceNoteUrl: voiceNoteUrl || undefined,
    contentText: contentText || undefined,
    contentHtml: contentHtml || undefined,
    content: contentText || undefined,
  }

  await client.createOrReplace(payload)
  console.log(`Upserted recipe ${title} (${slug})`)
  return slug
}

async function main() {
  const rows = await loadRecipesFromEndpoint()
  console.log(`Loaded ${rows.length} recipe row(s) from Apps Script endpoint`)
  for (const [index, row] of rows.entries()) {
    // eslint-disable-next-line no-await-in-loop -- keep imports serial for easier debugging
    await importRecipe(row, index)
  }
  console.log('Import complete')
}

void main()
