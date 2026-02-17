# Local upload server for VibeCodedCollage

This repo now includes a small local uploader server that lets you paste an HTML page in the browser and save it into `pages/` inside the workspace.

Quick start:

1. Install dependencies:

```bash
npm install
```

2. Start the server:

```bash
npm start
```

3. Open the site in your browser:

Visit: http://localhost:3000/

Use the "Upload New Page" button on the homepage to paste HTML and save a page. Uploaded pages are saved to `pages/<filename>.html` and are served by the same server (e.g. http://localhost:3000/pages/example.html).

If you don't run the server, the uploader UI will fallback to downloading the pasted HTML as a file.
