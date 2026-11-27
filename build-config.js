// build-config.js
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'js', '01-config.template.js');
const outputPath = path.join(__dirname, 'js', '01-config.js');

// ==========================================
// 🌍 DÉTECTION DU CONTEXTE NETLIFY
// ==========================================
// Netlify fournit process.env.CONTEXT :
//   - "production"      → build de la branche production
//   - "branch-deploy"   → build d'une branche (ex: main)
//   - "deploy-preview"  → aperçu d'une PR
// Tout ce qui n'est pas "production" est considéré comme "dev".
const context = process.env.CONTEXT || 'production';
const appEnv = (context === 'production') ? 'prod' : 'dev';
console.log(`🌍 [build] Contexte Netlify : "${context}" → APP_ENV = "${appEnv}"`);

// ==========================================
// 🔑 VARIABLES D'ENVIRONNEMENT REQUISES
// ==========================================
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;
const mapboxToken = process.env.MAPBOX_TOKEN;

if (!url || !key) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are missing.');
  process.exit(1);
}
if (!mapboxToken) {
  console.error('❌ Error: MAPBOX_TOKEN environment variable is missing.');
  process.exit(1);
}

// ==========================================
// 📄 LECTURE DU TEMPLATE
// ==========================================
let content = fs.readFileSync(templatePath, 'utf8');

// ==========================================
// 🔑 REMPLACEMENTS
// ==========================================

// --- Supabase ---
content = content.replace('{{SUPABASE_URL}}', url);
content = content.replace('{{SUPABASE_ANON_KEY}}', key);
console.log('✅ Supabase configuration injected.');

// --- Mapbox ---
content = content.replace('{{MAPBOX_TOKEN}}', mapboxToken);
console.log('✅ Mapbox configuration injected.');

// --- Environnement applicatif (prod / dev) ---
content = content.replace('{{APP_ENV}}', appEnv);
console.log(`✅ APP_ENV = "${appEnv}" injected.`);

// ==========================================
// 💾 ÉCRITURE DU FICHIER FINAL
// ==========================================
fs.writeFileSync(outputPath, content);
console.log('✅ Supabase configuration generated successfully.');