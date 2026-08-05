import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicAvatarDir = path.resolve(__dirname, '../public/avatar');

try {
  if (fs.existsSync(publicAvatarDir)) {
    fs.rmSync(publicAvatarDir, { recursive: true, force: true });
  }
} catch (e) {
  // Ignored if already removed
}
