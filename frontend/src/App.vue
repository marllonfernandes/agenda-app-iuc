<template>
  <div class="min-h-screen bg-dark flex flex-col">
    <Toast position="top-center" />
    <ConfirmDialog />
    
    <!-- Top App Bar — hidden when inside /org (OrgAdmin has its own header) -->
    <header v-if="!isOrgRoute" class="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-white/5">
      <div class="px-4 h-14 max-w-lg mx-auto w-full flex items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-2">
          <div class="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <i class="pi pi-calendar-plus text-white text-sm"></i>
          </div>
          <span class="text-base font-black text-white tracking-tight uppercase">Agenda<span class="text-primary-500">App</span></span>
        </router-link>

        <!-- Right actions -->
        <div class="flex items-center gap-3">
          <!-- Admin badge -->
          <router-link
            v-if="isSuperUser && user"
            to="/admin"
            class="text-[10px] uppercase font-bold text-primary-400 border border-primary-500/30 px-2.5 py-1 rounded-lg bg-primary-500/5"
          >
            Admin
          </router-link>

          <!-- Logged-in user indicator + logout -->
          <div v-if="user" class="flex items-center gap-2">
            <!-- User avatar with initial -->
            <div class="h-8 w-8 rounded-full bg-primary-500/15 border border-primary-500/30 flex items-center justify-center">
              <span class="text-xs font-bold text-primary-400">{{ userInitial }}</span>
            </div>
            <button
              @click="handleLogout"
              class="h-8 w-8 flex items-center justify-center rounded-full bg-white/5 text-slate-400 active:bg-white/10 transition-colors"
              title="Sair"
            >
              <i class="pi pi-sign-out text-sm"></i>
            </button>
          </div>

          <!-- Not logged in -->
          <router-link
            v-if="!user"
            to="/login"
            class="h-9 px-4 rounded-xl bg-primary-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary-500/20 active:scale-95 transition-all"
          >
            <i class="pi pi-sign-in text-xs"></i>
            Entrar
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main :class="['flex-1 w-full max-w-lg mx-auto relative', !isOrgRoute && 'pb-24']">
      <router-view v-if="!loading"></router-view>
      <div v-else class="flex flex-col items-center justify-center h-[50vh]">
        <div class="h-10 w-10 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin mb-4"></div>
        <p class="text-slate-500 text-sm font-medium">Carregando...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Toast from 'primevue/toast';
import { user, loading, logout, isSuperUser } from './services/auth';

const router = useRouter();
const route = useRoute();

// Hide global header when inside an org (OrgAdmin has its own native header)
const isOrgRoute = computed(() => route.path.startsWith('/org/'));

// First letter of user email for avatar
const userInitial = computed(() => {
  if (!user.value?.email) return '?';
  return user.value.email.charAt(0).toUpperCase();
});

const handleLogout = async () => {
  try {
    await logout();
    router.push('/login');
  } catch (err) {
    console.error('Logout failed', err);
  }
};
</script>
