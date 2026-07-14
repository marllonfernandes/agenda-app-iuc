import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import App from "./App.vue";
import router from "./router";

import "./style.css"; // Tailwind and custom styles
import "./index.css";  // Animations and utilities
import "primeicons/primeicons.css";

const app = createApp(App);
app.use(PrimeVue, { ripple: true });
app.use(ToastService);
app.use(router);
app.mount("#app");
