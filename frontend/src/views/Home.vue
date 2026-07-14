<template>
  <div class="py-6 px-4 pb-10 space-y-10 max-w-lg mx-auto">
    
    <!-- Hero Section -->
    <div class="text-center pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold mb-6">
        <span class="flex h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse"></span>
        Gestão para Ministérios de Música
      </div>
      <h1 class="text-3xl font-black text-white leading-tight tracking-tight mb-3">
        Sua Agenda de Louvor,<br/>
        <span class="bg-gradient-to-r from-primary-400 to-indigo-400 bg-clip-text text-transparent">Simples e Poderosa.</span>
      </h1>
      <p class="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
        Organize escalas, repertórios e integrantes em um só lugar.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col gap-3 mt-8">
        <router-link v-if="isSuperUser" to="/admin" class="h-14 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-95 transition-all">
          <i class="pi pi-building"></i>
          Gerenciar Organizações
        </router-link>
        
        <template v-else-if="user">
          <div v-if="loadingOrgs" class="h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center gap-2">
            <i class="pi pi-spin pi-spinner text-slate-400"></i>
            <span class="text-slate-400 text-sm">Carregando...</span>
          </div>
          <router-link
            v-for="org in myOrgs"
            :key="org.id"
            :to="`/org/${org.id}`"
            class="h-14 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-95 transition-all"
          >
            <i class="pi pi-home"></i>
            Acessar {{ org.name }}
          </router-link>
          <router-link v-if="myOrgs.length === 0 && !loadingOrgs" to="/join" class="h-14 rounded-2xl bg-white/5 border border-white/10 text-white font-bold flex items-center justify-center gap-2 active:bg-white/10 transition-all">
            <i class="pi pi-key text-indigo-400"></i>
            Entrar com Código de Convite
          </router-link>
        </template>

        <template v-else>
          <router-link to="/register" class="h-14 rounded-2xl bg-primary-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-95 transition-all">
            <i class="pi pi-user-plus"></i>
            Criar Conta Grátis
          </router-link>
          <router-link to="/login" class="h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold flex items-center justify-center gap-2 active:bg-white/10 transition-all">
            <i class="pi pi-sign-in"></i>
            Fazer Login
          </router-link>
        </template>
      </div>
    </div>

    <!-- Features Cards -->
    <div id="features" class="space-y-4">
      <p class="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">Funcionalidades</p>

      <div class="grid grid-cols-1 gap-4">
        <div class="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-start gap-4">
          <div class="h-12 w-12 min-w-[48px] rounded-2xl bg-primary-500/10 flex items-center justify-center">
            <i class="pi pi-calendar text-primary-400 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-white mb-1">Agenda Inteligente</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Eventos com confirmação de presença e equipes vinculadas.</p>
          </div>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-start gap-4">
          <div class="h-12 w-12 min-w-[48px] rounded-2xl bg-indigo-500/10 flex items-center justify-center">
            <i class="pi pi-list text-indigo-400 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-white mb-1">Repertório Centralizado</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Músicas, tons, links do YouTube/Spotify e editor de cifras.</p>
          </div>
        </div>

        <div class="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-start gap-4">
          <div class="h-12 w-12 min-w-[48px] rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <i class="pi pi-users text-emerald-400 text-xl"></i>
          </div>
          <div>
            <h3 class="font-bold text-white mb-1">Gestão de Equipes</h3>
            <p class="text-slate-400 text-sm leading-relaxed">Grupos, ministérios e convites por e-mail ou código.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { user, isSuperUser } from '../services/auth';
import api from '../services/api';

const router = useRouter();
const myOrgs = ref([]);
const loadingOrgs = ref(true);

onMounted(async () => {
  if (user.value && !isSuperUser.value) {
    try {
      const response = await api.get('/user/organizations');
      myOrgs.value = response.data;
      if (myOrgs.value.length === 1) {
        router.push(`/org/${myOrgs.value[0].id}`);
      }
    } catch (err) {
      console.error('Failed to load user orgs:', err);
    } finally {
      loadingOrgs.value = false;
    }
  } else {
    loadingOrgs.value = false;
  }
});
</script>
