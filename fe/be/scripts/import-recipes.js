const fs = require('fs');
const path = require('path');
const sanityClient = require('@sanity/client');

const CONFIG = {
  projectId: 'gsh23bac',
  dataset: 'production',
  apiVersion: '2025-01-01',
  useCdn: false,
};

const client = sanityClient(CONFIG);
const DOC_EXPORT_ENDPOINT = process.env.DOC_EXPORT_ENDPOINT || '';

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 96);
}

function parseArray(value) {
  if (!value) return [];
  return value
    .split(/[|;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const csvArg = process.argv[2];
const csvPath = csvArg
  ? path.resolve(process.cwd(), csvArg)
  : path.resolve(process.cwd(), 'recipes.csv');

if (!fs.existsSync(csvPath)) {
  console.error(`CSV file not found at ${csvPath}`);
  process.exit(1);
}

function parseCsv(source) {
  const lines = source.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (!lines.length) return [];

  const headerRow = parseLine(lines.shift());
  return lines.map((line) => {
    const values = parseLine(line);
    const record = {};
    headerRow.forEach((column, index) => {
      if (column) {
        record[column.trim()] = values[index] ?? '';
      }
    });
    return record;
  });
}

function parseLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && !inQuotes) {
      inQuotes = true;
      continue;
    }

    if (char === '"' && inQuotes) {
      if (line[i + 1] === '"') {
        current += '"';
        i += 1;
        continue;
      }
      inQuotes = false;
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }
  result.push(current);
  return result;
}

function extractDocId(url) {
  if (!url) return null;
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /open\\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

async function fetchDocHtml(docId) {
  if (!DOC_EXPORT_ENDPOINT) {
    return null;
  }

  try {
    const response = await fetch(`${DOC_EXPORT_ENDPOINT}?id=${docId}&format=html`);
    if (!response.ok) {
      throw new Error(`Doc export failed (${response.status})`);
    }
    return await response.text();
  } catch (error) {
    console.warn(`Unable to fetch doc ${docId}:`, error.message);
    return null;
  }
}

function stripHtml(value) {
  if (!value) return '';
  return value.replace(/<[^>]+>/g, ' ');
}

function findVoiceNoteUrl(contentHtml) {
  const clean = stripHtml(contentHtml);
  const match = clean.match(/voice note[:\\s]*([^\\s,]+)/i);
  if (match?.[1]) {
    return match[1].replace(/[.,]$/, '');
  }
  return null;
}

function findTimeText(contentHtml) {
  const clean = stripHtml(contentHtml);
  const match = clean.match(/time[:\\s]*([^\\n\\r]+)/i);
  if (match?.[1]) {
    return match[1].trim();
  }
  return null;
}

const csv = fs.readFileSync(csvPath, 'utf8');
const records = parseCsv(csv);

if (!records.length) {
  console.error('No rows found in the CSV file.');
  process.exit(1);
}

const normalize = (row, keys) => {
  for (const key of keys) {
    if (!key) continue;
    const raw = row[key];
    if (typeof raw === 'string' && raw.trim()) {
      return raw.trim();
    }
  }
  return null;
};

(async () => {
  let imported = 0;
  for (const row of records) {
    const title = normalize(row, ['recipeName', 'recipe name', 'title', 'name']);
    if (!title) {
      console.warn('Skipping row without a title:', row);
      continue;
    }

    const chef = normalize(row, ['chef', 'author']);
    const chefValue = chef || 'misery collective';

    const spoonLevelRaw = normalize(row, ['spoon level', 'spoonLevel', 'spoons']);
    const spoonLevel = Math.min(Math.max(Number(spoonLevelRaw ?? 0), 0), 5);

    const veganRaw = normalize(row, ['vegan', 'vn']);
    const vegan = veganRaw ? /^y(es)?$/i.test(veganRaw) : false;

    const intro = normalize(row, ['intro', 'description', 'note']);
    const sourceUrl = normalize(row, ['sourceUrl', 'source', 'link']);

    const ingredients = parseArray(row.ingredients || row['ingredients list']);
    const steps = parseArray(row.steps || row['instructions'] || row['direction']);

    const extrasCsv = normalize(row, ['extras', 'notes', 'extras/notes']) || '';
    const extras = extrasCsv
      .split(/[|,;]+/)
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);

    const slugValue = slugify(normalize(row, ['slug', 'recipeSlug', 'slug.current']) || title);
    if (!slugValue) {
      console.warn('Could not build slug for recipe:', title);
      continue;
    }

    const doc = {
      _id: `recipe.${slugValue}`,
      _type: 'recipe',
      title,
      slug: {
        current: slugValue,
      },
      chef: chefValue,
      spoonLevel,
      vegan,
      intro,
      ingredients,
      steps,
      sourceUrl,
      extras,
    };

    const docUrl = normalize(row, ['docUrl', 'doc url', 'document url']);
    if (docUrl) {
      doc.docUrl = docUrl;
      const docId = extractDocId(docUrl);
      if (docId) {
        const contentHtml = await fetchDocHtml(docId);
        if (contentHtml) {
          doc.contentHtml = contentHtml;
          const voiceNoteUrl = findVoiceNoteUrl(contentHtml);
          if (voiceNoteUrl) {
            doc.voiceNoteUrl = voiceNoteUrl;
          }
          const timeText = findTimeText(contentHtml);
          if (timeText) {
            doc.timeText = timeText;
          }
        }
      }
    }

    const createdAt = normalize(row, ['createdAt', 'created at']);
    if (createdAt) {
      doc.createdAt = createdAt;
    }

    try {
      await client.createOrReplace(doc);
      imported += 1;
      console.log(`Upserted recipe: ${title} (${slugValue})`);
    } catch (error) {
      console.error('Failed to write recipe:', title, error);
    }
  }

  console.log(`Imported ${imported} recipe(s) from ${records.length} CSV row(s).`);
})();
