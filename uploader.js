const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({limit: '5mb'}));

const PAGES_DIR = path.join(process.cwd(), 'pages');
if (!fs.existsSync(PAGES_DIR)) fs.mkdirSync(PAGES_DIR, { recursive: true });

// Ensure a current list.json exists by scanning the directory
async function regenerateList(){
  try{
    const files = await fs.promises.readdir(PAGES_DIR);
    const list = files.filter(f => /\.html?$/.test(f));
    await fs.promises.writeFile(path.join(PAGES_DIR, 'list.json'), JSON.stringify(list, null, 2), 'utf8');
  }catch(e){ console.warn('Could not regenerate pages list', e); }
}

// create initial list.json
regenerateList();

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

    const outPath = path.join(PAGES_DIR, safe);
    await fs.promises.writeFile(outPath, content, 'utf8');

    // Regenerate pages list from directory
    try{
      await regenerateList();
    }catch(e){ console.warn('Failed to update pages list', e); }

    return res.json({ ok: true, path: '/pages/' + safe });
  }catch(err){
    console.error(err);
    return res.status(500).json({ error: 'Failed to save file' });
  }
});

// Serve repository files so you can open pages at http://localhost:3000/
app.use(express.static(process.cwd()));

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log(`Uploader server running at http://localhost:${PORT}/`));
