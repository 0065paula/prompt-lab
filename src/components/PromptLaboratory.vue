<template>
  <div class="grid grid-cols-2 gap-6">
    <!-- Left: Input & Control -->
    <div class="space-y-6">
      <!-- Original Prompt -->
      <div class="lab-card p-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>📝</span>
          原始提示词
        </h3>
        <textarea 
          v-model="originalPrompt"
          class="w-full h-40 bg-slate-950 border border-slate-700 rounded-lg p-4 text-sm resize-none focus:border-blue-500 focus:outline-none"
          placeholder="输入你的原始提示词..."
        />
      </div>

      <!-- Optimization Target -->
      <div class="lab-card p-6">
        <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🎯</span>
          优化目标
        </h3>
        <div class="space-y-3">
          <label v-for="target in targets" :key="target.id" class="flex items-center gap-3 p-3 rounded-lg bg-slate-950 cursor-pointer hover:bg-slate-900">
            <input 
              type="checkbox" 
              v-model="selectedTargets" 
              :value="target.id"
              class="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500"
            />
            <span class="text-2xl">{{ target.icon }}</span>
            <div>
              <p class="font-medium">{{ target.name }}</p>
              <p class="text-sm text-slate-400">{{ target.description }}</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <button 
          @click="startOptimization"
          :disabled="!canStart"
          :class="['flex-1 py-3 px-4 rounded-lg font-semibold transition-all', canStart ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 cursor-not-allowed']"
        >
          {{ isOptimizing ? '优化中...' : '开始优化' }}
        </button>
        
        <button 
          @click="$emit('reset')"
          class="px-4 py-3 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          重置
        </button>
      </div>
    </div>

    <!-- Right: Results & Analysis -->
    <div class="space-y-6">
      <!-- Phase 1: Instrumentation -->
      <div v-if="currentPhase >= 0" class="lab-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <span :class="['w-8 h-8 rounded-full flex items-center justify-center text-sm', phase1Completed ? 'bg-green-500' : 'bg-blue-500']">
              {{ phase1Completed ? '✓' : '1' }}
            </span>
            基线分析
          </h3>
          <button v-if="!phase1Completed" @click="runInstrumentation" class="text-sm text-blue-400 hover:text-blue-300">
            运行分析
          </button>
        </div>
        
        <div v-if="instrumentationResults" class="space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-slate-950 p-3 rounded-lg text-center">
              <p class="text-2xl font-bold text-blue-400">{{ instrumentationResults.wordCount }}</p>
              <p class="text-xs text-slate-400">词数</p>
            </div>
            <div class="bg-slate-950 p-3 rounded-lg text-center">
              <p class="text-2xl font-bold text-yellow-400">{{ instrumentationResults.clarityScore }}</p>
              <p class="text-xs text-slate-400">清晰度 (1-10)</p>
            </div>
            <div class="bg-slate-950 p-3 rounded-lg text-center">
              <p class="text-2xl font-bold text-green-400">{{ instrumentationResults.structureScore }}</p>
              <p class="text-xs text-slate-400">结构化 (1-10)</p>
            </div>
          </div>
          
          <div class="bg-slate-950 p-3 rounded-lg">
            <p class="text-sm font-medium mb-2">检测到的问题:</p>
            <ul class="text-sm text-slate-400 space-y-1">
              <li v-for="issue in instrumentationResults.issues" :key="issue">• {{ issue }}</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Phase 2-4: Optimization Preview -->
      <div v-if="optimizedPrompt" class="lab-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm">✓</span>
            优化后提示词
          </h3>
          <button @click="copyOptimized" class="text-sm text-blue-400 hover:text-blue-300">
            复制
          </button>
        </div>
        
        <div class="bg-slate-950 p-4 rounded-lg text-sm font-mono whitespace-pre-wrap">
          {{ optimizedPrompt }}
        </div>
        
        <!-- Diff View -->
        <div class="mt-4">
          <p class="text-sm font-medium mb-2">变更对比:</p>
          <div class="bg-slate-950 p-3 rounded-lg text-sm space-y-2">
            <div v-for="(change, index) in changes" :key="index" :class="['p-2 rounded', change.type === 'added' ? 'diff-added' : 'diff-removed']">
              <span class="font-mono">{{ change.type === 'added' ? '+' : '-' }} {{ change.text }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps(['currentPhase'])
const emit = defineEmits(['phase-complete', 'reset'])

const originalPrompt = ref('')
const optimizedPrompt = ref('')
const isOptimizing = ref(false)
const phase1Completed = ref(false)
const instrumentationResults = ref(null)

const targets = [
  { id: 'clarity', name: '提升清晰度', icon: '✨', description: '让指令更明确，减少歧义' },
  { id: 'structure', name: '结构化改进', icon: '🏗️', description: '分阶段、分步骤描述任务' },
  { id: 'examples', name: '添加示例', icon: '💡', description: '用例子说明期望的输出' },
  { id: 'constraints', name: '明确约束', icon: '📏', description: '添加边界条件和限制' },
  { id: 'feedback', name: '反馈循环', icon: '🔄', description: '建立自我验证机制' },
]

const selectedTargets = ref([])
const changes = ref([])

const canStart = computed(() => 
  originalPrompt.value.length > 10 && 
  selectedTargets.value.length > 0
)

function runInstrumentation() {
  // Analyze the original prompt
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
    clarityScore: Math.max(3, 10 - issues.length * 1.5),
    structureScore: sentences.length > 3 ? 7 : 4,
    issues: issues.length > 0 ? issues : ['提示词结构良好']
  }
  
  phase1Completed.value = true
  emit('phase-complete')
}

async function startOptimization() {
  isOptimizing.value = true
  
  // Phase 1
  if (!phase1Completed.value) {
    runInstrumentation()
    await sleep(500)
  }
  
  // Generate optimized prompt based on selected targets
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
  emit('phase-complete')
}

function copyOptimized() {
  navigator.clipboard.writeText(optimizedPrompt.value)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>
