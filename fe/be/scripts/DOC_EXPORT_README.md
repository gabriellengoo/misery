# Sheet -> Doc -> Sanity Sync

Use `doc-export.gs` as your standalone Apps Script endpoint, then run the Node sync script.

## What the Apps Script now returns
- Data starts at row `3` (two header rows skipped).
- `docUrl` is read from the RichText hyperlink in column `C`.
- `imageUrl` is read from the RichText hyperlink in column `E`.
- `imageFileId` is extracted from `imageUrl` when it is a Google Drive link.
- `extrasText` is the visible display value of column `E`.
- For `docUrl` rows, it attempts to read doc text and returns:
  - `docText` (plain text)
  - `docHtml` (basic paragraph/heading HTML when `docFormat=html|both`)
  - `error` when doc access fails

## Deploy Apps Script
1. Open [script.google.com](https://script.google.com/) and create/open your standalone project.
2. Replace `Code.gs` with `fe/be/scripts/doc-export.gs`.
3. In Script Properties, set:
   - `RECIPE_SHEET_ID`
   - `RECIPE_SHEET_NAME` (for example `Sheet1`)
4. Deploy as **Web app** and copy the `/exec` URL.

## Run recipe sync
From `fe/be`, set env vars and run:

```bash
export SANITY_PROJECT_ID=your_project_id
export SANITY_DATASET=your_dataset
export SANITY_WRITE_TOKEN=your_write_token
export APPS_SCRIPT_URL='https://script.google.com/macros/s/XXX/exec?mode=recipes&sheet=Sheet1'

npm run sync-recipes-from-sheet
```

The sync script upserts recipes using deterministic IDs: `recipe-<slug>`.

## File proxy mode
You can proxy a Drive file as raw bytes via:

```text
https://script.google.com/macros/s/XYZ/exec?mode=file&fileId=DRIVE_FILE_ID
```

Or:

```text
https://script.google.com/macros/s/XYZ/exec?mode=file&url=https://drive.google.com/open?id=DRIVE_FILE_ID
```
