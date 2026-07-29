import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walkSync(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(file => {
    let dirPath = path.join(dir, file);
    if (fs.statSync(dirPath).isDirectory()) {
      if (file === 'node_modules' || file === '.git' || file === 'dist' || file === 'build') return;
      walkSync(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

function processFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  if (!filePath.match(/\.(js|jsx|html|md|json)$/)) return;
  if (filePath.includes('node_modules') || filePath.includes('package-lock.json')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replace branding variants with InterviewOS
  content = content.replace(/Intervu AI/g, 'InterviewOS');
  content = content.replace(/Intervu/g, 'InterviewOS');
  content = content.replace(/AI Interviewer/g, 'InterviewOS');
  content = content.replace(/AI Interview Platform/g, 'InterviewOS Platform');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated branding in: ${filePath}`);
  }
}

console.log("Starting rebranding to InterviewOS...");
walkSync(path.join(__dirname, 'frontend'), processFile);
walkSync(path.join(__dirname, 'backend'), processFile);
processFile(path.join(__dirname, 'PROJECT_ROADMAP_AND_MONETIZATION.md'));
processFile(path.join(__dirname, 'AI_INTERVIEW_FLOW.md'));
processFile(path.join(__dirname, 'package.json'));
processFile(path.join(__dirname, 'left.md'));
console.log("Rebranding to InterviewOS completed!");
