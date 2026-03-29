const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.argv[2];
const OWNER = 'r4hul-s3thi';
const REPO = 'SkillBridge';
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');

const files = fs.readdirSync(SCREENSHOTS_DIR).filter(f => f.endsWith('.png'));

async function uploadFile(filename) {
  const content = fs.readFileSync(path.join(SCREENSHOTS_DIR, filename)).toString('base64');
  const body = JSON.stringify({
    message: `docs: add ${filename} screenshot`,
    content,
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${OWNER}/${REPO}/contents/screenshots/${filename}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SkillBridge-Screenshot-Uploader',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        if (json.content) {
          console.log(`✅ ${filename} → ${json.content.download_url}`);
          resolve(json.content.download_url);
        } else {
          console.log(`❌ ${filename}: ${JSON.stringify(json.message)}`);
          resolve(null);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  const urls = {};
  for (const file of files) {
    const name = file.replace('.png', '');
    urls[name] = await uploadFile(file);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log('\n📋 URLs:');
  console.log(JSON.stringify(urls, null, 2));
})();
