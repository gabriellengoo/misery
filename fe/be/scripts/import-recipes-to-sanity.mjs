#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import {createClient} from '@sanity/client'
import config from '../sanity.config.js'

const DATA_FILE = path.resolve(process.cwd(), 'data', 'recipes.json')
const SANITY_TOKEN =
  process.env.SANITY_API_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_TOKEN

if (!SANITY_TOKEN) {
  throw new Error('Set SANITY_API_TOKEN (or SANITY_WRITE_TOKEN) before running this script')
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
    if (row[lookup]) {
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
  return /^(y(es)?|true)$/i.test(raw.trim())
}

async function loadRecipes() {
  const file = await fs.readFile(DATA_FILE, 'utf8')
  const rows = JSON.parse(file)
  if (!Array.isArray(rows) || !rows.length) {
    throw new Error(`No rows found in ${DATA_FILE}`)
  }
  return rows.map(normalizeRow)
}

async function importRecipe(batchRow, index) {
  const title = getValue(batchRow, ['recipe name', 'recipe', 'title', 'name'])
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
  const voiceNoteUrl = getValue(batchRow, [
    'voice note url',
    'voice note',
    'voicenote',
    'audio link',
  ])
  const content = getValue(batchRow, ['content', 'recipe details', 'details'])

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
    content: content || undefined,
  }

  await client.createOrReplace(payload)
  console.log(`Upserted recipe ${title} (${slug})`)
  return slug
}

async function main() {
  const rows = await loadRecipes()
  for (const [index, row] of rows.entries()) {
    // eslint-disable-next-line no-await-in-loop -- keep imports serial for easier debugging
    await importRecipe(row, index)
  }
  console.log('Import complete')
}

void main()
