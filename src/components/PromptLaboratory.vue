<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Phase Progress -->
    <div class="mb-6 sm:mb-8">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-base sm:text-lg font-medium">{{ currentPhaseName }}</h2>
        <span class="text-xs sm:text-sm text-[#6b6b6b]">{{ completedPhases }}/4 完成</span>
      </div>
      
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
    
    <!-- Mobile: Single Column / Desktop: Two Columns -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      <!-- Left: Input & Control -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Original Prompt -->
        <div class="lab-card p-4 sm:p-6">
          <h3 class="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center gap-2 text-[#37352f]">
            <span>📝</span>
            原始提示词
          </h3>
          <textarea 
            v-model="originalPrompt"
            class="w-full h-32 sm:h-40 bg-[#f7f6f3] border border-[#e3e2e0] rounded p-3 sm:p-4 text-sm resize-none focus:border-[#2383e2] focus:outline-none transition-colors"
            placeholder="输入你的原始提示词..."
          />
        </div>

        <!-- Optimization Target -->
        <div class="lab-card p-4 sm:p-6">
          <h3 class="text-base sm:text-lg font-medium mb-3 sm:mb-4 flex items-center gap-2 text-[#37352f]">
            <span>🎯</span>
            优化目标
          </h3>
          <div class="space-y-2">
            <label 
              v-for="target in targets" 
              :key="target.id" 
              class="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded cursor-pointer hover:bg-[#f1f1ef] transition-colors active:bg-[#e3e2e0]"
            >
              <input 
                type="checkbox" 
                v-model="selectedTargets" 
                :value="target.id"
                class="w-4 h-4 sm:w-5 sm:h-5 rounded border-[#e3e2e0] text-[#2383e2] focus:ring-[#2383e2]"
              />
              <span class="text-xl">{{ target.icon }}</span>
              <div class="min-w-0">
                <p class="font-medium text-sm text-[#37352f]">{{ target.name }}</p>
                <p class="text-xs text-[#6b6b6b] truncate">{{ target.description }}</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-2 sm:gap-3">
          <button 
            @click="startOptimization"
            :disabled="!canStart"
            :class="['flex-1 py-2.5 sm:py-3 px-3 sm:px-4 rounded font-medium transition-colors text-sm sm:text-base', canStart ? 'bg-[#2383e2] hover:bg-[#1a6fc2] text-white active:bg-[#155a9e]' : 'bg-[#e3e2e0] text-[#6b6b6b] cursor-not-allowed']"
          >
            {{ isOptimizing ? '优化中...' : '开始优化' }}
          </button>
          
          <button 
            @click="resetLaboratory"
            class="px-3 sm:px-4 py-2.5 sm:py-3 rounded border border-[#e3e2e0] text-[#6b6b6b] hover:bg-[#f7f6f3] active:bg-[#e3e2e0] text-sm sm:text-base"
          >
            重置
          </button>
        </div>
      </div>

      <!-- Right: Results & Analysis -->
      <div class="space-y-4 sm:space-y-6">
        <!-- Phase 1: Instrumentation -->
        <div v-if="currentPhase >= 0" class="lab-card p-4 sm:p-6">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <h3 class="text-base sm:text-lg font-medium flex items-center gap-2 text-[#37352f]">
              <span :class="['w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs text-white', phase1Completed ? 'bg-[#0f7b6f]' : 'bg-[#2383e2]']">
                {{ phase1Completed ? '✓' : '1' }}
              </span>
              基线分析
            </h3>
            <button 
              v-if="!phase1Completed" 
              @click="runInstrumentation" 
              class="text-xs sm:text-sm text-[#2383e2] hover:text-[#1a6fc2] font-medium"
            >
              运行分析
            </button>
          </div>
          
          <div v-if="instrumentationResults" class="space-y-3">
            <div class="grid grid-cols-3 gap-2 sm:gap-3">
              <div class="bg-[#f7f6f3] p-2 sm:p-3 rounded text-center">
                <p class="text-xl sm:text-2xl font-semibold text-[#2383e2]">{{ instrumentationResults.wordCount }}</p>
                <p class="text-xs text-[#6b6b6b]">词数</p>
              </div>
              <div class="bg-[#f7f6f3] p-2 sm:p-3 rounded text-center">
                <p class="text-xl sm:text-2xl font-semibold text-[#dfab01]">{{ instrumentationResults.clarityScore }}</p>
                <p class="text-xs text-[#6b6b6b]">清晰度</p>
              </div>
              <div class="bg-[#f7f6f3] p-2 sm:p-3 rounded text-center">
                <p class="text-xl sm:text-2xl font-semibold text-[#0f7b6f]">{{ instrumentationResults.structureScore }}</p>
                <p class="text-xs text-[#6b6b6b]">结构化</p>
              </div>
            </div>
            
            <div class="bg-[#f7f6f3] p-3 rounded">
              <p class="text-sm font-medium mb-2 text-[#37352f]">检测到的问题:</p>
              <ul class="text-sm text-[#6b6b6b] space-y-1">
                <li v-for="issue in instrumentationResults.issues" :key="issue" class="flex items-start gap-1.5">
                  <span class="text-[#e03e3e]">•</span>
                  <span>{{ issue }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Phase 2-4: Optimization Preview -->
        <div v-if="optimizedPrompt" class="lab-card p-4 sm:p-6">
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <h3 class="text-base sm:text-lg font-medium flex items-center gap-2 text-[#37352f]">
              <span class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0f7b6f] flex items-center justify-center text-xs text-white">✓</span>
              优化后提示词
            </h3>
            <button 
              @click="copyOptimized" 
              class="text-xs sm:text-sm text-[#2383e2] hover:text-[#1a6fc2] font-medium"
            >
              复制
            </button>
          </div>
          
          <div class="bg-[#f7f6f3] p-3 sm:p-4 rounded text-sm font-mono whitespace-pre-wrap text-[#37352f] border border-[#e3e2e0] max-h-48 sm:max-h-64 overflow-y-auto">
            {{ optimizedPrompt }}
          </div>
          
          <!-- Diff View -->
          <div v-if="changes.length > 0" class="mt-4">
            <p class="text-sm font-medium mb-2 text-[#37352f]">变更对比:</p>
            <div class="space-y-1.5">
              <div 
                v-for="(change, index) in changes" 
                :key="index" 
                class="p-2 sm:p-2.5 rounded text-sm flex items-start gap-2"
                :class="change.type === 'added' ? 'bg-[#0f7b6f]/10 text-[#0f7b6f]' : 'bg-[#e03e3e]/10 text-[#e03e3e]'"
              >
                <span class="font-mono font-medium">{{ change.type === 'added' ? '+' : '-' }}</span>
                <span>{{ change.text }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToast } from '../composables/useToast'
