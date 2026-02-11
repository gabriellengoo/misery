const VALID_FORMATS = ['html', 'text'];

function doGet(e) {
  const docId = e.parameter?.id;
  const format = (e.parameter?.format || 'html').toLowerCase();

  if (!docId) {
    return ContentService.createTextOutput('missing doc id').setMimeType(ContentService.MimeType.TEXT);
  }

  const mode = VALID_FORMATS.includes(format) ? format : 'html';
  const doc = DocumentApp.openById(docId);
  const paragraphs = doc.getBody().getParagraphs();

  const text = paragraphs
    .map((p) => p.getText())
    .filter(Boolean)
    .join('\n\n');

  if (mode === 'text') {
    return ContentService.createTextOutput(text).setMimeType(ContentService.MimeType.TEXT);
  }

  const html = paragraphs
    .map((p) => {
      const textValue = p.getText();
      if (!textValue) return '';
      switch (p.getHeading()) {
        case DocumentApp.ParagraphHeading.HEADING1:
          return `<h1>${escapeHtml(textValue)}</h1>`;
        case DocumentApp.ParagraphHeading.HEADING2:
          return `<h2>${escapeHtml(textValue)}</h2>`;
        case DocumentApp.ParagraphHeading.HEADING3:
          return `<h3>${escapeHtml(textValue)}</h3>`;
        default:
          return `<p>${escapeHtml(textValue)}</p>`;
      }
    })
    .join('');

  return ContentService.createTextOutput(html).setMimeType(ContentService.MimeType.HTML);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
