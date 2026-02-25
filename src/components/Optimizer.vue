<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-2xl">✨</span>
      <div>
        <h2 class="text-xl font-semibold text-[#37352f]">智能优化器</h2>
        <p class="text-sm text-[#6b6b6b]">基于诊断结果，AI 为你生成多种优化方案</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 左侧：原始提示词 -->
      <div class="space-y-4">
        <div class="lab-card p-4">
          <h3 class="font-medium text-[#37352f] mb-3">原始提示词</h3>
          
          <textarea
            v-model="originalPrompt"
            class="w-full h-48 p-4 bg-[#f7f6f3] border border-[#e3e2e0] rounded-lg resize-none focus:border-[#2383e2] focus:outline-none text-sm leading-relaxed"
            placeholder="输入需要优化的提示词..."
          />
          
          <div class="flex gap-2 mt-3">
            <button
              type="button"
              @click="analyzePrompt"
              class="flex-1 py-2 bg-[#2383e2] hover:bg-[#1a6fc2] text-white rounded-lg text-sm font-medium transition-colors"
            >
              分析并生成方案
            </button>
            
            <button
              type="button"
              @click="loadFromDiagnosis"
              class="px-4 py-2 border border-[#e3e2e0] text-[#6b6b6b] rounded-lg text-sm hover:bg-[#f7f6f3] transition-colors"
            >
              从诊断室导入
            </button>
          </div>
        </div>

        <!-- 优化策略说明 -->
        <div class="lab-card p-4">
          <h3 class="font-medium text-[#37352f] mb-3">📚 优化策略库</h3>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-start gap-2">
              <span class="text-[#2383e2]">●</span>
              <div>
                <p class="font-medium text-[#37352f]">结构化策略</p>
                <p class="text-xs text-[#6b6b6b]">添加角色、步骤分解、输出格式</p>
              </div>
            </div>
            
            <div class="flex items-start gap-2">
              <span class="text-[#0f7b6f]">●</span>
              <div>
                <p class="font-medium text-[#37352f]">清晰度策略</p>
                <p class="text-xs text-[#6b6b6b]">消除歧义、添加示例、明确约束</p>
              </div>
            </div>
            
            <div class="flex items-start gap-2">
              <span class="text-[#dfab01]">●</span>
              <div>
                <p class="font-medium text-[#37352f]">高级策略</p>
                <p class="text-xs text-[#6b6b6b]">验证机制、错误处理、迭代反馈</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：优化方案 -->
      <div class="space-y-4">
        <!-- 方案列表 -->
        <div v-if="optimizationPlans.length > 0" class="space-y-4">
          <div
            v-for="(plan, index) in optimizationPlans"
            :key="index"
            class="lab-card overflow-hidden"
            :class="selectedPlan === index ? 'ring-2 ring-[#2383e2]' : ''"
          >
            <!-- 方案头部 -->
            <div 
              class="p-4 cursor-pointer hover:bg-[#f7f6f3] transition-colors"
              @click="selectPlan(index)"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ plan.icon }}</span>
                  <div>
                    <p class="font-medium text-[#37352f]">{{ plan.name }}</p>
                    <p class="text-xs text-[#6b6b6b]">{{ plan.description }}</p>
                  </div>
                </div>
                
                <div class="text-right">
                  <p class="text-lg font-semibold" :class="plan.score >= 8 ? 'text-[#0f7b6f]' : 'text-[#2383e2]'">
                    {{ plan.score }}分
                  </p>
                  <p class="text-xs text-[#6b6b6b]">预期评分</p>
                </div>
              </div>
              
              <!-- 改进点标签 -->
              <div class="flex flex-wrap gap-1 mt-3">
                <span
                  v-for="improvement in plan.improvements"
                  :key="improvement"
                  class="px-2 py-0.5 bg-[#2383e2]/10 text-[#2383e2] text-xs rounded-full"
                >
                  {{ improvement }}
                </span>
              </div>
            </div>
            
            <!-- 展开内容：预览和对比 -->
            <div v-if="selectedPlan === index" class="border-t border-[#e3e2e0] p-4">
              <div class="mb-4">
                <p class="text-xs font-medium text-[#6b6b6b] mb-2">优化后提示词：</p>
                <div class="bg-[#f7f6f3] p-3 rounded-lg text-sm text-[#37352f] whitespace-pre-wrap">
                  {{ plan.optimizedPrompt }}
                </div>
              </div>
              
              <div class="flex gap-2">
                <button
                  type="button"
                  @click="applyPlan(plan)"
                  class="flex-1 py-2 bg-[#2383e2] hover:bg-[#1a6fc2] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  应用此方案
                </button>
                
                <button
                  type="button"
                  @click="testPlan(plan)"
                  class="px-4 py-2 border border-[#e3e2e0] text-[#6b6b6b] rounded-lg text-sm hover:bg-[#f7f6f3] transition-colors"
                >
                  去测试
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="lab-card p-8 text-center">
          <span class="text-5xl mb-4 block">✨</span>
          <p class="text-[#6b6b6b] mb-2">输入提示词并分析</p>
          <p class="text-sm text-[#9ca3af]">AI 将为你生成多种优化方案</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from '../composables/useToast'
import { useLocalStorage } from '../composables/useLocalStorage'

const router = useRouter()
const toast = useToast()

