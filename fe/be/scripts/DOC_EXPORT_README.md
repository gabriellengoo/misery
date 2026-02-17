# Recipes Sheet + Doc Export Web App

This Apps Script exposes recipe rows as JSON and can optionally include Google Doc content per recipe.

It reads the recipes sheet columns:
- `A` chef
- `B` spoon level
- `C` recipe name (text) and hyperlink URL from RichText metadata
- `D` vegan
- `E` extras

Hyperlink extraction uses RichText:
```js
const rich = sheet.getRange(row, 3).getRichTextValue()
const docUrl = rich ? rich.getLinkUrl() : null
```

## Deployment steps
1. Open [script.google.com](https://script.google.com/) and create a new project.
2. Replace the generated `Code.gs` with the contents of `doc-export.gs` in this directory.
3. Save, then go to **Deploy > New deployment**.
4. Select **Web app**, give it a name, and set **Execute as** to your account.
5. Set **Who has access** to `Anyone` (or `Anyone with the link`).
6. In **Project Settings > Script Properties**, set:
   - `RECIPE_SHEET_ID` = your spreadsheet ID
   - `RECIPE_SHEET_NAME` = sheet tab name (for example `recipes`)
7. Deploy and copy the generated web app URL (it looks like `https://script.google.com/macros/s/XYZ/exec`).
8. Set `RECIPE_SHEET_ENDPOINT` (or `DOC_EXPORT_ENDPOINT`) for the import script to that URL.

## Endpoint usage
Recipes JSON only:
```
https://script.google.com/macros/s/XYZ/exec?mode=recipes
```

Recipes JSON including doc content:
```
https://script.google.com/macros/s/XYZ/exec?mode=recipes&includeDocs=true&docFormat=both
```
`docFormat` supports `text`, `html`, or `both`.

Single doc mode:
```
https://script.google.com/macros/s/XYZ/exec?mode=doc&id=<DOC_ID>&docFormat=html
```

Optional request params:
- `sheetId`: override script property `RECIPE_SHEET_ID`
- `sheetName`: override script property `RECIPE_SHEET_NAME`
