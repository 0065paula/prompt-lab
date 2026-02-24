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
              v-for="tab in tabs" 
              :key="tab.id"
              @click="currentTab = tab.id"
              :class="['px-3 py-1.5 rounded text-sm transition-colors', currentTab === tab.id ? 'bg-[#f1f1ef] text-[#37352f] font-medium' : 'text-[#6b6b6b] hover:bg-[#f7f6f3]']"
            >
              {{ tab.name }}
            </button>
          </nav>

          <!-- Mobile Menu Button -->
          <button 
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
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id; showMobileMenu = false"
            :class="['w-full text-left px-3 py-2.5 rounded text-sm transition-colors', currentTab === tab.id ? 'bg-[#f1f1ef] text-[#37352f] font-medium' : 'text-[#6b6b6b]']"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 safe-bottom">
      <!-- Phase Progress - Mobile Optimized -->
      <div class="mb-6 sm:mb-8">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-base sm:text-lg font-medium">{{ currentPhaseName }}</h2>
          <span class="text-xs sm:text-sm text-[#6b6b6b]">{{ completedPhases }}/4 完成</span>
        </div>
        
        <!-- Mobile: Vertical Stack / Desktop: Horizontal -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
          <div 
            v-for="(phase, index) in phases" 
            :key="phase.id"
            :class="['p-3 sm:p-4 rounded border transition-all cursor-pointer', getPhaseClass(index)]"
            @click="goToPhase(index)"
          >
            <div class="flex items-center gap-2 mb-1">
              <span class="text-lg sm:text-xl">{{ phase.icon }}</span>
              <span class="font-medium text-sm">{{ phase.name }}</span>
            </div>
            <p class="text-xs text-[#6b6b6b] leading-relaxed">{{ phase.description }}</p>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="animate-fadeIn">
        <PromptLaboratory 
          v-if="currentTab === 'laboratory'"
          :current-phase="currentPhase"
          @phase-complete="onPhaseComplete"
          @reset="resetLaboratory"
        />
        <VisualComparison v-else-if="currentTab === 'comparison'" />
        <PromptTemplates v-else-if="currentTab === 'templates'" />
        <IterationHistory v-else-if="currentTab === 'history'" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import PromptLaboratory from './components/PromptLaboratory.vue'
import VisualComparison from './components/VisualComparison.vue'
import PromptTemplates from './components/PromptTemplates.vue'
import IterationHistory from './components/IterationHistory.vue'

const tabs = [
  { id: 'laboratory', name: '实验室' },
  { id: 'comparison', name: '视觉对比' },
  { id: 'templates', name: '提示词模板' },
  { id: 'history', name: '迭代历史' },
]

const currentTab = ref('laboratory')
const showMobileMenu = ref(false)

const phases = [
  { 
    id: 'instrumentation', 
    name: '仪表化', 
    icon: '📊',
    description: '建立测量基线'
  },
  { 
    id: 'diagnosis', 
    name: '诊断', 
    icon: '🔍',
    description: '分析瓶颈问题'
  },
  { 
    id: 'iteration', 
    name: '迭代', 
    icon: '🔄',
    description: '逐个修复验证'
  },
  { 
    id: 'report', 
    name: '报告', 
    icon: '📈',
    description: '生成对比报告'
  },
]

const currentPhase = ref(0)
const completedPhases = ref(0)

const currentPhaseName = computed(() => {
  if (completedPhases.value === 4) return '✅ 所有阶段已完成'
  return `当前阶段: ${phases[currentPhase.value]?.name}`
})

function getPhaseClass(index) {
  if (index < completedPhases.value) {
    return 'bg-[#0f7b6f]/10 border-[#0f7b6f] text-[#0f7b6f]'
  }
  if (index === currentPhase.value) {
    return 'bg-[#2383e2]/10 border-[#2383e2] text-[#2383e2]'
  }
  return 'bg-white border-[#e3e2e0] text-[#6b6b6b] hover:bg-[#f7f6f3]'
}

function goToPhase(index) {
  if (index <= completedPhases.value || index === currentPhase.value) {
    currentPhase.value = index
  }
}

function onPhaseComplete() {
  if (currentPhase.value < phases.length - 1) {
    completedPhases.value = currentPhase.value + 1
    currentPhase.value++
  } else {
    completedPhases.value = phases.length
  }
}

function resetLaboratory() {
  currentPhase.value = 0
  completedPhases.value = 0
}
</script>

<style scoped>
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
