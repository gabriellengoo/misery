#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const ROOT = path.resolve(process.cwd())
const csvPath = path.join(ROOT, 'data', 'recipes.csv')
const jsonPath = path.join(ROOT, 'data', 'recipes.json')

async function readCsv() {
  const raw = await fs.readFile(csvPath, 'utf8')
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    throw new Error(`CSV ${csvPath} appears to be empty`)
  }

  if (/^RECIPES/i.test(lines[0])) {
    lines.shift()
  }

  return lines.join('\n')
}

function normalizeRow(row = {}) {
  const normalized = {}
  Object.entries(row).forEach(([column, value]) => {
    if (!column) return
    normalized[column.trim()] = typeof value === 'string' ? value.trim() : value
  })
  return normalized
}

async function writeJson(records) {
  const payload = JSON.stringify(records, null, 2) + '\n'
  await fs.writeFile(jsonPath, payload, 'utf8')
  console.log(`Wrote ${records.length} recipes to ${path.relative(ROOT, jsonPath)}`)
}

async function main() {
  try {
    const parsed = Papa.parse(await readCsv(), {
      header: true,
      skipEmptyLines: true,
    })

    if (parsed.errors.length) {
      console.warn('Some rows could not be parsed:', parsed.errors)
    }

    const rows = parsed.data.map(normalizeRow).filter((row) => Object.keys(row).length)
    if (!rows.length) {
      throw new Error('No recipes were extracted from the CSV')
    }

    await writeJson(rows)
  } catch (error) {
    console.error(error.message)
    process.exit(1)
  }
}

void main()
