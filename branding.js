const fs = require('fs');
const path = require('path');

function walkSync(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    if (fs.statSync(dirPath).isDirectory()) {
      walkSync(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  if (!filePath.match(/\.(js|jsx|html|md|json)$/)) return;
  if (filePath.includes('node_modules')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace "AI Interviewer" -> "Intervu AI"
  content = content.replace(/AI Interviewer/g, 'Intervu AI');
  
  // Replace remaining "AI Interview" -> "Intervu"
  content = content.replace(/AI Interview/g, 'Intervu');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated branding in: ${filePath}`);
  }
}

walkSync(path.join(__dirname, 'frontend', 'src'), processFile);
walkSync(path.join(__dirname, 'backend', 'src'), processFile);
processFile(path.join(__dirname, 'frontend', 'index.html'));
processFile(path.join(__dirname, 'frontend', 'package.json'));
processFile(path.join(__dirname, 'backend', 'package.json'));
processFile(path.join(__dirname, 'README.md'));
