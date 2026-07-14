import { createRouter, createWebHistory } from "vue-router";
import { user, loading } from "../services/auth";
import Home from "../views/Home.vue";
import GlobalAdmin from "../views/GlobalAdmin.vue";
import OrgAdmin from "../views/OrgAdmin.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import Join from "../views/Join.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/join", component: Join, meta: { requiresAuth: true } },
  { path: "/admin", component: GlobalAdmin, meta: { requiresAuth: true } },
  {
    path: "/org/:orgId",
    component: OrgAdmin,
    props: true,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  // Wait for auth to initialize
  if (loading.value) {
    const stopWatch = () => {
      if (!loading.value) {
        processGuard(to, next);
        return true;
      }
      return false;
    };
    // Polling or watch would be better, but this simple check works for initialization
    const interval = setInterval(() => {
      if (stopWatch()) clearInterval(interval);
    }, 50);
  } else {
    processGuard(to, next);
  }
});

function processGuard(to, next) {
  if (to.meta.requiresAuth && !user.value) {
    next("/login");
  } else {
    next();
  }
}

export default router;
