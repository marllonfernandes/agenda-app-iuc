<template>
  <div class="space-y-6 md:space-y-8 pb-20">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 text-left">
      <div>
        <h2 class="text-3xl md:text-4xl font-extrabold text-white mb-2 leading-tight">Painel Global</h2>
        <p class="text-slate-400">Gerencie todas as organizações, ative, inative ou edite configurações.</p>
      </div>
      <button @click="showAddForm = !showAddForm" class="btn-primary flex items-center gap-2">
        <i :class="['pi', showAddForm ? 'pi-times' : 'pi-plus']"></i> 
        {{ showAddForm ? 'Cancelar' : 'Nova Organização' }}
      </button>
    </div>
    
    <!-- Collapsible Add Form -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100" leave-to-class="transform -translate-y-4 opacity-0">
      <div v-if="showAddForm" class="card-premium">
        <h3 class="text-lg font-semibold text-white mb-6 flex items-center gap-2 text-left">
          <i class="pi pi-plus-circle text-primary-400"></i> Criar Nova Organização
        </h3>
        <div class="flex flex-col md:grid md:grid-cols-4 gap-4">
          <div class="flex flex-col gap-1.5 text-left">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Nome</label>
            <input v-model="newOrg.name" type="text" placeholder="Ex: Igreja Central" class="bg-dark-lighter border border-white/5 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 transition-colors" />
          </div>
          <div class="flex flex-col gap-1.5 text-left">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Slug</label>
            <input v-model="newOrg.slug" type="text" placeholder="ex: igreja-central" class="bg-dark-lighter border border-white/5 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 transition-colors" />
          </div>
          <div class="flex flex-col gap-1.5 text-left">
            <label class="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">E-mail do Administrador</label>
            <input v-model="newOrg.adminEmail" type="email" placeholder="email@exemplo.com" class="bg-dark-lighter border border-white/5 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-primary-500/50 transition-colors" />
          </div>
          <div class="flex items-end">
            <button @click="createOrg" class="btn-primary w-full flex items-center justify-center gap-2 h-[46px]">
              Confirmar Criação
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Content: Table (Web) or Cards (Mobile) -->
    <div class="space-y-4">
      <!-- TABLE VIEW (Desktop) -->
      <div class="hidden md:block glass rounded-2xl overflow-hidden shadow-2xl">
        <table class="w-full text-left">
          <thead class="bg-white/5 text-slate-400 text-xs uppercase tracking-widest font-semibold border-b border-white/5">
            <tr>
              <th class="px-6 py-4">Organização</th>
              <th class="px-6 py-4">Status</th>
              <th class="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr v-for="org in organizations" :key="org.id" class="hover:bg-white/5 transition-colors group">
              <td class="px-6 py-5">
                <div class="flex flex-col">
                  <span class="font-bold text-white text-lg">{{ org.name }}</span>
                  <span class="text-xs font-mono text-primary-400/80">{{ org.slug }}</span>
                  <div v-if="org.adminStatus === 'pending' && org.pendingInviteLink" class="mt-2 flex items-center gap-2 max-w-sm">
                    <span class="text-[10px] text-amber-500 uppercase font-bold tracking-wider shrink-0">Pendente:</span>
                    <input type="text" readonly :value="org.pendingInviteLink" class="bg-dark-lighter border border-white/5 rounded px-2 py-1 text-[10px] text-slate-400 w-full outline-none" />
                    <button @click="copyLink(org.pendingInviteLink)" class="h-6 px-2 rounded bg-primary-600/20 text-primary-400 hover:bg-primary-600/30 font-bold text-[10px] transition-colors shrink-0">
                      Copiar
                    </button>
                  </div>
                </div>
              </td>
              <td class="px-6 py-5">
                <button @click="toggleStatus(org)" :class="[
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all',
                  org.isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                ]">
                  {{ org.isActive ? 'Ativa' : 'Inativa' }}
                </button>
              </td>
              <td class="px-6 py-5 text-right">
                <div class="flex justify-end gap-2">
                  <button @click="generateInvite(org)" title="Gerar Convite" class="h-9 w-9 flex items-center justify-center rounded-lg bg-emerald-500/5 text-emerald-500/60 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all">
                    <i class="pi pi-user-plus text-sm"></i>
                  </button>
                  <button @click="editOrg(org)" class="h-9 w-9 flex items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                    <i class="pi pi-pencil text-sm"></i>
                  </button>
                  <button @click="confirmDeleteOrg(org.id)" class="h-9 w-9 flex items-center justify-center rounded-lg bg-rose-500/5 text-rose-500/60 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                    <i class="pi pi-trash text-sm"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- CARD VIEW (Mobile) -->
      <div class="md:hidden space-y-4">
        <div v-for="org in organizations" :key="org.id" class="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
          <div class="flex justify-between items-start">
            <div class="text-left flex-1 min-w-0">
              <h4 class="text-lg font-bold text-white truncate">{{ org.name }}</h4>
              <p class="text-xs font-mono text-primary-400 mt-0.5">{{ org.slug }}</p>
              <div v-if="org.adminEmail" class="mt-2 flex items-center gap-1.5">
                <i class="pi pi-shield text-[10px] text-amber-400"></i>
                <span class="text-[10px] text-amber-400 font-bold">Admin:</span>
                <span class="text-[10px] text-slate-400 truncate">{{ org.adminEmail }}</span>
                <span v-if="org.adminStatus === 'pending'" class="text-[9px] text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded font-bold uppercase">Pendente</span>
              </div>
            </div>
            <button @click="toggleStatus(org)" :class="[
              'shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ml-2',
              org.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            ]">
              {{ org.isActive ? 'Ativa' : 'Inativa' }}
            </button>
          </div>
          <div class="flex gap-2 pt-2 border-t border-white/5">
            <button @click="generateInvite(org)" class="flex-1 h-11 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500/70 hover:text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95">
              <i class="pi pi-user-plus text-sm"></i> Convite
            </button>
            <button @click="editOrg(org)" class="flex-1 h-11 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95">
              <i class="pi pi-pencil text-sm"></i> Editar
            </button>
            <button @click="confirmDeleteOrg(org.id)" class="flex-1 h-11 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-rose-500/70 hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95">
              <i class="pi pi-trash text-sm"></i> Excluir
            </button>
          </div>
          <div v-if="org.adminStatus === 'pending' && org.pendingInviteLink" class="pt-3 border-t border-white/5 mt-1">
            <p class="text-[10px] text-amber-500 font-bold mb-2 uppercase tracking-wider">Link de Convite (Admin)</p>
            <div class="flex items-center gap-2 bg-dark-lighter border border-white/5 rounded-xl p-1.5">
              <input type="text" readonly :value="org.pendingInviteLink" class="bg-transparent text-xs text-slate-300 px-2 outline-none w-full" />
              <button @click="copyLink(org.pendingInviteLink)" class="h-8 px-3 rounded-lg bg-primary-600/20 text-primary-400 active:bg-primary-600/30 font-bold text-xs transition-colors shrink-0">
                Copiar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="organizations.length === 0" class="py-20 text-center glass rounded-3xl border-dashed border-white/5">
        <i class="pi pi-building text-5xl text-slate-700 mb-4"></i>
        <p class="text-slate-500">Nenhuma organização registrada.</p>
      </div>
    </div>

    <!-- Invite Modal -->
    <div v-if="generatedInvite" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-dark/90 backdrop-blur-md" @click="generatedInvite = null"></div>
      <div class="card-premium relative w-full max-w-sm text-center">
        <h3 class="text-xl font-bold text-white mb-4">Novo Convite</h3>
        <p class="text-slate-400 text-sm mb-6">Compartilhe este código com o novo integrante da <strong>{{ selectedOrgName }}</strong>.</p>
        <div class="bg-primary-500/10 border border-primary-500/20 rounded-xl p-6 mb-6">
          <span class="text-4xl font-mono font-black text-primary-400 tracking-widest">{{ generatedInvite }}</span>
        </div>
        <p class="text-[10px] uppercase font-bold text-slate-500 mb-6">Válido por 7 dias</p>
        <button @click="generatedInvite = null" class="btn-primary w-full py-3">Fechar</button>
      </div>
    </div>

    <!-- Edit Modal (Bottom Sheet) -->
    <transition name="bottom-sheet">
      <div v-if="editingOrg" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="editingOrg = null"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[90vh] overflow-y-auto">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white">Editar Organização</h3>
            <button @click="editingOrg = null" class="h-8 w-8 flex items-center justify-center rounded-full bg-white/10 text-slate-400 active:bg-white/20">
              <i class="pi pi-times text-sm"></i>
            </button>
          </div>
          <div class="space-y-5">
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</label>
              <input v-model="editingOrg.name" type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary-500/60 transition-all" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">Slug</label>
              <input v-model="editingOrg.slug" type="text" class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary-500/60 transition-all" />
            </div>
            <div class="flex flex-col gap-2">
              <label class="text-xs font-bold text-slate-400 uppercase tracking-wider">E-mail do Admin da Organização</label>
              <input v-model="editingOrg.adminEmail" type="email" autocomplete="off" placeholder="admin@org.com" class="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-primary-500/60 transition-all" />
              <button @click="updateOrg(true)" class="w-full h-11 rounded-2xl bg-primary-600/15 border border-primary-500/20 text-primary-400 font-bold flex items-center justify-center gap-2 active:bg-primary-600/25 transition-all">
                <i class="pi pi-send"></i> Reenviar Convite para este E-mail
              </button>
            </div>
            <div class="flex gap-3 pt-2">
              <button @click="editingOrg = null" class="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold active:bg-white/10 transition-all">Cancelar</button>
              <button @click="updateOrg(false)" class="flex-1 h-14 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all">Salvar</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>

  <!-- Confirm Delete Bottom Sheet -->
  <transition name="bottom-sheet">
    <div v-if="orgToDelete" class="fixed inset-0 z-[200] flex flex-col justify-end">
      <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="orgToDelete = null"></div>
      <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
        <div class="text-center mb-6">
          <div class="h-14 w-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-trash text-rose-400 text-2xl"></i>
          </div>
          <h3 class="text-xl font-bold text-white mb-2">Excluir Organização?</h3>
          <p class="text-slate-400 text-sm">Esta ação é irreversível. Todos os dados serão perdidos.</p>
        </div>
        <div class="flex gap-3">
          <button @click="orgToDelete = null" class="flex-1 h-14 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold active:bg-white/10 transition-all">Cancelar</button>
          <button @click="executeDelete" class="flex-1 h-14 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20 active:scale-95 transition-all">Excluir</button>
        </div>
      </div>
    </div>
  </transition>

