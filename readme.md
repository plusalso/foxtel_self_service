# Foxtel Self Service

Proof of concept React app which allows users to generate images based on strict templates.

Features

- Assets stored in Figma
- This app downloads the asset using the Figma REST API
- Some templates will allow text entry
- Radix UI for theme
- React
- AWS
- Vite
- React Query
- Bulletproof react folder structure

- Cognito to be added later

# FAQ:

- Error: TypeError: Cannot redefine property: \_serverlessExternalPluginName
- Answer: use node v20.

# Syncing Assets

- The figma API has rate limits, and it is slow to generate images from a node id. For this reason, we cache all the assets in s3.
- The Update Database button handles this. It:
  - Takes in the fileId, and the pageIds for the pages which need assets
  - For each pageId
    - Get the full json tree representing the node
    - create a hash of that tree structure
    - Check if the asset file is already in s3.
    - If it is, and it has the same hash stored on the file metadata, continue. Otherwise
    - Add this file to a list of assets that need to be uploaded.
  - If there are some assets that need to be uploaded,
    - Invoke the downloadAndUploadAssets lambda handler to download from figma and upload to s3.

The reason downloadAndUploadAssets is on a separate handler is because:

- API gateway has a 29 second timeout. Downloading assets may take several minutes.
- I tried (pseudocode)
  - `assets = await getAssetsToDownload()` (quick function)
  - `downloadAndUploadToS3(assets)` (slow function, not awaited)
  - `return assets`
    But the above lambda gets killed after a while since it returns. I didn't know that happens.

# Defining asset links
