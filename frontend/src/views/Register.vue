<template>
  <div class="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center p-5">
    <!-- Logo / Branding -->
    <div class="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div class="h-20 w-20 rounded-3xl bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 mx-auto mb-5 ring-4 ring-primary-500/20">
        <i class="pi pi-calendar-plus text-white text-4xl"></i>
      </div>
      <h1 class="text-2xl font-black text-white tracking-tight">Agenda<span class="text-primary-400">App</span></h1>
      <p class="text-slate-500 text-sm mt-1">Para ministérios de música</p>
    </div>

    <!-- Card Form -->
    <div class="w-full max-w-sm animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div class="bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/40">
        <h2 class="text-xl font-bold text-white mb-6 text-center">Criar uma conta</h2>
        
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail</label>
            <div class="relative">
              <i class="pi pi-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
              <input
                v-model="email"
                type="email"
                required
                autocomplete="email"
                placeholder="seu@email.com"
                class="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500/60 focus:bg-primary-500/5 transition-all text-sm"
              />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Senha</label>
            <div class="relative">
              <i class="pi pi-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm"></i>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="new-password"
                placeholder="No mínimo 6 caracteres"
                class="w-full bg-white/5 border border-white/10 rounded-2xl pl-11 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-primary-500/60 focus:bg-primary-500/5 transition-all text-sm"
              />
            </div>
          </div>

          <transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0">
            <div v-if="error" class="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-2xl text-sm flex items-start gap-2">
              <i class="pi pi-exclamation-circle mt-0.5 shrink-0"></i>
              <span>{{ error }}</span>
            </div>
          </transition>

          <button
            type="submit"
            :disabled="loading"
            class="w-full h-14 rounded-2xl bg-primary-600 hover:bg-primary-500 active:bg-primary-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            <i v-if="loading" class="pi pi-spin pi-spinner"></i>
            {{ loading ? 'Criando conta...' : 'Registrar' }}
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-slate-500 text-sm">
        Já possui conta?
        <router-link to="/login" class="text-primary-400 font-bold ml-1">Fazer Login</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../services/auth';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleRegister = async () => {
  error.value = '';
  loading.value = true;
  try {
    await register(email.value, password.value);
    router.push('/');
  } catch (err) {
    console.error('Register error:', err);
    if (err.response && err.response.status === 400) {
      error.value = err.response.data.error || 'Erro na requisição. Verifique os dados inseridos.';
    } else {
      error.value = 'Falha ao criar conta. Tente novamente mais tarde.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
