<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-2xl">🩺</span>
      <div>
        <h2 class="text-xl font-semibold text-[#37352f]">提示词诊断室</h2>
        <p class="text-sm text-[#6b6b6b]">自动分析你的提示词质量，找出改进空间</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：输入区 -->
      <div class="space-y-4">
        <div class="lab-card p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium text-[#37352f]">你的提示词</h3>
            <button 
              type="button"
              @click="loadExample"
              class="text-xs text-[#2383e2] hover:text-[#1a6fc2]"
            >
              加载示例
            </button>
          </div>
          
          <textarea
            v-model="promptText"
            class="w-full h-64 p-4 bg-[#f7f6f3] border border-[#e3e2e0] rounded-lg resize-none focus:border-[#2383e2] focus:outline-none text-sm leading-relaxed"
            placeholder="在这里粘贴你的提示词..."
          />
          
          <div class="flex items-center justify-between mt-3">
            <span class="text-xs text-[#6b6b6b]">{{ promptText.length }} 字符</span>
            <button
              type="button"
              @click="startDiagnosis"
              :disabled="!canDiagnose || isDiagnosing"
              :class="['px-4 py-2 rounded-lg font-medium text-sm transition-colors', canDiagnose && !isDiagnosing ? 'bg-[#2383e2] hover:bg-[#1a6fc2] text-white' : 'bg-[#e3e2e0] text-[#6b6b6b] cursor-not-allowed']"
            >
              {{ isDiagnosing ? '诊断中...' : '开始诊断' }}
            </button>
          </div>
        </div>

        <!-- 快速优化建议 -->
        <div v-if="diagnosisResult && diagnosisResult.suggestions.length > 0" class="lab-card p-4">
          <h3 class="font-medium text-[#37352f] mb-3">💡 快速优化</h3>
          <div class="space-y-2">
            <button
              v-for="(suggestion, index) in diagnosisResult.suggestions.slice(0, 3)"
              :key="index"
              type="button"
              @click="applySuggestion(suggestion)"
              class="w-full text-left p-3 rounded-lg border border-[#e3e2e0] hover:border-[#2383e2] hover:bg-[#2383e2]/5 transition-all"
            >
              <p class="font-medium text-sm text-[#37352f]">{{ suggestion.title }}</p>
              <p class="text-xs text-[#6b6b6b] mt-1">{{ suggestion.description }}</p>
            </button>
          </div>
          
          <router-link 
            to="/optimizer" 
            class="block w-full mt-3 py-2 text-center text-sm text-[#2383e2] hover:text-[#1a6fc2] font-medium border border-[#2383e2] rounded-lg hover:bg-[#2383e2]/5"
          >
            去优化器查看更多方案 →
          </router-link>
        </div>
      </div>

      <!-- 右侧：诊断报告 -->
      <div class="space-y-4">
        <!-- 评分卡片 -->
        <div v-if="diagnosisResult" class="lab-card p-6">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-3"
                 :class="scoreBgClass">
              <span class="text-3xl font-bold" :class="scoreTextClass">{{ diagnosisResult.score }}</span>
            </div>
            <p class="text-lg font-medium text-[#37352f]">{{ scoreLabel }}</p>
            <p class="text-sm text-[#6b6b6b] mt-1">综合评分 (满分10分)</p>
          </div>

          <!-- 维度评分 -->
          <div class="space-y-3">
            <div v-for="dimension in dimensions" :key="dimension.key" class="flex items-center gap-3">
              <span class="text-sm text-[#6b6b6b] w-16">{{ dimension.label }}</span>
              <div class="flex-1 h-2 bg-[#e3e2e0] rounded-full overflow-hidden">
                <div 
                  class="h-full rounded-full transition-all duration-500"
                  :class="dimension.color"
                  :style="{ width: `${diagnosisResult[dimension.key] * 10}%` }"
                />
              </div>
              <span class="text-sm font-medium text-[#37352f] w-8 text-right">{{ diagnosisResult[dimension.key] }}</span>
            </div>
          </div>
        </div>

        <!-- 问题列表 -->
        <div v-if="diagnosisResult && diagnosisResult.issues.length > 0" class="lab-card p-4">
          <h3 class="font-medium text-[#37352f] mb-3 flex items-center gap-2">
            <span>⚠️</span>
            发现 {{ diagnosisResult.issues.length }} 个问题
          </h3>
          
          <div class="space-y-2">
            <div
              v-for="(issue, index) in diagnosisResult.issues"
              :key="index"
              class="p-3 rounded-lg border-l-4"
              :class="issueSeverityClass(issue.severity)"
            >
              <div class="flex items-start gap-2">
                <span class="text-lg">{{ issue.icon }}</span>
                <div class="flex-1">
                  <p class="font-medium text-sm text-[#37352f]">{{ issue.title }}</p>
                  <p class="text-xs text-[#6b6b6b] mt-1">{{ issue.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="!diagnosisResult" class="lab-card p-8 text-center">
          <span class="text-5xl mb-4 block">📝</span>
          <p class="text-[#6b6b6b] mb-2">输入提示词并开始诊断</p>
          <p class="text-sm text-[#9ca3af]">我们将从清晰度、结构化、完整性等维度进行分析</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'

const toast = useToast()
const promptText = ref('')
const isDiagnosing = ref(false)
const diagnosisResult = ref(null)

const canDiagnose = computed(() => promptText.value.trim().length >= 10)

const dimensions = [
  { key: 'clarity', label: '清晰度', color: 'bg-[#2383e2]' },
  { key: 'structure', label: '结构化', color: 'bg-[#0f7b6f]' },
  { key: 'completeness', label: '完整性', color: 'bg-[#dfab01]' },
  { key: 'executability', label: '可执行', color: 'bg-[#6940a5]' }
]

const scoreBgClass = computed(() => {
  if (!diagnosisResult.value) return 'bg-[#e3e2e0]'
  const score = diagnosisResult.value.score
  if (score >= 8) return 'bg-[#0f7b6f]/10'
  if (score >= 6) return 'bg-[#dfab01]/10'
  return 'bg-[#e03e3e]/10'
})

const scoreTextClass = computed(() => {
  if (!diagnosisResult.value) return 'text-[#6b6b6b]'
  const score = diagnosisResult.value.score
  if (score >= 8) return 'text-[#0f7b6f]'
  if (score >= 6) return 'text-[#dfab01]'
  return 'text-[#e03e3e]'
})

const scoreLabel = computed(() => {
  if (!diagnosisResult.value) return '等待诊断'
  const score = diagnosisResult.value.score
  if (score >= 8) return '优秀'
  if (score >= 6) return '良好'
  if (score >= 4) return '一般'
  return '需要改进'
})

function issueSeverityClass(severity) {
  const classes = {
    high: 'bg-[#e03e3e]/10 border-[#e03e3e]',
    medium: 'bg-[#dfab01]/10 border-[#dfab01]',
    low: 'bg-[#2383e2]/10 border-[#2383e2]'
  }
  return classes[severity] || classes.low
}

function loadExample() {
  promptText.value = `帮我写一篇关于人工智能的文章。`
  toast.info('已加载示例提示词')
}

async function startDiagnosis() {
  isDiagnosing.value = true
  
  // 模拟诊断过程
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // 简单的启发式诊断逻辑
  const text = promptText.value
  const result = {
    score: 0,
    clarity: 0,
    structure: 0,
    completeness: 0,
    executability: 0,
    issues: [],
    suggestions: []
  }
  
  // 清晰度评分
  if (text.length < 20) {
    result.clarity = 3
    result.issues.push({
      severity: 'high',
      icon: '📝',
      title: '提示词过短',
      description: '当前提示词过于简短，AI 可能无法理解你的具体需求。建议增加更多上下文和细节。'
    })
  } else if (text.length < 100) {
    result.clarity = 6
    result.issues.push({
      severity: 'medium',
      icon: '📝',
      title: '可以更详细',
      description: '提示词长度适中，但仍有提升空间。可以考虑添加更多背景信息。'
    })
  } else {
    result.clarity = 8
  }
  
  // 结构化评分
  const hasSteps = /步骤|阶段|step|phase|1\.|2\./i.test(text)
  const hasRole = /角色|扮演|你是一位|你是一个/i.test(text)
  
  if (hasSteps && hasRole) {
    result.structure = 9
  } else if (hasSteps || hasRole) {
    result.structure = 6
    result.issues.push({
      severity: 'medium',
      icon: '🏗️',
      title: '结构化可改进',
      description: hasSteps ? '可以尝试添加角色设定，让 AI 更好地进入角色。' : '可以尝试添加步骤分解，让任务执行更清晰。'
    })
  } else {
    result.structure = 4
    result.issues.push({
      severity: 'high',
      icon: '🏗️',
      title: '缺乏结构化',
      description: '当前提示词缺乏结构化。建议添加角色设定、步骤分解或输出格式要求。'
    })
  }
  
  // 完整性评分
  const hasExample = /例如|比如|示例|example/i.test(text)
  const hasConstraint = /不要|禁止|必须|只能|限制/i.test(text)
  
  if (hasExample && hasConstraint) {
    result.completeness = 8
  } else if (hasExample || hasConstraint) {
    result.completeness = 6
  } else {
    result.completeness = 5
    result.issues.push({
      severity: 'low',
      icon: '📋',
      title: '可添加示例或约束',
      description: '添加具体示例或约束条件可以帮助 AI 更好地理解你的期望。'
    })
  }
  
  // 可执行性评分
  const isVague = /帮我|帮我写|帮我做|一些|一点/i.test(text)
  result.executability = isVague ? 5 : 7
  
  if (isVague) {
    result.issues.push({
      severity: 'medium',
      icon: '🎯',
      title: '表述过于笼统',
      description: '"帮我写一些" 这类表述过于笼统。建议明确具体的要求，比如字数、风格、重点等。'
    })
  }
  
  // 计算综合评分
  result.score = Math.round((result.clarity + result.structure + result.completeness + result.executability) / 4)
  
  // 生成建议
  if (result.structure < 7) {
    result.suggestions.push({
      title: '添加角色设定',
      description: '让 AI 扮演特定角色，比如"你是一位资深的技术写作专家"',
      type: 'structure'
    })
  }
  
  if (result.structure < 7 && !hasSteps) {
    result.suggestions.push({
      title: '添加步骤分解',
      description: '将任务分解为明确的步骤，比如"第一步：... 第二步：..."',
      type: 'structure'
    })
  }
  
  if (!hasExample) {
    result.suggestions.push({
      title: '提供示例',
      description: '给出一个你期望的输出示例，帮助 AI 理解你的需求',
      type: 'example'
    })
  }
  
  diagnosisResult.value = result
  isDiagnosing.value = false
  
  toast.success(`诊断完成！综合评分：${result.score}/10`)
}

function applySuggestion(suggestion) {
  // 这里可以实现一键应用建议的逻辑
  // 暂时只是跳转到优化器
  toast.info(`建议"${suggestion.title}"已记录，请在优化器中查看完整方案`)
}
</script>
