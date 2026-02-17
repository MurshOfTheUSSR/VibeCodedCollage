const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({limit: '5mb'}));

const PAGES_DIR = path.join(process.cwd(), 'pages');
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });

// GitHub config
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'MurshOfTheUSSR';
const GITHUB_REPO = process.env.GITHUB_REPO || 'VibeCodedCollage';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const USE_GITHUB = !!GITHUB_TOKEN;

// Ensure a current list.json exists by scanning the directory
async function regenerateList(){
  try{
    const files = await fs.promises.readdir(PAGES_DIR);
    const list = files.filter(f => /\.html?$/.test(f));
    await fs.promises.writeFile(path.join(PAGES_DIR, 'list.json'), JSON.stringify(list, null, 2), 'utf8');
  }catch(e){ console.warn('Could not regenerate pages list', e); }
}

// Upload to GitHub via API
async function uploadToGitHub(filename, content) {
  const filePath = `pages/${filename}`;
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
  
  try {
    // Get current file to get its SHA (for update)
    let sha = null;
    try {
      const getRes = await fetch(url, {
        headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
      });
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }
    } catch (e) {}

    // Encode content in base64
    const base64Content = Buffer.from(content).toString('base64');

    // Create or update file
    const body = {
      message: `Upload: ${filename}`,
      content: base64Content,
      branch: GITHUB_BRANCH
    };

    if (sha) body.sha = sha;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload to GitHub');
    }

    return { ok: true, path: `/pages/${filename}`, github: true };
  } catch (e) {
    console.error('GitHub upload error:', e.message);
    throw e;
  }
}

// create initial list.json
regenerateList();

if (USE_GITHUB) console.log(`✓ GitHub uploads enabled for ${GITHUB_OWNER}/${GITHUB_REPO}`);
else console.log('⚠ GITHUB_TOKEN not set - uploads will save locally only');

function sanitizeFilename(name){
  if(!name) return null;
  name = path.basename(name);
  if (!/\.html?$/.test(name)) name = name + '.html';
  // avoid weird names
  if (name.includes('\0')) return null;
  return name;
}

app.post('/upload', async (req, res) => {
  try{
    const { filename, content } = req.body || {};
    const safe = sanitizeFilename(filename);
    if(!safe) return res.status(400).json({ error: 'Invalid filename' });
    if (typeof content !== 'string' || !content.trim()) return res.status(400).json({ error: 'Empty content' });

    if (USE_GITHUB) {
      // Upload to GitHub
      try {
        const result = await uploadToGitHub(safe, content);
        return res.json(result);
      } catch (err) {
        console.error('GitHub upload failed:', err.message);
        // Fallback to local save if GitHub fails
        const outPath = path.join(PAGES_DIR, safe);
        await fs.promises.writeFile(outPath, content, 'utf8');
        try { await regenerateList(); } catch (e) {}
        return res.status(500).json({ 
          error: 'GitHub upload failed, saved locally instead',
          path: `/pages/${safe}`,
          details: err.message
        });
      }
    } else {
      // Save locally only
      const outPath = path.join(PAGES_DIR, safe);
      await fs.promises.writeFile(outPath, content, 'utf8');

      // Regenerate pages list from directory
      try{
        await regenerateList();
      }catch(e){ console.warn('Failed to update pages list', e); }

      return res.json({ ok: true, path: `/pages/${safe}`, local: true });
    }
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: 'Failed to save file' });
  }
});

// Serve repository files so you can open pages at http://localhost:3000/
app.use(express.static(process.cwd()));

app.get('/upload-status', (req, res) => {
  res.json({ githubEnabled: USE_GITHUB });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Uploader server running at http://localhost:${PORT}/`));
