# Google Doc Export Web App

This Apps Script exposes recipe documents so the Nuxt import can fetch HTML/text content.

## Deployment steps
1. Open [script.google.com](https://script.google.com/) and create a new project.
2. Replace the generated `Code.gs` with the contents of `doc-export.gs` in this directory.
3. Save, then go to **Deploy > New deployment**.
4. Select **Web app**, give it a name, and set **Execute as** to your account.
5. Set **Who has access** to `Anyone` (or `Anyone with the link`).
6. Deploy and copy the generated web app URL (it looks like `https://script.google.com/macros/s/XYZ/exec`).
7. Set the `DOC_EXPORT_ENDPOINT` environment variable (used by the import script) to that URL.

Example endpoint usage (appended by import script):
```
https://script.google.com/macros/s/XYZ/exec?id=<DOC_ID>&format=html
```
or `format=text` for plain text.
