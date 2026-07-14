<template>
  <div class="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-5">
    <div class="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <!-- Ícone e Título -->
      <div class="text-center mb-8">
        <div class="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-key text-indigo-400 text-3xl"></i>
        </div>
        <h2 class="text-xl font-bold text-white">Entrar em uma Organização</h2>
        <p class="text-slate-500 text-sm mt-1">Insira o código enviado pelo administrador.</p>
      </div>

      <!-- Processing via link token -->
      <div v-if="loading && !inviteCode" class="text-center py-8">
        <i class="pi pi-spin pi-spinner text-3xl text-primary-400 mb-3 block"></i>
        <p class="text-slate-400 text-sm">Validando convite...</p>
      </div>

      <div v-else class="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40 space-y-5">
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Código de Convite</label>
          <input
            v-model="inviteCode"
            type="text"
            placeholder="ABCD12"
            maxlength="8"
            class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white text-center text-3xl font-mono uppercase focus:outline-none focus:border-primary-500/60 focus:bg-primary-500/5 transition-all tracking-[0.3em]"
          />
        </div>

        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
          <div v-if="error" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-sm flex items-start gap-2">
            <i class="pi pi-exclamation-circle mt-0.5 shrink-0"></i>
            <span>{{ error }}</span>
          </div>
        </transition>

        <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 scale-95" enter-to-class="opacity-100 scale-100">
          <div v-if="success" class="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-4 rounded-2xl text-sm flex flex-col items-center gap-2 text-center">
            <i class="pi pi-check-circle text-2xl"></i>
            <span class="font-bold">Bem-vindo(a)! Redirecionando...</span>
          </div>
        </transition>

        <button
          :disabled="loading || !inviteCode"
          @click="handleJoin"
          class="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i v-if="loading" class="pi pi-spin pi-spinner"></i>
          {{ loading ? 'Processando...' : 'Confirmar Convite' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const route = useRoute();
const inviteCode = ref('');
const error = ref('');
const success = ref(false);
const loading = ref(false);

const handleJoin = async () => {
  error.value = '';
  success.value = false;
  loading.value = true;
  try {
    const response = await api.post('/auth/join', { inviteCode: inviteCode.value });
    success.value = true;
    setTimeout(() => {
      router.push(`/org/${response.data.orgId}`);
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Código de convite inválido ou já utilizado.';
  } finally {
    loading.value = false;
  }
};

const handleAcceptToken = async (token) => {
  loading.value = true;
  try {
    const response = await api.post('/auth/accept-invite', { token });
    success.value = true;
    setTimeout(() => {
      router.push(`/org/${response.data.orgId}`);
    }, 2000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Link de convite inválido ou já utilizado.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (route.query.token) {
    handleAcceptToken(route.query.token);
  }
});
</script>
