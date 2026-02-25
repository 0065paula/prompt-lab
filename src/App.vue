<template>
  <div class="min-h-screen bg-white text-[#37352f]">
    <!-- Header -->
    <header class="border-b border-[#e3e2e0] bg-white sticky top-0 z-50">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <!-- Logo -->
          <div class="flex items-center gap-2 sm:gap-3">
            <div class="w-8 h-8 sm:w-9 sm:h-9 bg-[#2383e2] rounded flex items-center justify-center text-lg sm:text-xl">
              🧪
            </div>
            <div>
              <h1 class="text-lg sm:text-xl font-semibold text-[#37352f]">Prompt Lab</h1>
              <p class="text-xs sm:text-sm text-[#6b6b6b] hidden sm:block">给 Agent 一个实验室</p>
            </div>
          </div>
          
          <!-- Desktop Navigation -->
          <nav class="hidden md:flex gap-1">
            <button 
              type="button"
              v-for="tab in tabs" 
              :key="tab.id"
              @click="router.push(tab.path)"
              :class="['px-3 py-1.5 rounded text-sm transition-colors', currentTab === tab.id ? 'bg-[#f1f1ef] text-[#37352f] font-medium' : 'text-[#6b6b6b] hover:bg-[#f7f6f3]']"
            >
              {{ tab.name }}
            </button>
          </nav>

          <!-- Mobile Menu Button -->
          <button 
            type="button"
            @click="showMobileMenu = !showMobileMenu"
            class="md:hidden p-2 rounded hover:bg-[#f1f1ef]"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="!showMobileMenu" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Mobile Navigation -->
        <nav v-if="showMobileMenu" class="md:hidden mt-3 pt-3 border-t border-[#e3e2e0] space-y-1">
          <button 
            type="button"
            v-for="tab in tabs" 
            :key="tab.id"
            @click="router.push(tab.path); showMobileMenu = false"
            :class="['w-full text-left px-3 py-2.5 rounded text-sm transition-colors', currentTab === tab.id ? 'bg-[#f1f1ef] text-[#37352f] font-medium' : 'text-[#6b6b6b]']"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 safe-bottom">
      <!-- Toast Container -->
      <div class="fixed top-16 sm:top-20 right-4 z-[100] space-y-2">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          :class="[
            'px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-slideIn max-w-xs',
            toast.type === 'success' ? 'bg-[#0f7b6f] text-white' : '',
            toast.type === 'error' ? 'bg-[#e03e3e] text-white' : '',
            toast.type === 'warning' ? 'bg-[#dfab01] text-white' : '',
            toast.type === 'info' ? 'bg-[#37352f] text-white' : ''
          ]"
        >
          {{ toast.message }}
        </div>
      </div>

      <!-- Tab Content -->
      <div class="animate-fadeIn">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from './composables/useToast'

const route = useRoute()
const router = useRouter()
const { toasts } = useToast()

const tabs = [
  { id: 'diagnosis', name: '🩺 诊断', path: '/diagnosis' },
  { id: 'optimizer', name: '✨ 优化', path: '/optimizer' },
  { id: 'ab-test', name: '🧪 测试', path: '/ab-test' },
  { id: 'history', name: '📚 历史', path: '/history' },
  { id: 'templates', name: '🎨 模板', path: '/templates' },
]

const currentTab = computed(() => route.name)
const showMobileMenu = ref(false)

</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(100%); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}
</style>
