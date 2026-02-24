<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">📚</span>
        <h2 class="text-lg sm:text-xl font-medium text-[#37352f]">提示词模板库</h2>
      </div>
      
      <button type="button" class="px-3 sm:px-4 py-2 bg-[#2383e2] hover:bg-[#1a6fc2] active:bg-[#155a9e] rounded text-sm font-medium text-white transition-colors w-fit">
        + 添加模板
      </button>
    </div>

    <!-- Filter Tags -->
    <div class="flex gap-1.5 sm:gap-2 flex-wrap">
      <button 
        type="button"
        v-for="tag in tags" 
        :key="tag"
        @click="selectedTag = tag"
        :class="['px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm transition-colors', selectedTag === tag ? 'bg-[#37352f] text-white' : 'bg-[#f7f6f3] text-[#6b6b6b] hover:bg-[#e3e2e0]']"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Template Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        class="lab-card p-4 sm:p-5 cursor-pointer hover:bg-[#f1f1ef] transition-colors active:bg-[#e3e2e0]"
        @click="useTemplate(template)"
      >
        <div class="flex items-start justify-between mb-2 sm:mb-3">
          <div class="flex items-center gap-2 sm:gap-3">
            <span class="text-xl sm:text-2xl">{{ template.icon }}</span>
            <div class="min-w-0">
              <h3 class="font-medium text-[#37352f] text-sm sm:text-base truncate">{{ template.name }}</h3>
              <p class="text-xs text-[#6b6b6b]">{{ template.category }}</p>
            </div>
          </div>
          
          <span class="px-2 py-0.5 bg-[#f7f6f3] rounded text-xs text-[#6b6b6b] shrink-0">
            {{ template.phases }} 阶段
          </span>
        </div>
        
        <p class="text-xs sm:text-sm text-[#6b6b6b] mb-3 line-clamp-2">{{ template.description }}</p>
        
        <div class="flex flex-wrap gap-1.5">
          <span 
            v-for="tag in template.tags" 
            :key="tag"
            class="px-1.5 py-0.5 bg-[#f7f6f3] rounded text-xs text-[#9ca3af]"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Featured Template: Laboratory Pattern -->
    <div class="lab-card p-4 sm:p-6 border-[#2383e2]/30 bg-[#2383e2]/5">
      <div class="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <span class="text-2xl sm:text-3xl">🧪</span>
        <div>
          <h3 class="text-base sm:text-lg font-medium text-[#37352f]">实验室模式</h3>
          <p class="text-xs sm:text-sm text-[#2383e2]">Brian Lovin 推荐 · 给 Agent 一个反馈循环</p>
        </div>
      </div>

      <div class="bg-[#f7f6f3] p-3 sm:p-4 rounded font-mono text-xs sm:text-sm whitespace-pre-wrap mb-3 sm:mb-4 text-[#37352f] overflow-x-auto border border-[#e3e2e0]">
{{ laboratoryTemplate }}
      </div>

      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button 
          type="button"
          @click="copyTemplate(laboratoryTemplate)" 
          class="flex-1 py-2 sm:py-2.5 bg-[#2383e2] hover:bg-[#1a6fc2] active:bg-[#155a9e] rounded text-sm font-medium text-white transition-colors"
        >
          复制模板
        </button>
        
        <button 
          type="button"
          @click="useInLab" 
          class="flex-1 py-2 sm:py-2.5 border border-[#2383e2] text-[#2383e2] hover:bg-[#2383e2]/10 active:bg-[#2383e2]/20 rounded text-sm font-medium transition-colors"
        >
          在实验室中使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'

const toast = useToast()
const emit = defineEmits(['use-template'])

const tags = ['全部', '性能优化', 'UI实现', '代码重构', 'Bug修复', '架构设计', '组件', '后端']
const selectedTag = ref('全部')

const templates = [
  {
    id: 1,
    name: '性能优化实验',
    icon: '⚡',
    category: '性能',
    phases: 4,
    description: '建立基准测试 → 诊断瓶颈 → 迭代优化 → 生成报告',
    tags: ['performance', 'benchmark', 'optimization']
  },
  {
    id: 2,
    name: '像素级UI实现',
    icon: '🎨',
    category: '前端',
    phases: 3,
    description: '截图对比 → 差异修复 → 循环验证直到完美',
    tags: ['ui', 'design', 'pixel-perfect']
  },
  {
    id: 3,
    name: '代码重构实验',
    icon: '🏗️',
    category: '重构',
    phases: 3,
    description: '分析现状 → 制定计划 → 逐步重构并验证',
    tags: ['refactor', 'clean-code', 'architecture']
  },
  {
    id: 4,
    name: 'Bug修复实验室',
    icon: '🐛',
    category: '调试',
    phases: 4,
    description: '复现问题 → 诊断根因 → 验证修复 → 回归测试',
    tags: ['debug', 'testing', 'fix']
  },
  {
    id: 5,
    name: '组件设计工坊',
    icon: '🧩',
    category: '组件',
    phases: 3,
    description: '分析需求 → 设计API → 实现并验证边缘情况',
    tags: ['component', 'design-system', 'api']
  },
  {
    id: 6,
    name: 'API设计实验',
    icon: '🔌',
    category: '后端',
    phases: 3,
    description: '定义契约 → 实现端点 → 测试验证',
    tags: ['api', 'backend', 'rest']
  }
]

const laboratoryTemplate = `你的任务是[具体任务描述]。

你需要建立自己的工作实验室，按以下阶段执行：

Phase 1 — 仪表化：
建立测量基线。对于代码，创建性能测试；对于UI，截图记录当前状态；对于API，记录响应时间和错误率。

Phase 2 — 诊断：
分析收集的数据。识别前3-5个问题。对每个问题，写下假设和可能的解决方案。使用搜索检查已知问题。

Phase 3 — 迭代：
逐个测试假设。做出改变，重新测量，与基线对比。保留有效改进，每次成功后提交。

Phase 4 — 报告：
生成对比报告，包含前后数据、改进百分比、遇到的问题和解决方案。

如果需要重大架构变更，标记并继续。遇到阻塞时向我提问。`

const tagMapping = {
  '性能优化': ['performance', 'optimization', '性能'],
  'UI实现': ['ui', 'design', '前端'],
  '代码重构': ['refactor', 'clean-code', '重构'],
  'Bug修复': ['debug', 'testing', '调试'],
  '架构设计': ['architecture', 'design'],
  '组件': ['component', 'design-system'],
  '后端': ['api', 'backend', '后端']
}

const filteredTemplates = computed(() => {
  if (selectedTag.value === '全部') return templates
  const mappedTags = tagMapping[selectedTag.value] || [selectedTag.value.toLowerCase()]
  return templates.filter(t => 
    t.category === selectedTag.value || 
    t.tags.some(tag => mappedTags.includes(tag.toLowerCase()))
  )
})

function useTemplate(template) {
  navigator.clipboard.writeText(template.content || laboratoryTemplate)
  toast.success(`已复制 "${template.name}" 到剪贴板`)
}

function copyTemplate(text) {
  navigator.clipboard.writeText(text)
  toast.success('已复制到剪贴板')
}

function useInLab() {
  navigator.clipboard.writeText(laboratoryTemplate)
  toast.success('已复制到剪贴板，请在实验室中使用')
}
</script>
