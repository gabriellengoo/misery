const VALID_DOC_FORMATS = ['text', 'html', 'both'];
const DATA_START_ROW = 3;
const DEFAULT_WEBSITE_SHEET_NAME = 'for website';

function doGet(e) {
  try {
    const mode = (e.parameter?.mode || 'recipes').toLowerCase();
    if (mode === 'file') {
      return handleFileMode(e);
    }
    if (mode === 'doc') {
      return handleDocMode(e);
    }
    if (mode === 'website') {
      return handleWebsiteMode(e);
    }
    return handleRecipesMode(e);
  } catch (error) {
    return jsonOutput({
      ok: false,
      error: error && error.message ? error.message : String(error),
    });
  }
}

function handleRecipesMode(e) {
  const includeDocs = toBool(e.parameter?.includeDocs);
  const docFormat = normalizeDocFormat(e.parameter?.docFormat || e.parameter?.format || 'text');
  const sheet = getRecipeSheet(e.parameter);
  const lastRow = sheet.getLastRow();

  if (lastRow < DATA_START_ROW) {
    return jsonOutput({ok: true, count: 0, recipes: []});
  }

  const rowCount = lastRow - DATA_START_ROW + 1;
  const values = sheet.getRange(DATA_START_ROW, 1, rowCount, 5).getDisplayValues(); // A:E
  const colCRichValues = sheet.getRange(DATA_START_ROW, 3, rowCount, 1).getRichTextValues(); // C
  const colERichValues = sheet.getRange(DATA_START_ROW, 5, rowCount, 1).getRichTextValues(); // E
  const colCFormulas = sheet.getRange(DATA_START_ROW, 3, rowCount, 1).getFormulas(); // C
  const colEFormulas = sheet.getRange(DATA_START_ROW, 5, rowCount, 1).getFormulas(); // E
  const recipes = [];

  for (let i = 0; i < values.length; i += 1) {
    const rowNumber = DATA_START_ROW + i;
    const chef = safeTrim(values[i][0]);
    const spoonLevel = parseSpoonLevel(values[i][1]);
    const recipeName = safeTrim(values[i][2]);
    const veganFlag = safeTrim(values[i][3]);
    const extrasText = safeTrim(values[i][4]);
    const docUrl = extractLinkFromRichText(colCRichValues[i][0]) || extractUrlFromHyperlinkFormula(colCFormulas[i][0]);
    const imageUrl = extractLinkFromRichText(colERichValues[i][0]) || extractUrlFromHyperlinkFormula(colEFormulas[i][0]);
    const imageFileId = extractDriveFileId(imageUrl);

    if (!recipeName) continue;

    const item = {
      row: rowNumber,
      chef,
      spoonLevel,
      recipeName,
      veganFlag,
      extrasText,
      docUrl: docUrl || null,
      imageUrl: imageUrl || null,
      imageFileId: imageFileId || null,
      docText: null,
      docHtml: null,
    };

    if (includeDocs && docUrl) {
      const docPayload = readDocContentFromUrl(docUrl, docFormat);
      if (docPayload.docId) item.docId = docPayload.docId;
      item.docText = docPayload.docText || null;
      item.docHtml = docPayload.docHtml || null;
      if (docPayload.error) item.error = docPayload.error;
    }

    recipes.push(item);
  }

  return jsonOutput({
    ok: true,
    count: recipes.length,
    includeDocs,
    docFormat,
    recipes,
  });
}

function handleWebsiteMode(e) {
  const sheet = getWebsiteSheet(e.parameter);
  const lastRow = sheet.getLastRow();

  if (lastRow < DATA_START_ROW) {
    return jsonOutput({ok: true, count: 0, website: []});
  }

  const rowCount = lastRow - DATA_START_ROW + 1;
  const values = sheet.getRange(DATA_START_ROW, 1, rowCount, 7).getDisplayValues(); // A:G
  const website = [];

  for (let i = 0; i < values.length; i += 1) {
    const rowNumber = DATA_START_ROW + i;

    const type = safeTrim(values[i][0]);
    const title = safeTrim(values[i][1]);
    const spooniverse = parseSpoonLevel(values[i][2]);
    const voicenote = safeTrim(values[i][3]);
    const video = safeTrim(values[i][4]);
    const pageStartRaw = safeTrim(values[i][5]);
    const pageEndRaw = safeTrim(values[i][6]);
    const pageStart = parsePositiveInteger(pageStartRaw);
    const pageEnd = parsePositiveInteger(pageEndRaw);

    if (!title) continue;

    website.push({
      row: rowNumber,
      type,
      title,
      spooniverse,
      'voicenote?': voicenote || null,
      'video?': video || null,
      pageStart: pageStart,
      pageEnd: pageEnd,
      pageStartRaw: pageStartRaw || null,
      pageEndRaw: pageEndRaw || null,
    });
  }

  return jsonOutput({
    ok: true,
    count: website.length,
    website,
  });
}

function handleFileMode(e) {
  const rawFileInput = safeTrim(e.parameter?.fileId) || safeTrim(e.parameter?.url);
  const fileId = extractDriveFileId(rawFileInput);
  if (!fileId) {
    return jsonOutput({ok: false, error: 'Missing fileId'});
  }

  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const contentType = blob.getContentType() || '';
    const bytes = blob.getBytes();
    const dataBase64 = Utilities.base64Encode(bytes);
    return jsonOutput({
      ok: true,
      mode: 'file',
      fileId,
      filename: file.getName(),
      contentType,
      dataBase64,
    });
  } catch (error) {
    return jsonOutput({
      ok: false,
      error: error && error.message ? error.message : String(error),
      fileId,
    });
  }
}

