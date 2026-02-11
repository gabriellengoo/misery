import createDOMPurify from 'dompurify';

let purifier;
if (typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const { window: jsdomWindow } = new JSDOM('');
  purifier = createDOMPurify(jsdomWindow);
} else {
  purifier = createDOMPurify(window);
}

export function sanitizeHtml(value) {
  if (!value) return '';
  return purifier.sanitize(value, { ADD_ATTR: ['target'] });
}