import { useLocalStorage } from '../composables/useLocalStorage'

const toast = useToast()

const originalPrompt = useLocalStorage('prompt-lab-original', '')
const optimizedPrompt = useLocalStorage('prompt-lab-optimized', '')
const isOptimizing = ref(false)
const phase1Completed = ref(false)
const instrumentationResults = ref(null)

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

const targets = [
  { id: 'clarity', name: '提升清晰度', icon: '✨', description: '让指令更明确，减少歧义' },
  { id: 'structure', name: '结构化改进', icon: '🏗️', description: '分阶段、分步骤描述任务' },
  { id: 'examples', name: '添加示例', icon: '💡', description: '用例子说明期望的输出' },
  { id: 'constraints', name: '明确约束', icon: '📏', description: '添加边界条件和限制' },
  { id: 'feedback', name: '反馈循环', icon: '🔄', description: '建立自我验证机制' },
]

const selectedTargets = useLocalStorage('prompt-lab-targets', [])
const changes = ref([])

const canStart = computed(() => 
  originalPrompt.value.length > 10 && 
  selectedTargets.value.length > 0
)

function runInstrumentation() {
  const words = originalPrompt.value.split(/\s+/)
  const sentences = originalPrompt.value.split(/[.!?。！？]+/)
  
  const issues = []
  if (words.length < 20) issues.push('提示词过短，可能缺乏上下文')
  if (!originalPrompt.value.includes('步骤') && !originalPrompt.value.includes('phase')) {
    issues.push('缺少分阶段/步骤的指示')
  }
  if (!originalPrompt.value.includes('检查') && !originalPrompt.value.includes('验证')) {
    issues.push('缺少自我验证机制')
  }
  if (sentences.length < 3) issues.push('句子结构过于简单')
  
  instrumentationResults.value = {
    wordCount: words.length,
    clarityScore: Math.max(3, Math.round(10 - issues.length * 1.5)),
    structureScore: sentences.length > 3 ? 7 : 4,
    issues: issues.length > 0 ? issues : ['提示词结构良好']
  }
  
  phase1Completed.value = true
  onPhaseComplete()
}

async function startOptimization() {
  isOptimizing.value = true
  
  if (!phase1Completed.value) {
    runInstrumentation()
    await sleep(500)
  }
  
  let optimized = originalPrompt.value
  const newChanges = []
  
  if (selectedTargets.value.includes('structure')) {
    optimized = `你的任务是：${optimized}\n\n请按以下阶段执行：\nPhase 1 - 分析：理解需求并列出关键要点\nPhase 2 - 规划：制定实现方案\nPhase 3 - 执行：编写代码/生成内容\nPhase 4 - 验证：检查结果是否符合预期`
    newChanges.push({ type: 'added', text: '添加四阶段执行框架' })
  }
  
  if (selectedTargets.value.includes('feedback')) {
    optimized += `\n\n在每一步完成后，请：\n1. 自我检查是否符合要求\n2. 如发现问题，立即修正\n3. 报告当前进度和遇到的问题`
    newChanges.push({ type: 'added', text: '添加反馈循环机制' })
  }
  
  if (selectedTargets.value.includes('constraints')) {
    optimized += `\n\n约束条件：\n- 保持代码简洁可读\n- 优先考虑性能\n- 确保兼容性`
    newChanges.push({ type: 'added', text: '添加约束条件' })
  }
  
  optimizedPrompt.value = optimized
  changes.value = newChanges
  
  isOptimizing.value = false
  onPhaseComplete()
}

function copyOptimized() {
  navigator.clipboard.writeText(optimizedPrompt.value)
  toast.success('已复制到剪贴板')
}

function resetLaboratory() {
  currentPhase.value = 0
  completedPhases.value = 0
  originalPrompt.value = ''
  optimizedPrompt.value = ''
  phase1Completed.value = false
  instrumentationResults.value = null
  changes.value = []
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>