function handleDocMode(e) {
  const docUrl = safeTrim(e.parameter?.docUrl);
  const docId = safeTrim(e.parameter?.id) || extractDocId(docUrl);
  const docFormat = normalizeDocFormat(e.parameter?.docFormat || e.parameter?.format || 'html');
  if (!docId) {
    return jsonOutput({ok: false, error: 'Missing doc id/docUrl'});
  }

  const content = readDocContentById(docId, docFormat);
  return jsonOutput({
    ok: true,
    docId,
    docFormat,
    docText: content.docText || null,
    docHtml: content.docHtml || null,
  });
}

function getRecipeSheet(params) {
  const properties = PropertiesService.getScriptProperties();
  const sheetName =
    safeTrim(params?.sheet) ||
    safeTrim(params?.sheetName) ||
    properties.getProperty('RECIPE_SHEET_NAME') ||
    'Sheet1';
  const spreadsheetId = safeTrim(params?.sheetId) || properties.getProperty('RECIPE_SHEET_ID');

  const ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];

  if (!sheet) {
    throw new Error('Recipe sheet not found');
  }
  return sheet;
}

function getWebsiteSheet(params) {
  const properties = PropertiesService.getScriptProperties();
  const sheetName =
    safeTrim(params?.sheet) ||
    safeTrim(params?.sheetName) ||
    properties.getProperty('WEBSITE_SHEET_NAME') ||
    DEFAULT_WEBSITE_SHEET_NAME;
  const spreadsheetId = safeTrim(params?.sheetId) || properties.getProperty('RECIPE_SHEET_ID');

  const ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Website sheet not found');
  }

  return sheet;
}

function readDocContentFromUrl(docUrl, docFormat) {
  const docId = extractDocId(docUrl);
  if (!docId) return {error: 'Invalid Google Doc URL'};
  try {
    const content = readDocContentById(docId, docFormat);
    return {...content, docId};
  } catch (error) {
    return {
      docId,
      error: error && error.message ? error.message : String(error),
    };
  }
}

function readDocContentById(docId, docFormat) {
  const doc = DocumentApp.openById(docId);
  const paragraphs = doc.getBody().getParagraphs();
  const docText = paragraphs
    .map((p) => p.getText())
    .filter(Boolean)
    .join('\n\n');

  if (docFormat === 'text') {
    return {docText};
  }

  const docHtml = paragraphs
    .map((p) => {
      const textValue = p.getText();
      if (!textValue) return '';
      switch (p.getHeading()) {
        case DocumentApp.ParagraphHeading.HEADING1:
          return '<h1>' + escapeHtml(textValue) + '</h1>';
        case DocumentApp.ParagraphHeading.HEADING2:
          return '<h2>' + escapeHtml(textValue) + '</h2>';
        case DocumentApp.ParagraphHeading.HEADING3:
          return '<h3>' + escapeHtml(textValue) + '</h3>';
        default:
          return '<p>' + escapeHtml(textValue) + '</p>';
      }
    })
    .join('');

  if (docFormat === 'html') {
    return {docHtml};
  }

  return {docText, docHtml};
}

function extractDocId(url) {
  if (!url) return null;
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /[?&]id=([a-zA-Z0-9_-]+)/,
  ];
  for (let i = 0; i < patterns.length; i += 1) {
    const match = String(url).match(patterns[i]);
    if (match && match[1]) return match[1];
  }
  return null;
}

function extractDriveId(urlOrId) {
  if (!urlOrId) return null;
  const value = String(urlOrId).trim();
  if (/^[a-zA-Z0-9_-]{20,}$/.test(value) && value.indexOf('http') !== 0) {
    return value;
  }

  const patterns = [
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];

  for (let i = 0; i < patterns.length; i += 1) {
    const match = value.match(patterns[i]);
    if (match && match[1]) return match[1];
  }
  return null;
}

function extractDriveFileId(urlOrId) {
  return extractDriveId(urlOrId);
}

function extractLinkFromRichText(rich) {
  if (!rich) return null;
  const whole = rich.getLinkUrl();
  if (whole) return whole;

  const runs = rich.getRuns();
  for (let i = 0; i < runs.length; i += 1) {
    const link = runs[i].getLinkUrl();
    if (link) return link;
  }
  return null;
}

function extractUrlFromHyperlinkFormula(formula) {
  if (!formula) return null;
  const value = String(formula).trim();
  const match = value.match(/^=HYPERLINK\(\s*"([^"]+)"/i);
  return match && match[1] ? match[1] : null;
}

function parseSpoonLevel(raw) {
  const text = safeTrim(raw);
  const digits = text.match(/\d+/);
  const parsed = digits ? Number(digits[0]) : 0;
  return Math.max(0, Math.min(5, Number.isFinite(parsed) ? parsed : 0));
}

function parsePositiveInteger(raw) {
  const text = safeTrim(raw);
  const digits = text.match(/\d+/);
  const parsed = digits ? Number(digits[0]) : NaN;
  if (!Number.isFinite(parsed) || parsed < 1) return null;
  return Math.trunc(parsed);
}

function normalizeDocFormat(value) {
  const v = String(value || '').toLowerCase();
  return VALID_DOC_FORMATS.indexOf(v) >= 0 ? v : 'text';
}

function toBool(value) {
  const v = String(value || '').toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

function safeTrim(value) {
  return String(value || '').trim();
}

function jsonOutput(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
