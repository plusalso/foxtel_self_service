# Foxtel Self Service

Proof of concept React app which allows users to generate images based on strict templates.

Features

- Assets stored in Figma
- Json files map the figma assets to dropdowns.
- This app downloads the asset using the Figma REST API
- Some templates will allow text entry
- Radix UI for theme
- React
- AWS
- Vite
- React Query
- Bulletproof react folder structure

- Cognito to be added later

# Running

- Set up your AWS credentials under the name "foxtel_self_service"

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
    But the above lambda gets killed after a while since it returns.

# JSON definitions.

This guide explains how to create template configurations for the image overlay system.

Each JSON file should map one figma file to it's fields

## Basic Structure

```json
{
  "id": "templateId",
  "label": "Template Display Name",
  "fileId": "figmaFileId",
  "presets": [...],
  "fields": [...]
}
```

## Fields

Fields define the available inputs and their properties. Each field can be either a text input or an asset selector.

### Text Field

```json
{
  "id": "textTeaser",
  "type": "text",
  "label": "Text Teaser",
  "defaultValue": "Default Text",
  "assetSourcePage": "Optional/Figma/Page/Path",  // If set, displays background asset when text is present
  "containerStyle": {
    "position": "absolute",
    "top": "40px",
    "right": "66px",
    "color": "white",
    "fontSize": "72px",
    // ... any valid CSS properties
  },
  "renderer": "DefaultTextRenderer" | "CornerTextRenderer" // Specifies which renderer component to use, Make new ones if you need
}
```

### Asset Dropdown Field

```json
{
  "id": "background",
  "type": "figmaAssetDropdownSelect",
  "label": "Background",
  "assetSourcePage": "Template/Background" // Required: Figma page path containing assets
}
```

## Presets

Presets define pre-configured combinations of field values. Each preset can override any field's default value. Presets don't just define the values. If a field isn't listed in the preset, it will be omitted.

```json
{
  "id": "presetId",
  "label": "Preset Display Name",
  "fields": [
    {
      "fieldId": "textTeaser",
      "value": "Text Value"
    },
    {
      "fieldId": "background",
      "value": "Asset Name"
    }
  ]
}
```

## Example Usage

```json
{
  "id": "SingleEventFixtureTile",
  "label": "Single Event Fixture Tile",
  "fileId": "51R2nLVvwmccZxjiIgo29P",
  "supportsUploadedImages": false,
  "presets": [
    {
      "id": "foxEvent",
      "label": "Fox Event",
      "fields": [
        {
          "fieldId": "textTeaser",
          "value": "Text Teaser"
        },
        {
          "fieldId": "background",
          "value": "F1 Logo"
        }
      ]
    }
  ],
  "fields": [
    {
      "id": "textTeaser",
      "type": "text",
      "label": "Text Teaser",
      "assetSourcePage": "Single Event Fixture Tile/Text Teaser",
      "containerStyle": {
        "position": "absolute",
        "top": "40px",
        "right": "66.62px",
        "color": "white",
        "fontSize": "72px"
      },
      "renderer": "DefaultTextRenderer"
    }
  ]
}
```

## Special Features

- **Text Field with Background**: When a text field includes an `assetSourcePage`, it will display the specified background asset only when text is present
- **Uploaded Images**: Set `supportsUploadedImages: true` on a preset to allow custom image uploads
- **Style Positioning**: Use `containerStyle` to precisely position text elements with CSS properties
- **Custom Renderers**: Specify different renderers for specialized text display requirements

## Notes

- All positions are relative to a 1920x1080 canvas
- Asset paths must match exactly with Figma page/frame names
- Field IDs must be unique within a template!!

```

```
