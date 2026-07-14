const fs = require('fs');
const file = 'frontend/src/main.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('ConfirmationService')) {
  content = content.replace(
    'import ToastService from "primevue/toastservice";',
    'import ToastService from "primevue/toastservice";\nimport ConfirmationService from "primevue/confirmationservice";\nimport ConfirmDialog from "primevue/confirmdialog";'
  );
  content = content.replace(
    'app.use(ToastService);',
    'app.use(ToastService);\napp.use(ConfirmationService);\napp.component("ConfirmDialog", ConfirmDialog);'
  );
  fs.writeFileSync(file, content);
  console.log('main.js updated with ConfirmationService and ConfirmDialog');
}
