const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const fileMap = {
  'App.jsx': 'app/App.jsx',
  'main.jsx': 'app/main.jsx',
  'index.css': 'assets/index.css',
  'pages/LoginPage.jsx': 'features/auth/LoginPage.jsx',
  'pages/SignupPage.jsx': 'features/auth/SignupPage.jsx',
  'pages/LandingPage.jsx': 'features/landing/LandingPage.jsx',
  'pages/EmployerDashboard.jsx': 'features/employer/EmployerDashboard.jsx',
  'pages/CreateInterviewPage.jsx': 'features/employer/CreateInterviewPage.jsx',
  'pages/EditInterviewPage.jsx': 'features/employer/EditInterviewPage.jsx',
  'pages/InterviewDetailsPage.jsx': 'features/employer/InterviewDetailsPage.jsx',
  'pages/EmployerInterviewResultPage.jsx': 'features/employer/EmployerInterviewResultPage.jsx',
  'pages/CandidateDashboard.jsx': 'features/candidate/CandidateDashboard.jsx',
  'pages/JoinInterviewPage.jsx': 'features/candidate/JoinInterviewPage.jsx',
  'pages/InterviewInstructionsPage.jsx': 'features/candidate/InterviewInstructionsPage.jsx',
  'pages/PreInterviewPage.jsx': 'features/candidate/PreInterviewPage.jsx',
  'pages/LiveInterviewPage.jsx': 'features/interview/LiveInterviewPage.jsx',
  'pages/VoiceTestPage.jsx': 'features/interview/VoiceTestPage.jsx',
  'components/Navbar.jsx': 'ui/shared/Navbar.jsx',
  'components/ProtectedRoute.jsx': 'ui/shared/ProtectedRoute.jsx',
};

const folderMap = {
  'components/InterviewConversation': 'ui/interview-room',
  'components/Voice': 'ui/voice',
  'components/Interview': 'ui/interview-form',
  'components/InterviewResult': 'ui/results',
};

// Compute all source files and their new destinations
const moves = {};

// Helper to get all files recursively
function getFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const allSrcFiles = getFiles(srcDir);

allSrcFiles.forEach(file => {
  const relPath = path.relative(srcDir, file).replace(/\\/g, '/');
  let newRelPath = null;

  // Check direct file mapping
  if (fileMap[relPath]) {
    newRelPath = fileMap[relPath];
  } else {
    // Check folder mapping
    for (const [oldFolder, newFolder] of Object.entries(folderMap)) {
      if (relPath.startsWith(oldFolder + '/')) {
        newRelPath = relPath.replace(oldFolder, newFolder);
        break;
      }
    }
  }

  // Only add if it's actually moving (e.g. not context/AuthContext.jsx)
  if (newRelPath) {
    moves[relPath] = newRelPath;
  } else {
    // Keep it in the same place
    moves[relPath] = relPath;
  }
});

// Calculate new import paths
function resolveImportPath(currentRelPath, targetRelPath) {
  const currentDir = path.dirname(currentRelPath);
  let rel = path.relative(currentDir, targetRelPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = './' + rel;
  }
  return rel;
}

function getOldTargetRelPath(currentOldRelPath, importString) {
  const currentDir = path.dirname(currentOldRelPath);
  let resolved = path.resolve(srcDir, currentDir, importString);
  let rel = path.relative(srcDir, resolved).replace(/\\/g, '/');
  return rel;
}

function findMatchingFile(relPath) {
  if (moves[relPath]) return relPath;
  if (moves[relPath + '.js']) return relPath + '.js';
  if (moves[relPath + '.jsx']) return relPath + '.jsx';
  if (moves[relPath + '/index.js']) return relPath + '/index.js';
  if (moves[relPath + '/index.jsx']) return relPath + '/index.jsx';
  return null;
}

const fileContents = {};

// Read all files, replace imports, then we'll save them
for (const oldRelPath of Object.keys(moves)) {
  const oldAbsPath = path.join(srcDir, oldRelPath);
  if (!oldAbsPath.match(/\.(js|jsx)$/)) {
    if (moves[oldRelPath] !== oldRelPath) {
      fileContents[oldRelPath] = fs.readFileSync(oldAbsPath);
    }
    continue;
  }

  let content = fs.readFileSync(oldAbsPath, 'utf8');
  const newRelPath = moves[oldRelPath];

  // This regex matches import and export statements: import X from 'Y'; export * from 'Y'; import 'Y'; etc.
  const importRegex = /(?:import|export)\s+(?:[^'"]+\s+from\s+)?['"]([^'"]+)['"]|import\s*\(['"]([^'"]+)['"]\)/g;
  
  content = content.replace(importRegex, (match, p1, p2) => {
    const importStr = p1 || p2;
    if (importStr && importStr.startsWith('.')) {
      const targetOldRelPath = getOldTargetRelPath(oldRelPath, importStr);
      const matchedFile = findMatchingFile(targetOldRelPath);
      if (matchedFile) {
        const targetNewRelPath = moves[matchedFile];
        let newImportStr = resolveImportPath(newRelPath, targetNewRelPath);
        
        const hasExt = importStr.match(/\.[jt]sx?$/);
        const newHasExt = newImportStr.match(/\.[jt]sx?$/);
        if (!hasExt && newHasExt) {
          newImportStr = newImportStr.replace(/\.[jt]sx?$/, '');
        } else if (!hasExt && newImportStr.endsWith('/index')) {
            newImportStr = newImportStr.replace(/\/index$/, '');
        }
        
        if (p1) return match.replace(p1, newImportStr);
        if (p2) return match.replace(p2, newImportStr);
      }
    }
    return match;
  });

  fileContents[oldRelPath] = content;
}

// Write the files out
for (const oldRelPath of Object.keys(moves)) {
  const newRelPath = moves[oldRelPath];
  const oldAbsPath = path.join(srcDir, oldRelPath);
  const newAbsPath = path.join(srcDir, newRelPath);
  
  if (newRelPath !== oldRelPath) {
    fs.mkdirSync(path.dirname(newAbsPath), { recursive: true });
    if (typeof fileContents[oldRelPath] === 'string') {
      fs.writeFileSync(newAbsPath, fileContents[oldRelPath], 'utf8');
    } else {
      fs.writeFileSync(newAbsPath, fileContents[oldRelPath]);
    }
    fs.unlinkSync(oldAbsPath);
  } else {
    // If it didn't move but contents changed
    if (typeof fileContents[oldRelPath] === 'string') {
      fs.writeFileSync(oldAbsPath, fileContents[oldRelPath], 'utf8');
    }
  }
}

// Cleanup empty directories
function cleanupEmptyDirs(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      cleanupEmptyDirs(fullPath);
    }
  }
  if (fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
  }
}

cleanupEmptyDirs(srcDir);
console.log("Restructure completed successfully.");
