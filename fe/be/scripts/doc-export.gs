const VALID_DOC_FORMATS = ['text', 'html', 'both'];

function doGet(e) {
  try {
    const mode = (e.parameter?.mode || 'recipes').toLowerCase();
    if (mode === 'doc') {
      return handleDocMode(e);
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

  if (lastRow < 2) {
    return jsonOutput({ok: true, count: 0, recipes: []});
  }

  const values = sheet.getRange(2, 1, lastRow - 1, 5).getDisplayValues(); // A:E
  const recipes = [];

  for (let i = 0; i < values.length; i += 1) {
    const row = i + 2;
    const chef = safeTrim(values[i][0]);
    const spoonLevel = parseSpoonLevel(values[i][1]);
    const recipeName = safeTrim(values[i][2]);
    const vegan = safeTrim(values[i][3]);
    const extras = safeTrim(values[i][4]);

    const rich = sheet.getRange(row, 3).getRichTextValue();
    const docUrl = extractLinkFromRichText(rich);

    if (!recipeName) continue;

    const item = {
      row,
      chef,
      spoonLevel,
      recipeName,
      docUrl: docUrl || null,
      vegan,
      extras,
    };

    if (includeDocs && docUrl) {
      const docPayload = readDocContentFromUrl(docUrl, docFormat);
      if (docPayload.docId) item.docId = docPayload.docId;
      if (docPayload.contentText) item.contentText = docPayload.contentText;
      if (docPayload.contentHtml) item.contentHtml = docPayload.contentHtml;
      if (docPayload.docError) item.docError = docPayload.docError;
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
    contentText: content.contentText || null,
    contentHtml: content.contentHtml || null,
  });
}

function getRecipeSheet(params) {
  const properties = PropertiesService.getScriptProperties();
  const sheetName = safeTrim(params?.sheetName) || properties.getProperty('RECIPE_SHEET_NAME') || 'recipes';
  const spreadsheetId = safeTrim(params?.sheetId) || properties.getProperty('RECIPE_SHEET_ID');

  const ss = spreadsheetId ? SpreadsheetApp.openById(spreadsheetId) : SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];

  if (!sheet) {
    throw new Error('Recipe sheet not found');
  }
  return sheet;
}

function readDocContentFromUrl(docUrl, docFormat) {
  const docId = extractDocId(docUrl);
  if (!docId) return {docError: 'Invalid Google Doc URL'};
  try {
    const content = readDocContentById(docId, docFormat);
    return {...content, docId};
  } catch (error) {
    return {
      docId,
      docError: error && error.message ? error.message : String(error),
    };
  }
}

function readDocContentById(docId, docFormat) {
  const doc = DocumentApp.openById(docId);
  const paragraphs = doc.getBody().getParagraphs();
  const contentText = paragraphs
    .map((p) => p.getText())
    .filter(Boolean)
    .join('\n\n');

  if (docFormat === 'text') {
    return {contentText};
  }

  const contentHtml = paragraphs
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
    return {contentHtml};
  }

  return {contentText, contentHtml};
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

function parseSpoonLevel(raw) {
  const text = safeTrim(raw);
  const digits = text.match(/\d+/);
  const parsed = digits ? Number(digits[0]) : 0;
  return Math.max(0, Math.min(5, Number.isFinite(parsed) ? parsed : 0));
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
