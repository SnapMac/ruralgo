// build-config.js
const fs = require('fs');
const path = require('path');

const templatePath = path.join(__dirname, 'js', '01-config.template.js');
const outputPath = path.join(__dirname, 'js', '01-config.js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are missing.');
  process.exit(1);
}


// ==========================================
// 🔑 CONFIGURATION SUPABASE
// ==========================================
let content = fs.readFileSync(templatePath, 'utf8');
content = content.replace('{{SUPABASE_URL}}', url);
content = content.replace('{{SUPABASE_ANON_KEY}}', key);

fs.writeFileSync(outputPath, content);
console.log('✅ Supabase configuration generated successfully.');


// ==========================================
// 🔑 CONFIGURATION MAPBOX
// ==========================================
const mapboxToken = process.env.MAPBOX_TOKEN;
if (!mapboxToken) {
  console.error('❌ Error: MAPBOX_TOKEN environment variable is missing.');
  process.exit(1);
}
content = content.replace('{{MAPBOX_TOKEN}}', mapboxToken);
fs.writeFileSync(outputPath, content);
console.log('✅ Mapbox configuration generated successfully.');