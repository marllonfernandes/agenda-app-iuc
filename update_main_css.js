const fs = require('fs');
const file = 'frontend/src/main.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('primevue.min.css')) {
  content = content.replace(
    'import "primeicons/primeicons.css";',
    'import "primeicons/primeicons.css";\nimport "primevue/resources/themes/lara-dark-indigo/theme.css";\nimport "primevue/resources/primevue.min.css";'
  );
  fs.writeFileSync(file, content);
  console.log('main.js updated with PrimeVue CSS');
}