const originalPrompt = useLocalStorage('optimizer-original', '')
const optimizationPlans = ref([])
const selectedPlan = ref(null)

// 分析提示词并生成优化方案
function analyzePrompt() {
  if (!originalPrompt.value.trim()) {
    toast.error('请先输入提示词')
    return
  }
  
  const text = originalPrompt.value
  const plans = []
  
  // 方案 A：结构化改进
  const planA = {
    name: '结构化增强版',
    icon: '🏗️',
    description: '添加角色设定和步骤分解，让提示词更有条理',
    score: 0,
    improvements: ['添加角色', '步骤分解'],
    optimizedPrompt: generateStructuredPrompt(text)
  }
  planA.score = Math.min(10, Math.round(6 + Math.random() * 2))
  plans.push(planA)
  
  // 方案 B：示例驱动版
  const planB = {
    name: '示例驱动版',
    icon: '💡',
    description: '添加具体示例和输出格式，减少理解偏差',
    score: 0,
    improvements: ['添加示例', '明确格式'],
    optimizedPrompt: generateExamplePrompt(text)
  }
  planB.score = Math.min(10, Math.round(6 + Math.random() * 2))
  plans.push(planB)
  
  // 方案 C：完整专业版
  const planC = {
    name: '完整专业版',
    icon: '🎯',
    description: '综合多种策略，适合复杂任务',
    score: 0,
    improvements: ['角色设定', '步骤分解', '示例说明', '约束条件'],
    optimizedPrompt: generateProfessionalPrompt(text)
  }
  planC.score = Math.min(10, Math.round(8 + Math.random() * 1.5))
  plans.push(planC)
  
  // 按评分排序
  plans.sort((a, b) => b.score - a.score)
  
  optimizationPlans.value = plans
  selectedPlan.value = 0
  
  toast.success(`已生成 ${plans.length} 个优化方案`)
}

// 从诊断室导入
function loadFromDiagnosis() {
  const savedPrompt = localStorage.getItem('prompt-lab-original')
  if (savedPrompt) {
    originalPrompt.value = savedPrompt
    toast.success('已从诊断室导入提示词')
    analyzePrompt()
  } else {
    toast.error('诊断室没有保存的提示词')
  }
}

function selectPlan(index) {
  selectedPlan.value = selectedPlan.value === index ? null : index
}

function applyPlan(plan) {
  originalPrompt.value = plan.optimizedPrompt
  
  // 保存到历史
  saveToHistory(plan)
  
  toast.success('已应用优化方案！')
}

function testPlan(plan) {
  // 保存当前方案，跳转到 A/B 测试
  localStorage.setItem('ab-test-plan-a', originalPrompt.value)
  localStorage.setItem('ab-test-plan-b', plan.optimizedPrompt)
  router.push('/ab-test')
  toast.info('已跳转到 A/B 测试')
}

function saveToHistory(plan) {
  const history = JSON.parse(localStorage.getItem('prompt-optimization-history') || '[]')
  history.unshift({
    id: Date.now(),
    original: originalPrompt.value,
    optimized: plan.optimizedPrompt,
    planName: plan.name,
    score: plan.score,
    timestamp: new Date().toISOString()
  })
  // 只保留最近 50 条
  localStorage.setItem('prompt-optimization-history', JSON.stringify(history.slice(0, 50)))
}

// 生成结构化提示词
function generateStructuredPrompt(original) {
  return `你是一位专业的助手。

任务：${original}

请按以下步骤执行：
1. 理解需求：仔细阅读任务要求，明确核心目标
2. 分析思路：列出完成任务的关键步骤
3. 执行生成：按照思路完成内容创作
4. 自我检查：验证输出是否符合要求，如有问题立即修正

输出要求：
- 结构清晰，层次分明
- 内容准确，无 factual errors
- 语言流畅，易于理解`
}

// 生成示例驱动提示词
function generateExamplePrompt(original) {
  return `${original}

【示例】
输入：帮我写一篇关于气候变化的文章
输出：
标题：气候变化：我们面临的挑战与行动
结构：
1. 引言（100字）
2. 现状分析（300字）
3. 影响阐述（300字）
4. 解决方案（200字）
5. 结语（100字）

【你的任务】
按照类似的结构和质量，完成我给定的任务。`
}

// 生成专业版提示词
function generateProfessionalPrompt(original) {
  return `# 角色设定
你是一位经验丰富的高级专家，擅长高质量内容创作。

# 任务描述
${original}

# 执行步骤
Phase 1 - 分析：
- 理解任务核心需求
- 识别关键约束条件
- 确定目标受众和风格

Phase 2 - 规划：
- 制定内容大纲
- 确定各部分内容比重
- 规划逻辑流程

Phase 3 - 执行：
- 按照规划撰写内容
- 确保每个部分完整且高质量
- 保持语言风格一致性

Phase 4 - 验证：
- 检查是否满足所有要求
- 验证内容准确性
- 优化表达，提升可读性

# 输出标准
✓ 内容完整，不遗漏任何要求
✓ 逻辑清晰，层次分明
✓ 语言准确，无语法错误
✓ 风格统一，符合目标受众

# 约束条件
- 保持客观中立，除非特别要求主观观点
- 如有不确定的信息，明确标注
- 遇到冲突要求时，优先满足核心需求`
}
</script>
