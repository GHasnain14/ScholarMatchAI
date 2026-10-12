const fs = require('fs');

const content = fs.readFileSync('utils/academicPositionsDatabase.ts', 'utf8');
const entries = [];
// Split by country or object
const blocks = content.split('professorName:');

for (let i = 1; i < blocks.length; i++) {
  const block = blocks[i];
  const nameMatch = block.match(/^\s*["']([^"']+)["']/);
  const instMatch = block.match(/institution:\s*["']([^"']+)["']/);
  const linkMatch = block.match(/link:\s*["']([^"']+)["']/);
  if (nameMatch && instMatch && linkMatch) {
    entries.push({
      index: i,
      prof: nameMatch[1],
      inst: instMatch[1],
      link: linkMatch[1]
    });
  }
}

console.log('Total entries:', entries.length);

async function checkUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    clearTimeout(timeout);
    return res.status;
  } catch (err) {
    clearTimeout(timeout);
    return 'ERR: ' + err.name + ' - ' + err.message;
  }
}

async function run() {
  const results = [];
  for (let e of entries) {
    const status = await checkUrl(e.link);
    const ok = (status >= 200 && status < 400);
    results.push({ ...e, status, ok });
    if (!ok) {
      console.log(`FAIL [${e.index}] ${e.prof} | ${e.inst} | ${e.link} -> ${status}`);
    } else {
      console.log(`OK   [${e.index}] ${e.prof} -> ${status}`);
    }
  }
}

run();
