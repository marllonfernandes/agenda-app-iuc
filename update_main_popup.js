const fs = require('fs');
const file = 'frontend/src/main.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ConfirmPopup')) {
  content = content.replace(
    'import ConfirmDialog from "primevue/confirmdialog";',
    'import ConfirmDialog from "primevue/confirmdialog";\nimport ConfirmPopup from "primevue/confirmpopup";'
  );
  content = content.replace(
    'app.component("ConfirmDialog", ConfirmDialog);',
    'app.component("ConfirmDialog", ConfirmDialog);\napp.component("ConfirmPopup", ConfirmPopup);'
  );
  fs.writeFileSync(file, content);
  console.log('main.js updated with ConfirmPopup');
}
