const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacement = 'const API = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;';
const replacementBaseUrl = 'const BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;';
const replacementBase = 'const BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" ? "http://localhost:5000/api" : import.meta.env.VITE_API_URL;';

walkDir('d:\\major-project\\frontend\\src', function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";')) {
                lines[i] = lines[i].replace('const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";', replacement);
                modified = true;
            } else if (lines[i].includes('const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";')) {
                lines[i] = lines[i].replace('const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";', replacementBaseUrl);
                modified = true;
            } else if (lines[i].includes('const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";')) {
                lines[i] = lines[i].replace('const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";', replacementBase);
                modified = true;
            } else if (lines[i].includes('const API = import.meta.env.VITE_API_URL;')) {
                // In case the previous script missed any or they don't have the || part
                lines[i] = lines[i].replace('const API = import.meta.env.VITE_API_URL;', replacement);
                modified = true;
            } else if (lines[i].includes('const BASE_URL = import.meta.env.VITE_API_URL;')) {
                lines[i] = lines[i].replace('const BASE_URL = import.meta.env.VITE_API_URL;', replacementBaseUrl);
                modified = true;
            } else if (lines[i].includes('const BASE = import.meta.env.VITE_API_URL;')) {
                lines[i] = lines[i].replace('const BASE = import.meta.env.VITE_API_URL;', replacementBase);
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
