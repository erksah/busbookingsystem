const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('d:\\major-project\\frontend\\src', function(filePath) {
    if (filePath.endsWith('.jsx') || filePath.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // Update lines like: const API = import.meta.env.VITE_API_URL;
        const regex = /(const\s+(?:API|BASE)\s*=\s*import\.meta\.env\.VITE_API_URL)\s*;/g;
        if (regex.test(content)) {
            content = content.replace(regex, '$1 || "http://localhost:5000/api";');
            modified = true;
        }

        // Just in case there are ones with out the semicolon
        const regex2 = /(const\s+(?:API|BASE)\s*=\s*import\.meta\.env\.VITE_API_URL)(?!\s*\|\|\s*["'])(?!\s*;)/g;
        // This is a bit risky but let's stick to the ones with semicolon or newlines.
        
        // Let's do a more generic replacement that only targets exact matches that don't have || already.
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('import.meta.env.VITE_API_URL') && !lines[i].includes('||')) {
                lines[i] = lines[i].replace(/import\.meta\.env\.VITE_API_URL;?/, 'import.meta.env.VITE_API_URL || "http://localhost:5000/api";');
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log('Updated:', filePath);
        }
    }
});
