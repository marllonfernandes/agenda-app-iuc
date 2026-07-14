const fs = require('fs');
const file = 'frontend/src/App.vue';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('<ConfirmDialog />')) {
  content = content.replace(
    '<Toast position="top-center" />',
    '<Toast position="top-center" />\n    <ConfirmDialog />'
  );
  fs.writeFileSync(file, content);
  console.log('App.vue updated with ConfirmDialog');
}
