# self notes

Caching. Lets just download the whole figma file, but only do it one page at a time. So we just download that page with assets we need.
One page corresponds to one dropdown. so maybe we do max 10 at a time. not too bad.
From that, for each node we can generate a hash and store the image with that hash in s3. store hash on metadata so filename is still predictable.

Do this all async

Downloading a whole page will still be slow. So just download depth:1 and get assets like we currently do.
Current stuff works like now.

In the background do the full page download and sync in background. Only do this if the file version has changed.

If figma file version changed
save the new file version (where?)
request pages from figma api
for each page which is a template page (has a / in the title)
download whole page using API
for each top level frame/group:
generate a hash and compute the image filename
compare hash to hash in s3.
if hash is different, call the figma api to render the image and pull the new file into s3.

Don't worry about refreshing the image in the imageOverlay . We can set a stale timeout on the images maybe or something?

Perhaps the Update Database button can trigger the whole refresh. But make it less prominent. Keep it simple and add a:
"This may take a few minutes" message.

# Foxtel Self Service

Proof of concept React app which allows users to generate images based on strict templates.

Features

- Assets stored in Figma
- This app downloads the asset using the Figma REST API
- Templates are created bespoke, using css and html.
- Dropdowns to select images are created automatically based on figma page structure and Frame names
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