</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import api from '../services/api';

const toast = useToast();
const organizations = ref([]);
const newOrg = ref({ name: '', slug: '', adminEmail: '' });
const showAddForm = ref(false);
const editingOrg = ref(null);
const generatedInvite = ref(null);
const selectedOrgName = ref('');
const orgToDelete = ref(null);

const fetchOrgs = async () => {
  try {
    const response = await api.get('/admin/organizations');
    organizations.value = response.data;
  } catch (error) {
    console.error('Error loading orgs:', error);
  }
};

const copyLink = async (link) => {
  try {
    await navigator.clipboard.writeText(link);
    toast.add({ severity: 'success', summary: 'Copiado', detail: 'Link copiado para a área de transferência', life: 2000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível copiar o link', life: 2000 });
  }
};

const generateInvite = async (org) => {
  try {
    const response = await api.post('/admin/invite', {}, {
      headers: { 'x-org-id': org.id }
    });
    generatedInvite.value = response.data.inviteCode;
    selectedOrgName.value = org.name;
  } catch (err) {
    console.error('Falha ao gerar convite', err);
  }
};


const createOrg = async () => {
  if (!newOrg.value.name || !newOrg.value.slug) return;
  try {
    const response = await api.post('/admin/organizations', newOrg.value);
    newOrg.value = { name: '', slug: '', adminEmail: '' };
    showAddForm.value = false;
    await fetchOrgs();
    
    if (response.data.acceptLink) {
      toast.add({
        severity: 'success', 
        summary: 'Organização Criada', 
        detail: 'Envie este link para o administrador: ' + response.data.acceptLink, 
        life: 10000 
      });
    } else {
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Organização criada com sucesso.', life: 3000 });
    }
  } catch (error) {
    console.error('Error creating org:', error);
    toast.add({ severity: 'error', summary: 'Erro', detail: error.response?.data?.error || 'Erro ao criar organização', life: 5000 });
  }
};

const editOrg = (org) => {
  editingOrg.value = { ...org };
};

const updateOrg = async (reinvite = false) => {
  if (!editingOrg.value) return;
  try {
    const { id, name, slug, adminEmail } = editingOrg.value;
    const payload = { name, slug, adminEmail };
    if (reinvite) payload.reinvite = true;
    
    const response = await api.put(`/admin/organizations/${id}`, payload);
    
    if (response.data.acceptLink) {
      toast.add({
        severity: 'success', 
        summary: 'Convite Gerado', 
        detail: 'Envie este link para o administrador: ' + response.data.acceptLink, 
        life: 10000 
      });
    } else {
      toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Organização atualizada com sucesso.', life: 3000 });
    }
    
    editingOrg.value = null;
    await fetchOrgs();
  } catch (err) {
    console.error('Falha ao atualizar organização', err);
    toast.add({ severity: 'error', summary: 'Erro', detail: err.response?.data?.error || 'Erro ao atualizar organização', life: 5000 });
  }
};

const toggleStatus = async (org) => {
  try {
    await api.put(`/admin/organizations/${org.id}`, { isActive: !org.isActive });
    await fetchOrgs();
  } catch (err) {
    console.error('Falha ao alterar status', err);
  }
};

const confirmDeleteOrg = (id) => {
  orgToDelete.value = id;
};

const executeDelete = async () => {
  if (!orgToDelete.value) return;
  try {
    await api.delete(`/admin/organizations/${orgToDelete.value}`);
    orgToDelete.value = null;
    await fetchOrgs();
    toast.add({ severity: 'success', summary: 'Excluído', detail: 'Organização excluída com sucesso.', life: 3000 });
  } catch (err) {
    console.error('Falha ao excluir organização', err);
    toast.add({ severity: 'error', summary: 'Erro', detail: err.response?.data?.error || 'Erro ao excluir organização', life: 5000 });
  }
};

onMounted(fetchOrgs);
</script>



