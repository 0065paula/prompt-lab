<template>
  <div class="min-h-screen bg-slate-900 text-white">
    <!-- Header -->
    <header class="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl">
            🧪
          </div>
          <div>
            <h1 class="text-xl font-bold">Prompt Lab</h1>
            <p class="text-sm text-slate-400">给 Agent 一个实验室</p>
          </div>
        </div>
        
        <nav class="flex gap-2">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="currentTab = tab.id"
            :class="['px-4 py-2 rounded-lg transition-all', currentTab === tab.id ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white']"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-6">
      <!-- Phase Progress -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">当前阶段: {{ currentPhaseName }}</h2>          <span class="text-sm text-slate-400">{{ completedPhases }}/4 完成</span>
        </div>
        <div class="flex gap-2">
          <div 
            v-for="(phase, index) in phases" 
            :key="phase.id"
            :class="['flex-1 p-4 rounded-lg border transition-all', getPhaseClass(index)]"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">{{ phase.icon }}</span>
              <span class="font-semibold">{{ phase.name }}</span>
            </div>
            <p class="text-sm opacity-80">{{ phase.description }}</p>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div v-if="currentTab === 'laboratory'">
        <PromptLaboratory 
          :current-phase="currentPhase"
          @phase-complete="onPhaseComplete"
          @reset="resetLaboratory"
        />
      </div>

      <div v-else-if="currentTab === 'comparison'">
        <VisualComparison />
      </div>

      <div v-else-if="currentTab === 'templates'">
        <PromptTemplates />
      </div>

      <div v-else-if="currentTab === 'history'">
        <IterationHistory />
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

const phases = [
  { 
    id: 'instrumentation', 
    name: '仪表化', 
    icon: '📊',
    description: '建立测量基线，记录当前状态'
  },
  { 
    id: 'diagnosis', 
    name: '诊断', 
    icon: '🔍',
    description: '分析瓶颈，提出假设'
  },
  { 
    id: 'iteration', 
    name: '迭代', 
    icon: '🔄',
    description: '逐个修复，验证效果'
  },
  { 
    id: 'report', 
    name: '报告', 
    icon: '📈',
    description: '生成对比报告，总结经验'
  },
]

const currentPhase = ref(0)
const completedPhases = ref(0)

const currentPhaseName = computed(() => phases[currentPhase.value]?.name || '完成')

function getPhaseClass(index) {
  if (index < completedPhases.value) {
    return 'bg-green-500/20 border-green-500'
  }
  if (index === currentPhase.value) {
    return 'bg-blue-500/20 border-blue-500'
  }
  return 'bg-slate-800 border-slate-700'
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
