# VibeCodedCollage - Local Upload Server

This repo includes a local uploader server that lets you paste HTML pages in the browser and save them directly to GitHub (or locally as fallback).

## Quick Start

### 1. Install dependencies:

```bash
npm install
```

### 2. Setup GitHub Integration (Optional but Recommended)

To upload files directly to GitHub, create a **GitHub Personal Access Token**:

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token"
3. Select scopes: `repo` (full control of private repositories)
4. Copy the token and set it as an environment variable:

```bash
export GITHUB_TOKEN=your_token_here
```

You can also set repository details (defaults to MurshOfTheUSSR/VibeCodedCollage):

```bash
export GITHUB_OWNER=YourUsername
export GITHUB_REPO=YourRepoName
export GITHUB_BRANCH=main
```

### 3. Start the server:

```bash
npm start
```

The server will log whether GitHub uploads are enabled or will fallback to local saving.

## Usage

1. Open the site in your browser: **http://localhost:3000/**

2. Click **"Upload New Page"** on the homepage

3. Paste your HTML code and give it a filename

4. Click **"Save & Share"**

5. If GitHub is configured, the file uploads directly to your repo in the `pages/` folder and appears on the site for everyone to see

6. If GitHub isn't configured, the file saves locally to `pages/<filename>.html`

## Features

- ✅ Direct GitHub integration - uploads commit to your repo
- ✅ Fallback to local saving if GitHub upload fails
- ✅ Automatic page list refresh
- ✅ Modern, smooth UI with animations
- ✅ CORS enabled for cross-origin requests

## Notes

- The `pages/list.json` file tracks all uploaded pages and is automatically updated
- GitHub uploads appear in your repository with automatic commit messages
- Without GITHUB_TOKEN set, uploads are saved locally only

