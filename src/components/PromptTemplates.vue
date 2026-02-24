<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">提示词模板库</h2>
      <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium">
        + 添加模板
      </button>
    </div>

    <!-- Filter Tags -->
    <div class="flex gap-2 flex-wrap">
      <button 
        v-for="tag in tags" 
        :key="tag"
        @click="selectedTag = tag"
        :class="['px-3 py-1 rounded-full text-sm transition-all', selectedTag === tag ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700']"
      >
        {{ tag }}
      </button>
    </div>

    <!-- Template Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div 
        v-for="template in filteredTemplates" 
        :key="template.id"
        class="lab-card p-5 cursor-pointer hover:border-blue-500 transition-all"
        @click="useTemplate(template)"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">{{ template.icon }}</span>
            <div>
              <h3 class="font-semibold">{{ template.name }}</h3>
              <p class="text-sm text-slate-400">{{ template.category }}</p>
            </div>
          </div>
          <span class="px-2 py-1 bg-slate-800 rounded text-xs text-slate-400">
            {{ template.phases }} 阶段
          </span>
        </div>
        
        <p class="text-sm text-slate-400 mb-4 line-clamp-2">{{ template.description }}</p>
        
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="tag in template.tags" 
            :key="tag"
            class="px-2 py-1 bg-slate-800 rounded text-xs text-slate-500"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Featured Template: Laboratory Pattern -->
    <div class="lab-card p-6 border-blue-500/50">
      <div class="flex items-center gap-3 mb-4">
        <span class="text-3xl">🧪</span>
        <div>
          <h3 class="text-lg font-semibold">实验室模式（Brian Lovin 推荐）</h3>
          <p class="text-sm text-blue-400">给 Agent 一个反馈循环</p>
        </div>
      </div>

      <div class="bg-slate-950 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap mb-4">
{{ laboratoryTemplate }}
      </div>

      <div class="flex gap-3">
        <button @click="copyTemplate(laboratoryTemplate)" class="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-medium">
          复制模板
        </button>
        <button @click="useInLab" class="flex-1 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500/10 rounded-lg text-sm font-medium">
          在实验室中使用
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const tags = ['全部', '性能优化', 'UI实现', '代码重构', 'Bug修复', '架构设计']
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

const filteredTemplates = computed(() => {
  if (selectedTag.value === '全部') return templates
  return templates.filter(t => t.category === selectedTag.value || t.tags.includes(selectedTag.value.toLowerCase()))
})

function useTemplate(template) {
  alert(`使用模板: ${template.name}`)
}

function copyTemplate(text) {
  navigator.clipboard.writeText(text)
  alert('已复制到剪贴板')
}

function useInLab() {
  alert('跳转到实验室并填充此模板')
}
</script>
