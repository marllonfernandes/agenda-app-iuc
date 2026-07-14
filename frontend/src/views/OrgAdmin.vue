<template>
  <div class="h-full flex flex-col relative bg-dark min-h-screen">

    <!-- Native App Header -->
    <header class="sticky top-0 z-40 bg-dark/95 backdrop-blur-md border-b border-white/5">
      <div class="px-4 h-14 flex items-center justify-between gap-3">
        <router-link to="/" class="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-slate-400 active:bg-white/10 transition-colors shrink-0">
          <i class="pi pi-arrow-left text-sm"></i>
        </router-link>
        <div class="flex-1 min-w-0 text-center">
          <p class="text-white font-bold text-sm truncate">{{ orgName || 'Carregando...' }}</p>
        </div>
        <button @click="handleLogout" class="h-9 w-9 flex items-center justify-center rounded-full bg-white/5 text-slate-400 active:bg-white/10 transition-colors shrink-0">
          <i class="pi pi-sign-out text-sm"></i>
        </button>
      </div>
    </header>
    
    <!-- Main Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto pb-24 pt-4 px-4 space-y-6">
      
      <!-- AGENDA TAB -->
      <div v-if="activeTab === 'agenda'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-black text-white">Agenda</h2>
        </div>

        <div class="space-y-4">
          <div v-for="event in events" :key="event.id" class="card-premium !p-5 flex items-center gap-4 active:scale-95 transition-transform" @click="openEventManager(event)">
            <div class="h-14 w-14 rounded-2xl bg-primary-500/10 flex flex-col items-center justify-center text-primary-400 border border-primary-500/20">
              <span class="text-[10px] font-bold uppercase tracking-widest">{{ getMonthStr(event.date) }}</span>
              <span class="text-xl font-black leading-none">{{ getDayStr(event.date) }}</span>
            </div>
            <div class="flex-1">
              <h4 class="font-bold text-white text-lg leading-tight">{{ event.title }}</h4>
              <p class="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <i class="pi pi-clock text-[10px]"></i>
                {{ getTimeStr(event.date) }}
                <span v-if="event.groupId" class="ml-2 text-primary-400 font-bold bg-primary-500/10 px-2 py-0.5 rounded">Equipe vinculada</span>
              </p>
            </div>
          </div>
          
          <div v-if="events.length === 0" class="py-12 text-center glass rounded-3xl border-dashed border-white/5">
            <i class="pi pi-calendar-times text-4xl text-slate-700 mb-3"></i>
            <p class="text-slate-500 text-sm">Nenhum evento agendado.</p>
          </div>
        </div>
        
        <!-- FAB Agenda -->
        <button v-if="canCreateEvent" @click="showNewEventModal = true" class="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all z-40">
          <i class="pi pi-plus text-xl"></i>
        </button>
      </div>

      <!-- REPERTÓRIO TAB -->
      <div v-if="activeTab === 'repertorio'" class="animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-black text-white">Repertório</h2>
          <button v-if="canCreateRepertoire" @click="showImportPlaylistModal = true" class="h-9 px-3 rounded-lg bg-red-600/20 text-red-400 active:bg-red-600/30 font-bold text-xs flex items-center gap-2 transition-colors">
            <i class="pi pi-youtube"></i>
            Importar
          </button>
        </div>

        <div class="flex bg-white/5 p-1 rounded-xl mb-6">
          <button @click="activeRepertoireTab = 'musicas'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-colors', activeRepertoireTab === 'musicas' ? 'bg-white/10 text-white' : 'text-slate-400']">Músicas</button>
          <button @click="activeRepertoireTab = 'agrupadores'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-colors', activeRepertoireTab === 'agrupadores' ? 'bg-white/10 text-white' : 'text-slate-400']">Agrupadores</button>
        </div>

        <div v-if="activeRepertoireTab === 'musicas'" class="space-y-3">
          <div v-for="song in songs" :key="song.id" class="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3 active:bg-white/5 transition-colors cursor-pointer" @click="openSongOptions(song)">
            <img v-if="song.thumbnail" :src="song.thumbnail" alt="Capa" class="h-10 w-10 min-w-[40px] rounded-xl object-cover border border-white/10" />
            <div v-else class="h-10 w-10 min-w-[40px] flex items-center justify-center rounded-xl bg-primary-500/10 text-primary-400 font-bold text-sm">
              {{ song.key || '?' }}
            </div>
            <div class="flex-1 truncate">
              <h4 class="font-bold text-white text-base truncate">{{ song.title }}</h4>
              <p class="text-xs text-slate-400 truncate">{{ song.artist }}</p>
            </div>
            <div class="h-10 w-10 flex items-center justify-center text-slate-400">
              <i class="pi pi-ellipsis-v"></i>
            </div>
          </div>

          <div v-if="songs.length === 0" class="py-12 text-center glass rounded-3xl border-dashed border-white/5">
            <i class="pi pi-music text-4xl text-slate-700 mb-3"></i>
            <p class="text-slate-500 text-sm">Nenhuma música cadastrada.</p>
          </div>
        </div>

        <div v-if="activeRepertoireTab === 'agrupadores'" class="space-y-3">
          <div v-for="setlist in setlists" :key="setlist.id" class="glass p-4 rounded-2xl border border-white/5 flex items-center gap-3 active:bg-white/5 transition-colors cursor-pointer" @click="openSetlistManager(setlist)">
            <div class="h-10 w-10 min-w-[40px] flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-400 font-bold text-sm">
              <i class="pi pi-list"></i>
            </div>
            <div class="flex-1 truncate">
              <h4 class="font-bold text-white text-base truncate">{{ setlist.title }}</h4>
              <p class="text-xs text-slate-400 truncate">{{ setlist.songs?.length || 0 }} músicas</p>
            </div>
          </div>

          <div v-if="setlists.length === 0" class="py-12 text-center glass rounded-3xl border-dashed border-white/5">
            <i class="pi pi-list text-4xl text-slate-700 mb-3"></i>
            <p class="text-slate-500 text-sm">Nenhum agrupador criado.</p>
          </div>
        </div>

        <!-- FAB Repertório -->
        <button v-if="canCreateRepertoire && activeRepertoireTab === 'musicas'" @click="showNewSongModal = true" class="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all z-40">
          <i class="pi pi-plus text-xl"></i>
        </button>
        <button v-if="canCreateRepertoire && activeRepertoireTab === 'agrupadores'" @click="showNewSetlistModal = true" class="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all z-40">
          <i class="pi pi-plus text-xl"></i>
        </button>
      </div>

      <!-- EQUIPE TAB -->
      <div v-if="activeTab === 'equipe'" class="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-8">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-2xl font-black text-white">Equipe</h2>
        </div>

        <!-- Grupos Section -->
        <div class="space-y-3">
          <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Ministérios / Grupos</h3>
          <div class="grid grid-cols-2 gap-3">
            <div v-for="group in groups" :key="group.id" @click="openGroupManager(group)" class="glass p-4 rounded-2xl border border-white/5 flex flex-col gap-2 active:bg-white/5">
              <i class="pi pi-users text-primary-400 text-lg"></i>
              <h4 class="font-bold text-white text-sm">{{ group.name }}</h4>
            </div>
            <div v-if="groups.length === 0" class="col-span-2 p-4 text-center border border-dashed border-white/10 rounded-2xl text-slate-500 text-sm">
              Nenhum grupo criado.
            </div>
          </div>
        </div>

        <!-- Integrantes Section -->
        <div class="space-y-3">
          <h3 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Integrantes</h3>
          
          <!-- App Users -->
          <div v-for="userMember in activeMemberships" :key="userMember.id" @click="openAccessManager(userMember)" class="glass p-3 rounded-2xl border border-white/5 flex items-center gap-3" :class="{'active:bg-white/5 cursor-pointer': canManagePermissions || userMember.userId === user?.uid}">
            <div class="h-10 w-10 min-w-[40px] rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/10">
              {{ userMember.avatar || '👤' }}
            </div>
            <div class="flex-1 truncate">
              <p class="font-bold text-white text-sm truncate">{{ userMember.invitedEmail || userMember.userId }}</p>
              <div class="flex gap-2 items-center">
                <span class="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">App</span>
                <span v-if="userMember.role === 'admin'" class="text-[10px] text-amber-400 uppercase font-bold tracking-wider">Admin</span>
              </div>
            </div>
            <div v-if="canManagePermissions" class="text-slate-400">
              <i class="pi pi-shield"></i>
            </div>
          </div>

          <!-- Pending Invites -->
          <div v-for="pending in pendingMemberships" :key="pending.id" class="glass p-3 rounded-2xl border border-white/5 border-dashed flex flex-col gap-3 opacity-80">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 min-w-[40px] rounded-full bg-white/5 flex items-center justify-center text-slate-400 text-xs font-bold">
                <i class="pi pi-envelope-delay"></i>
              </div>
              <div class="flex-1 truncate">
                <p class="font-bold text-white text-sm truncate">{{ pending.invitedEmail }}</p>
                <span class="text-[10px] text-amber-500 uppercase font-bold tracking-wider">Convite por E-mail (Pendente)</span>
              </div>
            </div>
            <div v-if="pending.inviteToken" class="flex items-center gap-2 bg-dark-lighter border border-white/5 rounded-xl p-1.5 mt-1">
              <input type="text" readonly :value="getInviteLink(pending.inviteToken)" class="bg-transparent text-xs text-slate-300 px-2 outline-none w-full" />
              <button @click="copyToClipboard(getInviteLink(pending.inviteToken))" class="h-8 px-3 rounded-lg bg-primary-600/20 text-primary-400 active:bg-primary-600/30 font-bold text-xs transition-colors shrink-0">
                Copiar Link
              </button>
            </div>
          </div>

          <!-- Active Invite Codes (WhatsApp) -->
          <div v-for="invite in activeInvites" :key="invite.id" class="glass p-3 rounded-2xl border border-white/5 border-dashed flex flex-col gap-3">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 min-w-[40px] rounded-full bg-primary-500/10 flex items-center justify-center text-primary-400 text-xs font-bold">
                <i class="pi pi-key"></i>
              </div>
              <div class="flex-1 truncate">
                <p class="font-bold text-white text-sm truncate">Código: {{ invite.code }}</p>
                <span class="text-[10px] text-primary-400 uppercase font-bold tracking-wider">Acesso via Link Direto</span>
              </div>
            </div>
            <div class="flex items-center gap-2 bg-dark-lighter border border-white/5 rounded-xl p-1.5 mt-1">
              <input type="text" readonly :value="getInviteLink(invite.code)" class="bg-transparent text-xs text-slate-300 px-2 outline-none w-full" />
              <button @click="copyToClipboard(getInviteLink(invite.code))" class="h-8 px-3 rounded-lg bg-primary-600/20 text-primary-400 active:bg-primary-600/30 font-bold text-xs transition-colors shrink-0">
                Copiar Link
              </button>
            </div>
          </div>

          <!-- Manual Members -->
          <div v-for="member in members" :key="member.id" class="glass p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div class="h-10 w-10 min-w-[40px] rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold">
              {{ member.avatar || member.name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1 truncate">
              <p class="font-bold text-white text-sm truncate">{{ member.name }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ member.instrument }}</p>
            </div>
          </div>

          <div v-if="members.length === 0 && activeMemberships.length === 0 && pendingMemberships.length === 0" class="py-6 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-2xl">
            Nenhum membro adicionado.
          </div>
        </div>

        <!-- FAB Equipe -->
        <button v-if="canCreateTeam" @click="showEquipeActions = true" class="fixed bottom-24 right-6 h-14 w-14 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/40 hover:scale-105 active:scale-95 transition-all z-40">
          <i class="pi pi-plus text-xl"></i>
        </button>
      </div>

    </div>

    <!-- BOTTOM NAVIGATION -->
    <nav class="fixed bottom-0 left-0 right-0 z-50 bg-dark/95 backdrop-blur-xl border-t border-white/5 pb-safe">
      <div class="flex justify-around items-center h-16 max-w-lg mx-auto">
        <button @click="activeTab = 'agenda'" class="flex flex-col items-center justify-center w-full h-full transition-colors" :class="activeTab === 'agenda' ? 'text-primary-400' : 'text-slate-500'">
          <i :class="['pi text-[22px] mb-1', activeTab === 'agenda' ? 'pi-calendar-plus' : 'pi-calendar']"></i>
          <span class="text-[10px] font-semibold tracking-wide">Agenda</span>
        </button>
        <button @click="activeTab = 'repertorio'" class="flex flex-col items-center justify-center w-full h-full transition-colors" :class="activeTab === 'repertorio' ? 'text-primary-400' : 'text-slate-500'">
          <i :class="['pi text-[22px] mb-1', activeTab === 'repertorio' ? 'pi-book' : 'pi-bookmark']"></i>
          <span class="text-[10px] font-semibold tracking-wide">Repertório</span>
        </button>
        <button @click="activeTab = 'equipe'" class="flex flex-col items-center justify-center w-full h-full transition-colors" :class="activeTab === 'equipe' ? 'text-primary-400' : 'text-slate-500'">
          <i :class="['pi text-[22px] mb-1', activeTab === 'equipe' ? 'pi-users' : 'pi-user']"></i>
          <span class="text-[10px] font-semibold tracking-wide">Equipe</span>
        </button>
      </div>
    </nav>

    <!-- MODALS / BOTTOM SHEETS -->
    
    <!-- Novo Evento -->
    <transition name="bottom-sheet">
      <div v-if="showNewEventModal" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showNewEventModal = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-6">Novo Evento</h3>
          <div class="space-y-4">
            <input v-model="newEvent.title" placeholder="Título (Culto, Ensaio...)" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <input v-model="newEvent.date" type="datetime-local" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <select v-model="newEvent.groupId" class="w-full bg-dark border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500 appearance-none">
              <option value="">Selecione uma Equipe (Opcional)</option>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
            <button @click="addEvent" class="btn-primary w-full py-4 mt-2">Agendar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Nova Música -->
    <transition name="bottom-sheet">
      <div v-if="showNewSongModal" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showNewSongModal = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-6">Nova Música</h3>
          <div class="space-y-4">
            <input v-model="newSong.title" placeholder="Título" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <input v-model="newSong.artist" placeholder="Artista" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <input v-model="newSong.key" placeholder="Tom (ex: G)" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <button @click="addSong" class="btn-primary w-full py-4 mt-2">Adicionar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Novo Agrupador (Setlist) -->
    <transition name="bottom-sheet">
      <div v-if="showNewSetlistModal" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showNewSetlistModal = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-6">Novo Agrupador</h3>
          <div class="space-y-4">
            <input v-model="newSetlist.title" placeholder="Nome (ex: Louvor Domingo)" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <button @click="createSetlist" class="btn-primary w-full py-4 mt-2">Criar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Adicionar Músicas/Agrupadores ao Evento -->
    <transition name="bottom-sheet">
      <div v-if="showAddSongsToEventModal" class="fixed inset-0 z-[110] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showAddSongsToEventModal = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative h-[80vh] flex flex-col pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 shrink-0"></div>
          <h3 class="text-xl font-bold text-white mb-4 shrink-0">Adicionar Repertório</h3>
          
          <div class="flex bg-white/5 p-1 rounded-xl mb-4 shrink-0">
            <button @click="activeRepertoireTab = 'musicas'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-colors', activeRepertoireTab === 'musicas' ? 'bg-white/10 text-white' : 'text-slate-400']">Músicas</button>
            <button @click="activeRepertoireTab = 'agrupadores'" :class="['flex-1 py-2 text-sm font-bold rounded-lg transition-colors', activeRepertoireTab === 'agrupadores' ? 'bg-white/10 text-white' : 'text-slate-400']">Agrupadores</button>
          </div>

          <div class="flex-1 overflow-y-auto space-y-2 mb-4">
            <template v-if="activeRepertoireTab === 'musicas'">
              <div v-for="song in songs" :key="song.id" class="glass p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <input type="checkbox" :value="song.id" v-model="eventSongsSelection" class="w-5 h-5 rounded border-white/10 bg-dark text-primary-500 focus:ring-primary-500 focus:ring-offset-dark" />
                <img v-if="song.thumbnail" :src="song.thumbnail" alt="Capa" class="h-8 w-8 min-w-[32px] rounded-lg object-cover border border-white/10" />
                <div v-else class="h-8 w-8 min-w-[32px] flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 font-bold text-xs">
                  {{ song.key || '?' }}
                </div>
                <div class="flex-1 truncate">
                  <h4 class="font-bold text-white text-sm truncate">{{ song.title }}</h4>
                  <p class="text-[10px] text-slate-400 truncate">{{ song.artist }}</p>
                </div>
              </div>
            </template>
            <template v-if="activeRepertoireTab === 'agrupadores'">
              <div v-for="setlist in setlists" :key="setlist.id" class="glass p-3 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                <div class="flex items-center gap-3 flex-1 truncate">
                  <div class="h-8 w-8 min-w-[32px] flex items-center justify-center rounded-lg bg-primary-500/20 text-primary-400 font-bold text-xs">
                    <i class="pi pi-list"></i>
                  </div>
                  <div class="flex-1 truncate">
                    <h4 class="font-bold text-white text-sm truncate">{{ setlist.title }}</h4>
                    <p class="text-[10px] text-slate-400 truncate">{{ setlist.songs?.length || 0 }} músicas</p>
                  </div>
                </div>
                <button @click="importSetlistToEvent(setlist)" class="px-3 py-1.5 rounded-lg bg-primary-500/20 text-primary-400 text-xs font-bold active:bg-primary-500/30">
                  Importar
                </button>
              </div>
            </template>
          </div>
          <button v-if="activeRepertoireTab === 'musicas'" @click="saveEventSongs" class="btn-primary w-full py-4 shrink-0">Salvar Seleção</button>
        </div>
      </div>
    </transition>

    <!-- Gerenciar Agrupador (Setlist) Full Screen -->
    <transition name="fade">
      <div v-if="selectedSetlist" class="fixed inset-0 z-[100] flex flex-col bg-dark pb-safe">
        <div class="px-4 h-14 border-b border-white/5 flex items-center justify-between shrink-0">
          <span class="font-bold text-white text-sm">Agrupador: {{ selectedSetlist.title }}</span>
          <button @click="selectedSetlist = null" class="text-primary-400 font-bold text-sm">Fechar</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 flex flex-col">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Selecionar Músicas</h4>
          </div>
          <div class="flex-1 overflow-y-auto space-y-2 mb-4">
            <div v-for="song in songs" :key="song.id" class="glass p-3 rounded-xl border border-white/5 flex items-center gap-3">
              <input type="checkbox" :value="song.id" v-model="setlistSongsSelection" class="w-5 h-5 rounded border-white/10 bg-dark text-primary-500 focus:ring-primary-500 focus:ring-offset-dark" />
              <img v-if="song.thumbnail" :src="song.thumbnail" alt="Capa" class="h-8 w-8 min-w-[32px] rounded-lg object-cover border border-white/10" />
              <div v-else class="h-8 w-8 min-w-[32px] flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 font-bold text-xs">
                {{ song.key || '?' }}
              </div>
              <div class="flex-1 truncate">
                <h4 class="font-bold text-white text-sm truncate">{{ song.title }}</h4>
                <p class="text-[10px] text-slate-400 truncate">{{ song.artist }}</p>
              </div>
            </div>
          </div>
          <div class="space-y-3 shrink-0">
            <button @click="saveSetlistSongs" class="btn-primary w-full py-4">Salvar Músicas</button>
            <button @click="deleteSetlist(selectedSetlist.id)" class="w-full py-4 rounded-xl border border-red-500/20 text-red-400 font-bold active:bg-red-500/10 transition-colors">Excluir Agrupador</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Ações da Equipe (Action Sheet) -->
    <transition name="bottom-sheet">
      <div v-if="showEquipeActions" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showEquipeActions = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-4 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6 mt-2"></div>
          <div class="space-y-2 mb-4">
            <button @click="openEmailInviteForm" class="w-full p-4 flex items-center gap-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
              <i class="pi pi-envelope text-emerald-400 text-xl"></i>
              <div class="text-left flex-1">
                <p class="text-white font-bold text-sm">Convidar Integrante (App)</p>
                <p class="text-xs text-slate-500">Enviar link de acesso por email</p>
              </div>
            </button>
            <button @click="openOrgInviteGenerator" class="w-full p-4 flex items-center gap-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
              <i class="pi pi-key text-primary-400 text-xl"></i>
              <div class="text-left flex-1">
                <p class="text-white font-bold text-sm">Gerar Código de Acesso</p>
                <p class="text-xs text-slate-500">Código para compartilhar no WhatsApp</p>
              </div>
            </button>
            <button @click="showNewGroupModal = true; showEquipeActions = false" class="w-full p-4 flex items-center gap-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
              <i class="pi pi-users text-indigo-400 text-xl"></i>
              <div class="text-left flex-1">
                <p class="text-white font-bold text-sm">Criar Grupo/Ministério</p>
                <p class="text-xs text-slate-500">Agrupar pessoas</p>
              </div>
            </button>
            <button @click="showNewMemberModal = true; showEquipeActions = false" class="w-full p-4 flex items-center gap-4 bg-white/5 rounded-2xl active:bg-white/10 transition-colors">
              <i class="pi pi-user-plus text-slate-400 text-xl"></i>
              <div class="text-left flex-1">
                <p class="text-white font-bold text-sm">Adicionar Membro Manual</p>
                <p class="text-xs text-slate-500">Pessoas sem acesso ao app</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Formulários da Equipe (Bottom Sheets) -->

    <transition name="bottom-sheet">
      <div v-if="showEmailInviteForm" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showEmailInviteForm = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-6">Convidar por E-mail</h3>
          <div class="space-y-4">
            <input v-model="inviteEmail" type="email" placeholder="E-mail do integrante" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <button @click="sendEmailInvite" :disabled="!inviteEmail || inviteLoading" class="btn-primary w-full py-4">
              {{ inviteLoading ? 'Enviando...' : 'Enviar Convite' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="bottom-sheet">
      <div v-if="orgInviteCode" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="orgInviteCode = null"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe text-center">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-2">Código Gerado</h3>
          <p class="text-sm text-slate-400 mb-6">Compartilhe o código abaixo:</p>
          <div class="bg-primary-500/10 border border-primary-500/20 rounded-2xl p-6 mb-6">
            <span class="text-5xl font-mono font-black text-primary-400 tracking-widest">{{ orgInviteCode }}</span>
          </div>
          <button @click="orgInviteCode = null" class="btn-primary w-full py-4">Concluir</button>
        </div>
      </div>
    </transition>

    <transition name="bottom-sheet">
      <div v-if="invitationLink" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="invitationLink = null"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe text-center">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-2">Convite Enviado</h3>
          <p class="text-sm text-slate-400 mb-6">O link de acesso também está disponível abaixo:</p>
          <div class="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
            <p class="text-white font-mono text-xs break-all leading-relaxed">{{ invitationLink }}</p>
          </div>
          <button @click="invitationLink = null" class="btn-primary w-full py-4">Concluir</button>
        </div>
      </div>
    </transition>

    <transition name="bottom-sheet">
      <div v-if="showNewGroupModal" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showNewGroupModal = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-6">Novo Grupo</h3>
          <div class="space-y-4">
            <input v-model="newGroup.name" placeholder="Nome do Grupo" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <button @click="addGroup" class="btn-primary w-full py-4">Criar Grupo</button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="bottom-sheet">
      <div v-if="showNewMemberModal" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="showNewMemberModal = false"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          <h3 class="text-xl font-bold text-white mb-6">Novo Integrante Manual</h3>
          <div class="space-y-4">
            <input v-model="newMember.name" placeholder="Nome" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            <input v-model="newMember.instrument" placeholder="Instrumento" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-primary-500" />
            
            <div class="space-y-2">
              <label class="text-xs font-bold text-slate-400">Avatar</label>
              <div class="flex flex-wrap gap-3">
                <button v-for="avatar in musicalAvatars" :key="avatar" @click="newMember.avatar = avatar" :class="['h-10 w-10 rounded-full flex items-center justify-center text-xl transition-all', newMember.avatar === avatar ? 'bg-primary-500 shadow-lg shadow-primary-500/40 ring-2 ring-primary-500 ring-offset-2 ring-offset-dark' : 'bg-white/5 hover:bg-white/10']">
                  {{ avatar }}
                </button>
              </div>
            </div>

            <button @click="addMember" class="btn-primary w-full py-4 mt-4">Adicionar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Song Options Bottom Sheet -->
    <transition name="bottom-sheet">
      <div v-if="songOptions" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="songOptions = null"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-4 relative pb-safe">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-4 mt-2"></div>
          <h3 class="text-lg font-bold text-white mb-1 px-2">{{ songOptions.title }}</h3>
          <p class="text-xs text-slate-400 mb-6 px-2">Opções da Música</p>
          <div class="space-y-2 mb-4">
            <button v-if="canEditRepertoire" @click="openLinkManager(songOptions); songOptions = null" class="w-full p-4 flex items-center gap-4 bg-white/5 rounded-2xl active:bg-white/10">
              <i class="pi pi-link text-slate-300"></i>
              <span class="text-white font-medium text-sm">Gerenciar Links (YouTube, Spotify)</span>
            </button>
            <button v-if="canEditRepertoire" @click="openCipherManager(songOptions); songOptions = null" class="w-full p-4 flex items-center gap-4 bg-white/5 rounded-2xl active:bg-white/10">
              <i class="pi pi-file-edit text-primary-400"></i>
              <span class="text-white font-medium text-sm">Editar Cifra</span>
            </button>
            <button v-if="canDeleteRepertoire" @click="deleteSong(songOptions.id); songOptions = null" class="w-full p-4 flex items-center gap-4 bg-rose-500/10 rounded-2xl active:bg-rose-500/20">
              <i class="pi pi-trash text-rose-500"></i>
              <span class="text-rose-500 font-medium text-sm">Excluir Música</span>
            </button>
            <div v-if="!canEditRepertoire && !canDeleteRepertoire" class="py-4 text-center text-slate-500 text-sm">
              Sem permissão de edição.
            </div>
          </div>
        </div>
      </div>
    </transition>
    
    <!-- Link Manager Modal (Full Screen Mobile) -->
    <transition name="bottom-sheet">
      <div v-if="selectedSongLinks" class="fixed inset-0 z-[100] flex flex-col bg-dark pb-safe">
        <div class="px-4 h-14 border-b border-white/5 flex items-center justify-between shrink-0">
          <span class="font-bold text-white text-sm">Links: {{ selectedSongLinks.title }}</span>
          <button @click="selectedSongLinks = null" class="text-primary-400 font-bold text-sm">Fechar</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="(link, index) in selectedSongLinks.links" :key="index" class="flex items-center gap-3 bg-white/5 p-4 rounded-2xl">
            <i :class="['pi', link.url.includes('youtube') ? 'pi-youtube text-red-500' : link.url.includes('spotify') ? 'pi-spotify text-emerald-400' : 'pi-link text-primary-400']"></i>
            <span class="flex-1 truncate text-white text-sm">{{ link.url }}</span>
            <button @click="removeLink(index)" class="text-rose-500 p-2"><i class="pi pi-times"></i></button>
          </div>
          
          <div class="pt-6">
            <input v-model="newLinkUrl" placeholder="Cole a URL do YouTube ou Spotify" class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white mb-3 focus:outline-none focus:border-primary-500" />
            <button @click="addLink" :disabled="!newLinkUrl" class="btn-primary w-full py-4 disabled:opacity-50">Adicionar Link</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Cipher Manager (Full Screen Mobile) -->
    <transition name="bottom-sheet">
      <div v-if="selectedSongForCipher" class="fixed inset-0 z-[100] flex flex-col bg-dark pb-safe">
        <div class="px-4 h-14 border-b border-white/5 flex items-center justify-between shrink-0">
          <button @click="selectedSongForCipher = null" class="text-slate-400 text-sm">Cancelar</button>
          <span class="font-bold text-white text-sm">Cifra: {{ selectedSongForCipher.title }}</span>
          <button @click="saveCipher" class="text-primary-400 font-bold text-sm">Salvar</button>
        </div>
        <div class="flex-1 p-4 flex flex-col">
          <textarea 
            v-model="selectedSongForCipher.cipher" 
            placeholder="Cole a cifra aqui... use espaços para alinhar os acordes." 
            class="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-mono text-sm leading-relaxed focus:outline-none focus:border-primary-500 resize-none"
          ></textarea>
        </div>
      </div>
    </transition>

    <!-- Group Manager (Full Screen) -->
    <transition name="bottom-sheet">
      <div v-if="selectedGroup" class="fixed inset-0 z-[100] flex flex-col bg-dark pb-safe">
        <div class="px-4 h-14 border-b border-white/5 flex items-center justify-between shrink-0">
          <span class="font-bold text-white text-sm">Grupo: {{ selectedGroup.name }}</span>
          <button @click="selectedGroup = null" class="text-primary-400 font-bold text-sm">Concluir</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          
          <div>
            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Integrantes do Grupo</h4>
            <div class="space-y-2">
              <div v-for="assoc in groupAssociations" :key="assoc.id" class="glass p-3 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                <span class="text-white truncate flex-1">{{ getTargetName(assoc) }}</span>
                <span class="text-[10px] bg-white/10 px-2 py-1 rounded text-slate-400 uppercase font-bold">{{ assoc.type }}</span>
              </div>
              <div v-if="groupAssociations.length === 0" class="py-6 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                Nenhum membro no grupo.
              </div>
            </div>
          </div>

          <div class="pt-4 border-t border-white/5">
            <h4 class="text-sm font-bold text-white mb-3">Adicionar ao Grupo</h4>
            <select v-model="newAssociation.targetId" class="w-full bg-dark border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm mb-3 focus:outline-none focus:border-primary-500 appearance-none">
              <option value="">Selecione um integrante...</option>
              <optgroup label="Integrantes">
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </optgroup>
              <optgroup label="Participantes">
                <option v-for="p in memberships" :key="p.id" :value="p.userId">{{ p.userId }}</option>
              </optgroup>
            </select>
            <button @click="addGroupAssociation" :disabled="!newAssociation.targetId" class="btn-primary w-full py-4 disabled:opacity-50">Adicionar</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Event Manager (Full Screen) -->
    <transition name="bottom-sheet">
      <div v-if="selectedEvent" class="fixed inset-0 z-[100] flex flex-col bg-dark pb-safe">
        <div class="px-4 h-14 border-b border-white/5 flex items-center justify-between shrink-0">
          <span class="font-bold text-white text-sm">Detalhes do Evento</span>
          <button @click="selectedEvent = null" class="text-primary-400 font-bold text-sm">Concluir</button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-6">
          <div class="space-y-3">
            <div class="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <i class="pi pi-calendar-plus text-slate-500 mr-3"></i>
              <input v-if="canEditEvent" v-model="selectedEvent.title" @blur="updateEventDetails(selectedEvent)" class="w-full bg-transparent text-white font-bold focus:outline-none" placeholder="Título do Evento" />
              <span v-else class="w-full text-white font-bold">{{ selectedEvent.title }}</span>
            </div>
            <div class="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <i class="pi pi-clock text-slate-500 mr-3"></i>
              <input v-if="canEditEvent" type="datetime-local" v-model="formattedSelectedEventDate" class="w-full bg-transparent text-white focus:outline-none" />
              <span v-else class="w-full text-slate-300">{{ new Date(selectedEvent.date).toLocaleDateString() }} às {{ new Date(selectedEvent.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}</span>
            </div>
          </div>
          
          <div v-if="selectedEvent.groupId">
            <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Presença da Equipe ({{ getGroupName(selectedEvent.groupId) }})</h4>
            <div class="space-y-2">
              <div v-for="assoc in eventGroupAssociations" :key="assoc.id" class="glass p-3 rounded-xl border border-white/5 flex justify-between items-center text-sm">
                <span class="text-white truncate flex-1">{{ getTargetName(assoc) }}</span>
                <div class="flex gap-2">
                  <button @click="toggleAttendance(selectedEvent, assoc.targetId, 'confirmed')" :class="['p-2 rounded-lg transition-colors', (selectedEvent.attendance && selectedEvent.attendance[assoc.targetId] === 'confirmed') ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 hover:bg-white/10']">
                    <i class="pi pi-check"></i>
                  </button>
                  <button @click="toggleAttendance(selectedEvent, assoc.targetId, 'declined')" :class="['p-2 rounded-lg transition-colors', (selectedEvent.attendance && selectedEvent.attendance[assoc.targetId] === 'declined') ? 'bg-rose-500/20 text-rose-400' : 'bg-white/5 text-slate-500 hover:bg-white/10']">
                    <i class="pi pi-times"></i>
                  </button>
                </div>
              </div>
              <div v-if="eventGroupAssociations.length === 0" class="py-6 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                Nenhum membro no grupo.
              </div>
            </div>
          </div>
          <div v-else class="py-6 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
            Nenhuma equipe vinculada a este evento.
          </div>

          <div>
            <div class="flex justify-between items-center mb-3">
              <h4 class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Repertório do Evento</h4>
              <button @click="showAddSongsToEventModal = true" class="text-primary-400 font-bold text-xs"><i class="pi pi-plus"></i> Add</button>
            </div>
            <div class="space-y-2">
              <div v-for="song in selectedEvent.songs || []" :key="song.id || song._id" class="glass p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <img v-if="song.thumbnail" :src="song.thumbnail" alt="Capa" class="h-8 w-8 min-w-[32px] rounded-lg object-cover border border-white/10" />
                <div v-else class="h-8 w-8 min-w-[32px] flex items-center justify-center rounded-lg bg-primary-500/10 text-primary-400 font-bold text-xs">
                  {{ song.key || '?' }}
                </div>
                <div class="flex-1 truncate">
                  <h4 class="font-bold text-white text-sm truncate">{{ song.title }}</h4>
                  <p class="text-[10px] text-slate-400 truncate">{{ song.artist }}</p>
                </div>
                <button @click="removeSongFromEvent(selectedEvent, song)" class="p-2 text-slate-500 hover:text-red-400 transition-colors">
                  <i class="pi pi-trash"></i>
                </button>
              </div>
              <div v-if="!selectedEvent.songs || selectedEvent.songs.length === 0" class="py-6 text-center text-slate-500 text-sm border border-dashed border-white/10 rounded-xl">
                Nenhuma música adicionada.
              </div>
            </div>
          </div>

          <button @click="shareEventWhatsApp(selectedEvent)" class="w-full mt-4 h-12 rounded-xl bg-green-500/20 text-green-400 active:bg-green-500/30 font-bold text-sm flex items-center justify-center gap-2 transition-colors">
            <i class="pi pi-whatsapp text-lg"></i>
            Compartilhar via WhatsApp
          </button>
        </div>
      </div>
    </transition>

    <!-- Access Manager Modal -->
    <transition name="bottom-sheet">
      <div v-if="selectedMembershipForAccess" class="fixed inset-0 z-[100] flex flex-col justify-end">
        <div class="absolute inset-0 bg-dark/80 backdrop-blur-sm" @click="selectedMembershipForAccess = null"></div>
        <div class="bg-dark border-t border-white/10 rounded-t-[2rem] p-6 relative pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[85vh] overflow-y-auto">
          <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
          
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold text-white">Gerenciar Permissões</h3>
          </div>
          <p class="text-sm text-slate-400 mb-6 truncate">Usuário: {{ selectedMembershipForAccess.invitedEmail || selectedMembershipForAccess.userId }}</p>

          <div v-if="selectedMembershipForAccess.role === 'admin'" class="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 mb-6">
            <p class="text-amber-500 text-sm font-medium">Este usuário é um Administrador e possui acesso total.</p>
          </div>
          
          <div class="mb-6 bg-white/5 rounded-2xl p-4 flex items-center justify-between" v-if="canManagePermissions">
            <div>
              <p class="text-white font-bold text-sm">Perfil Administrador</p>
              <p class="text-xs text-slate-400">Conceder acesso total e gerência de membros</p>
            </div>
            <select v-model="selectedMembershipForAccess.role" class="bg-dark border border-white/10 text-white text-sm rounded-lg p-2 focus:ring-primary-500 focus:border-primary-500">
              <option value="member">Membro</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div class="mb-6 space-y-2">
            <label class="text-xs font-bold text-slate-400">Avatar</label>
            <div class="flex flex-wrap gap-3">
              <button v-for="avatar in musicalAvatars" :key="avatar" @click="selectedMembershipForAccess.avatar = avatar" :class="['h-10 w-10 rounded-full flex items-center justify-center text-xl transition-all', selectedMembershipForAccess.avatar === avatar ? 'bg-primary-500 shadow-lg shadow-primary-500/40 ring-2 ring-primary-500 ring-offset-2 ring-offset-dark' : 'bg-white/5 hover:bg-white/10']">
                {{ avatar }}
              </button>
            </div>
          </div>

          <div v-if="canManagePermissions && selectedMembershipForAccess.role !== 'admin'" class="space-y-6">
            <!-- Eventos -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h4 class="font-bold text-white mb-3">Agenda / Eventos</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Incluir Evento</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.events.create" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Editar Evento</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.events.edit" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Excluir Evento</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.events.delete" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
              </div>
            </div>

            <!-- Equipe -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h4 class="font-bold text-white mb-3">Equipe</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Incluir Equipe/Membros</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.team.create" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Editar Equipe/Membros</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.team.edit" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Excluir Equipe/Membros</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.team.delete" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
              </div>
            </div>

            <!-- Repertorio -->
            <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h4 class="font-bold text-white mb-3">Repertório</h4>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Incluir Música</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.repertoire.create" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Editar Música</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.repertoire.edit" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-slate-300">Excluir Música</span>
                  <input type="checkbox" v-model="selectedMembershipForAccess.permissions.repertoire.delete" class="form-checkbox h-5 w-5 text-primary-500 rounded border-white/20 bg-dark">
                </label>
              </div>
            </div>
            
          </div>
          
          <button @click="savePermissions" class="btn-primary w-full py-4 mt-6">Salvar Configurações</button>
        </div>
      </div>
    </transition>

    <transition name="bottom-sheet">
      <div v-if="showImportPlaylistModal" class="fixed inset-x-0 bottom-0 z-50 p-4 pb-8 bg-dark border-t border-white/10 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div class="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6"></div>
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-black text-white flex items-center gap-2">
            <i class="pi pi-youtube text-red-500"></i> Importar do YouTube
          </h3>
          <button @click="showImportPlaylistModal = false" class="text-slate-400 p-2"><i class="pi pi-times"></i></button>
        </div>
        
        <div class="space-y-4">
          <div class="space-y-2">
            <label class="text-xs font-bold text-slate-400">URL da Música ou Playlist (YouTube)</label>
            <input type="text" v-model="importPlaylistUrl" placeholder="Ex: https://youtube.com/watch?v=... ou playlist" class="w-full bg-dark-lighter border border-white/10 rounded-xl p-3 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all" />
          </div>
          
          <button @click="importPlaylist" :disabled="isImportingPlaylist || !importPlaylistUrl" class="w-full bg-red-600 text-white rounded-xl py-3 font-bold active:scale-[0.98] transition-transform disabled:opacity-50 flex justify-center items-center gap-2 mt-4">
            <i v-if="isImportingPlaylist" class="pi pi-spin pi-spinner"></i>
            {{ isImportingPlaylist ? 'Importando...' : 'Importar Músicas' }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Overlay Global para os Modais -->
    <transition name="fade">
      <div v-if="showNewEventModal || showNewSongModal || showNewGroupModal || showAddMemberModal || showInviteLinkModal || showManualMemberModal || selectedEvent || selectedSong || selectedGroup || selectedMembershipForAccess || showImportPlaylistModal" 
           @click="closeAllModals" 
           class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40">
      </div>
    </transition>


  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useRouter } from 'vue-router';
import api, { setOrgId } from '../services/api';
import { user, isSuperUser, logout } from '../services/auth';

const toast = useToast();
const router = useRouter();

const props = defineProps(['orgId']);

const activeTab = ref('agenda'); // default mobile tab
const orgName = ref('');

const members = ref([]);
const memberships = ref([]);

const myMembership = computed(() => {
  return memberships.value.find(m => m.userId === user.value?.id);
});

// Permission Helpers
const canManagePermissions = computed(() => isSuperUser.value || myMembership.value?.role === 'admin');

const hasPerm = (moduleName, action) => {
  if (isSuperUser.value) return true;
  if (!myMembership.value) return false;
  if (myMembership.value.role === 'admin') return true;
  return myMembership.value.permissions?.[moduleName]?.[action] === true;
};

const canCreateEvent = computed(() => hasPerm('events', 'create'));
const canEditEvent = computed(() => hasPerm('events', 'edit'));
const canDeleteEvent = computed(() => hasPerm('events', 'delete'));

const canCreateTeam = computed(() => hasPerm('team', 'create'));
const canEditTeam = computed(() => hasPerm('team', 'edit'));
const canDeleteTeam = computed(() => hasPerm('team', 'delete'));

const canCreateRepertoire = computed(() => hasPerm('repertoire', 'create'));
const canEditRepertoire = computed(() => hasPerm('repertoire', 'edit'));
const canDeleteRepertoire = computed(() => hasPerm('repertoire', 'delete'));

const activeMemberships = computed(() => memberships.value.filter(m => !m.status || m.status === 'active'));
const pendingMemberships = computed(() => memberships.value.filter(m => m.status === 'pending'));
const groups = ref([]);
const groupAssociations = ref([]);
const events = ref([]);
const songs = ref([]);
const activeInvites = ref([]);

const getInviteLink = (tokenOrCode) => `${window.location.origin}/join?token=${tokenOrCode}`;

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({ severity: 'success', summary: 'Copiado', detail: 'Link copiado para a área de transferência', life: 2000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível copiar o link', life: 2000 });
  }
};

// Modals state
const showNewEventModal = ref(false);
const showNewSongModal = ref(false);
const showEquipeActions = ref(false);
const setlists = ref([]);
const activeRepertoireTab = ref('musicas');
const showNewGroupModal = ref(false);
const showNewMemberModal = ref(false);
const showEmailInviteForm = ref(false);
const showAddMemberModal = ref(false);
const showInviteLinkModal = ref(false);
const showManualMemberModal = ref(false);
const showImportPlaylistModal = ref(false);
const showNewSetlistModal = ref(false);
const showAddSongsToEventModal = ref(false);
const showSetlistManagerModal = ref(false);

const songOptions = ref(null);
const selectedSongLinks = ref(null);
const selectedSong = ref(null);
const selectedSongForCipher = ref(null);
const selectedGroup = ref(null);
const selectedMembershipForAccess = ref(null);
const selectedSetlist = ref(null);
const setlistSongsSelection = ref([]);
const eventSongsSelection = ref([]);

const orgInviteCode = ref(null);
const inviteEmail = ref('');
const invitationLink = ref(null);
const inviteLoading = ref(false);
const newLinkUrl = ref('');

const closeAllModals = () => {
    showNewEventModal.value = false;
    showNewSongModal.value = false;
    showNewGroupModal.value = false;
    showAddMemberModal.value = false;
    showInviteLinkModal.value = false;
    showManualMemberModal.value = false;
    showImportPlaylistModal.value = false;
    showNewSetlistModal.value = false;
    showAddSongsToEventModal.value = false;
    showSetlistManagerModal.value = false;
    selectedEvent.value = null;
    selectedSong.value = null;
    selectedGroup.value = null;
    selectedMembershipForAccess.value = null;
    selectedSetlist.value = null;
    songOptions.value = null;
};

const musicalAvatars = ['🎸', '🎤', '🎹', '🥁', '🎷', '🎺', '🎻', '🎧', '🧑‍🎤'];
const newMember = ref({ name: '', instrument: '', avatar: '🎸' });
const newGroup = ref({ name: '' });
const newEvent = ref({ title: '', date: '', groupId: '' });
const newSong = ref({ title: '', artist: '', key: '', bpm: '', link: '' });
const newSetlist = ref({ title: '', songs: [] });
const newManualMember = ref({ name: '', instrument: '', avatar: '👤' });
const importPlaylistUrl = ref('');
const isImportingPlaylist = ref(false);
const newAssociation = ref({ targetId: '', type: 'member' });

const selectedEvent = ref(null);

const formattedSelectedEventDate = computed({
  get() {
    if (!selectedEvent.value || !selectedEvent.value.date) return '';
    let d;
    if (selectedEvent.value.date._seconds) d = new Date(selectedEvent.value.date._seconds * 1000);
    else d = new Date(selectedEvent.value.date);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  },
  set(val) {
    if (selectedEvent.value && canEditEvent.value) {
      selectedEvent.value.date = new Date(val).toISOString();
      updateEventDetails(selectedEvent.value);
    }
  }
});

const updateEventDetails = async (event) => {
  if (!event || !canEditEvent.value) return;
  try {
    await api.put(`/events/${event.id || event._id}`, { title: event.title, date: event.date });
    const index = events.value.findIndex(e => (e.id || e._id) === (event.id || event._id));
    if (index !== -1) {
      events.value[index].title = event.title;
      events.value[index].date = event.date;
    }
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Evento atualizado', life: 2000 });
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar evento', life: 3000 });
  }
};
const eventGroupAssociations = ref([]);

const loadData = async () => {
  setOrgId(props.orgId);
  try {
    const [membersRes, membershipsRes, groupsRes, eventsRes, songsRes, invitesRes, setlistsRes] = await Promise.all([
      api.get('/members'),
      api.get('/memberships'),
      api.get('/groups'),
      api.get('/events'),
      api.get('/songs'),
      api.get('/invites'),
      api.get('/setlists')
    ]);
    members.value = membersRes.data;
    memberships.value = membershipsRes.data;
    groups.value = groupsRes.data;
    // Sort events by date
    events.value = eventsRes.data.sort((a,b) => (a.date?._seconds || 0) - (b.date?._seconds || 0));
    songs.value = songsRes.data;
    activeInvites.value = invitesRes.data;
    setlists.value = setlistsRes.data;

    // Load org name
    try {
      const orgRes = await api.get('/org/info');
      orgName.value = orgRes.data?.name || '';
    } catch (e) {
      // fallback: use orgId
      orgName.value = '';
    }
  } catch (err) {
    console.error('Erro ao carregar dados', err);
  }
};

const handleLogout = async () => {
  try {
    await logout();
    router.push('/login');
  } catch (err) {
    console.error('Logout failed', err);
  }
};

const openAccessManager = (mem) => {
  if (!canManagePermissions.value && mem.userId !== user.value?.uid) return;
  const targetMem = { ...mem };
  if (!targetMem.permissions) {
    targetMem.permissions = {
      events: { view: true, create: false, edit: false, delete: false },
      team: { view: true, create: false, edit: false, delete: false },
      repertoire: { view: true, create: false, edit: false, delete: false },
    };
  }
  selectedMembershipForAccess.value = targetMem;
};

const savePermissions = async () => {
  if (!selectedMembershipForAccess.value) return;
  try {
    await api.put(`/memberships/${selectedMembershipForAccess.value.id}/permissions`, {
      permissions: selectedMembershipForAccess.value.permissions,
      role: selectedMembershipForAccess.value.role,
      avatar: selectedMembershipForAccess.value.avatar
    }, {
      headers: { 'X-Org-Id': props.orgId }
    });
    selectedMembershipForAccess.value = null;
    await loadData();
  } catch (err) {
    console.error('Erro ao salvar permissões', err);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar permissões: ' + (err.response?.data?.error || err.message), life: 5000 });
  }
};

// Actions Equipe
const openEmailInviteForm = () => {
  showEquipeActions.value = false;
  showEmailInviteForm.value = true;
};

const openOrgInviteGenerator = async () => {
  showEquipeActions.value = false;
  try {
    const response = await api.post('/admin/invite', { orgId: props.orgId });
    orgInviteCode.value = response.data.inviteCode;
  } catch (err) {
    console.error('Erro ao gerar convite', err);
  }
};

const sendEmailInvite = async () => {
  if (!inviteEmail.value) return;
  inviteLoading.value = true;
  try {
    const response = await api.post('/admin/invite-email', { 
      email: inviteEmail.value, 
      orgId: props.orgId 
    });
    invitationLink.value = response.data.acceptLink;
    showManualMemberModal.value = false;
    showImportPlaylistModal.value = false;
    selectedEvent.value = null;
    await loadData();
  } catch (err) {
    console.error('Erro ao enviar convite', err);
    toast.add({ severity: 'error', summary: 'Erro', detail: err.response?.data?.error || 'Erro ao enviar convite', life: 5000 });
  } finally {
    inviteLoading.value = false;
  }
};

const saveManualMember = async () => {
  if(!newManualMember.value.name) return;
  try {
    await api.post('/members', { ...newManualMember.value }, { headers: { 'X-Org-Id': props.orgId } });
    showManualMemberModal.value = false;
    newManualMember.value = { name: '', instrument: '', avatar: '👤' };
    await loadData();
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Membro manual adicionado', life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: err.response?.data?.error || err.message, life: 5000 });
  }
};

const createSetlist = async () => {
  if (!newSetlist.value.title) return;
  try {
    const res = await api.post('/setlists', {
      title: newSetlist.value.title,
      songs: newSetlist.value.songs
    });
    setlists.value.push({ id: res.data.id, ...newSetlist.value });
    newSetlist.value = { title: '', songs: [] };
    showNewSetlistModal.value = false;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Agrupador criado', life: 3000 });
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao criar agrupador', life: 3000 });
  }
};

const openSetlistManager = (setlist) => {
  selectedSetlist.value = setlist;
  setlistSongsSelection.value = setlist.songs ? setlist.songs.map(s => s.id || s._id) : [];
  showSetlistManagerModal.value = true;
};

const saveSetlistSongs = async () => {
  if (!selectedSetlist.value) return;
  try {
    await api.put(`/setlists/${selectedSetlist.value.id}`, { songs: setlistSongsSelection.value });
    const fullSongs = setlistSongsSelection.value.map(sid => songs.value.find(s => (s.id || s._id) === sid)).filter(Boolean);
    selectedSetlist.value.songs = fullSongs;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Músicas atualizadas no agrupador', life: 3000 });
    showSetlistManagerModal.value = false;
    selectedSetlist.value = null;
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar agrupador', life: 3000 });
  }
};

const deleteSetlist = async (id) => {
  try {
    await api.delete(`/setlists/${id}`);
    setlists.value = setlists.value.filter(s => s.id !== id);
    if (selectedSetlist.value && selectedSetlist.value.id === id) {
      showSetlistManagerModal.value = false;
      selectedSetlist.value = null;
    }
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Agrupador excluído', life: 3000 });
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao excluir agrupador', life: 3000 });
  }
};

const removeSongFromEvent = async (event, song) => {
  try {
    const newSongs = (event.songs || []).filter(s => (s.id || s._id) !== (song.id || song._id));
    await api.put(`/events/${event.id}`, { songs: newSongs.map(s => s.id || s._id) });
    event.songs = newSongs;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Música removida', life: 3000 });
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao remover música', life: 3000 });
  }
};

const openAddSongsToEvent = () => {
  eventSongsSelection.value = selectedEvent.value?.songs?.map(s => s.id || s._id) || [];
  showAddSongsToEventModal.value = true;
};

const saveEventSongs = async () => {
  if (!selectedEvent.value) return;
  try {
    await api.put(`/events/${selectedEvent.value.id}`, { songs: eventSongsSelection.value });
    const fullSongs = eventSongsSelection.value.map(sid => songs.value.find(s => (s.id || s._id) === sid)).filter(Boolean);
    selectedEvent.value.songs = fullSongs;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Repertório do evento atualizado', life: 3000 });
    showAddSongsToEventModal.value = false;
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao atualizar repertório', life: 3000 });
  }
};

const importSetlistToEvent = async (setlist) => {
  if (!selectedEvent.value || !setlist) return;
  try {
    const setlistSongIds = setlist.songs?.map(s => s.id || s._id) || [];
    const currentSongIds = selectedEvent.value.songs?.map(s => s.id || s._id) || [];
    const combinedIds = [...new Set([...currentSongIds, ...setlistSongIds])];
    
    await api.put(`/events/${selectedEvent.value.id}`, { songs: combinedIds });
    const fullSongs = combinedIds.map(sid => songs.value.find(s => (s.id || s._id) === sid)).filter(Boolean);
    selectedEvent.value.songs = fullSongs;
    eventSongsSelection.value = combinedIds;
    toast.add({ severity: 'success', summary: 'Sucesso', detail: 'Agrupador importado', life: 3000 });
  } catch (error) {
    console.error(error);
    toast.add({ severity: 'error', summary: 'Erro', detail: 'Falha ao importar agrupador', life: 3000 });
  }
};

const shareEventWhatsApp = (event) => {
  if (!event) return;
  
  let text = `🎤 *Evento:* ${event.title}\n`;
  if (event.date) {
    // Determine if date is a Firestore timestamp or ISO string
    let d;
    if (event.date._seconds) {
      d = new Date(event.date._seconds * 1000);
    } else {
      d = new Date(event.date);
    }
    
    if (!isNaN(d.getTime())) {
      text += `📅 *Data:* ${d.toLocaleDateString()} às ${d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}\n`;
    }
  }
  
  if (event.groupId) {
    text += `👥 *Equipe:* ${getGroupName(event.groupId)}\n`;
    
    if (event.attendance) {
      const confirmedIds = Object.keys(event.attendance).filter(k => event.attendance[k] === 'confirmed');
      if (confirmedIds.length > 0) {
        text += `\n✅ *Confirmados:*\n`;
        confirmedIds.forEach(id => {
          const assoc = eventGroupAssociations.value.find(a => a.targetId === id);
          if (assoc) {
            text += `- ${getTargetName(assoc)}\n`;
          }
        });
      }
    }
  }
  
  if (event.songs && event.songs.length > 0) {
    text += `\n🎵 *Repertório:*\n`;
    event.songs.forEach((s, index) => {
      text += `${index + 1}. ${s.title} (${s.artist}) - Tom: ${s.key || '?'}\n`;
      if (s.links && s.links.length > 0) {
        const ytLink = s.links.find(l => l.title === 'YouTube');
        if (ytLink) {
          text += `   ${ytLink.url}\n`;
        }
      }
    });
  }
  
  text += `\n📲 Confirme sua presença no app!`;
  
  const encoded = encodeURIComponent(text);
  window.open(`https://wa.me/?text=${encoded}`, '_blank');
};
const importPlaylist = async () => {
  if (!importPlaylistUrl.value) return;
  isImportingPlaylist.value = true;
  try {
    const res = await api.post('/songs/import/youtube', { url: importPlaylistUrl.value }, { headers: { 'X-Org-Id': props.orgId } });
    showImportPlaylistModal.value = false;
    importPlaylistUrl.value = '';
    await loadData();
    toast.add({ severity: 'success', summary: 'Sucesso', detail: `${res.data.count} músicas importadas com sucesso!`, life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Erro', detail: err.response?.data?.error || err.message, life: 5000 });
  } finally {
    isImportingPlaylist.value = false;
  }
};

const addMember = async () => {
  if (!newMember.value.name) return;
  await api.post('/members', newMember.value);
  newMember.value = { name: '', instrument: '' };
  showNewMemberModal.value = false;
  await loadData();
};

const addGroup = async () => {
  if (!newGroup.value.name) return;
  await api.post('/groups', newGroup.value);
  newGroup.value = { name: '' };
  showNewGroupModal.value = false;
  await loadData();
};

const addEvent = async () => {
  if (!newEvent.value.title || !newEvent.value.date) return;
  await api.post('/events', newEvent.value);
  newEvent.value = { title: '', date: '', groupId: '' };
  showNewEventModal.value = false;
  await loadData();
};

const openEventManager = async (event) => {
  selectedEvent.value = event;
  if (event.groupId) {
    try {
      const response = await api.get(`/groups/${event.groupId}/associations`);
      eventGroupAssociations.value = response.data;
    } catch (err) {
      console.error('Erro ao carregar associações do evento', err);
    }
  } else {
    eventGroupAssociations.value = [];
  }
};

const toggleAttendance = async (event, targetId, status) => {
  if (!event.attendance) event.attendance = {};
  
  // Toggle off if clicking the same status
  if (event.attendance[targetId] === status) {
    delete event.attendance[targetId];
  } else {
    event.attendance[targetId] = status;
  }
  
  try {
    await api.put(`/events/${event.id}`, { attendance: event.attendance });
    // Update local state without reloading everything
    const idx = events.value.findIndex(e => e.id === event.id);
    if (idx !== -1) events.value[idx].attendance = { ...event.attendance };
  } catch (err) {
    console.error('Erro ao atualizar presença', err);
  }
};

const getGroupName = (groupId) => {
  const g = groups.value.find(g => g.id === groupId);
  return g ? g.name : 'Desconhecido';
};

const openGroupManager = async (group) => {
  selectedGroup.value = group;
  try {
    const response = await api.get(`/groups/${group.id}/associations`);
    groupAssociations.value = response.data;
  } catch (err) {
    console.error('Erro ao carregar associações', err);
  }
};

const addGroupAssociation = async () => {
  if (!newAssociation.value.targetId) return;
  const isMember = members.value.some(m => m.id === newAssociation.value.targetId);
  newAssociation.value.type = isMember ? 'member' : 'participant';
  await api.post(`/groups/${selectedGroup.value.id}/associations`, newAssociation.value);
  newAssociation.value = { targetId: '', type: 'member' };
  openGroupManager(selectedGroup.value);
};

const getTargetName = (assoc) => {
  if (assoc.type === 'member') {
    const m = members.value.find(m => m.id === assoc.targetId);
    return m ? (m.avatar ? `${m.avatar} ${m.name}` : m.name) : 'Desconhecido';
  } else {
    const p = memberships.value.find(p => p.userId === assoc.targetId);
    return p ? `👤 ${p.invitedEmail || p.userId}` : `👤 ${assoc.targetId}`;
  }
};

const addSong = async () => {
  if (!newSong.value.title) return;
  await api.post('/songs', newSong.value);
  newSong.value = { title: '', artist: '', key: '' };
  showNewSongModal.value = false;
  await loadData();
};

const deleteSong = async (id) => {
  if (!confirm('Tem certeza que deseja excluir esta música?')) return;
  await api.delete(`/songs/${id}`);
  await loadData();
};

const openSongOptions = (song) => {
  songOptions.value = song;
};

const openLinkManager = (song) => {
  selectedSongLinks.value = { ...song };
  if (!selectedSongLinks.value.links) selectedSongLinks.value.links = [];
};

const addLink = async () => {
  if (!newLinkUrl.value) return;
  selectedSongLinks.value.links.push({ url: newLinkUrl.value });
  await api.put(`/songs/${selectedSongLinks.value.id}`, { links: selectedSongLinks.value.links });
  newLinkUrl.value = '';
  await loadData();
  const updated = songs.value.find(s => s.id === selectedSongLinks.value.id);
  selectedSongLinks.value = { ...updated };
};

const removeLink = async (index) => {
  selectedSongLinks.value.links.splice(index, 1);
  await api.put(`/songs/${selectedSongLinks.value.id}`, { links: selectedSongLinks.value.links });
  await loadData();
};

const openCipherManager = (song) => {
  selectedSongForCipher.value = { ...song };
};

const saveCipher = async () => {
  await api.put(`/songs/${selectedSongForCipher.value.id}`, { cipher: selectedSongForCipher.value.cipher });
  await loadData();
  selectedSongForCipher.value = null;
};

// Helpers for dates
const getMonthStr = (dateObj) => {
  if (!dateObj) return 'Mês';
  const d = new Date(dateObj); // In case it's a direct ISO string from Mongoose
  // Note: if date is a Firestore timestamp object, use dateObj._seconds * 1000. 
  // Let's support both:
  const timestamp = dateObj._seconds ? dateObj._seconds * 1000 : dateObj;
  const dt = new Date(timestamp);
  return dt.toLocaleString('pt-BR', { month: 'short' });
};

const getDayStr = (dateObj) => {
  if (!dateObj) return '00';
  const timestamp = dateObj._seconds ? dateObj._seconds * 1000 : dateObj;
  const dt = new Date(timestamp);
  return dt.getDate().toString().padStart(2, '0');
};

const getTimeStr = (dateObj) => {
  if (!dateObj) return '00:00';
  const timestamp = dateObj._seconds ? dateObj._seconds * 1000 : dateObj;
  const dt = new Date(timestamp);
  return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

onMounted(loadData);
</script>
