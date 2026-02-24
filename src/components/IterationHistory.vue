<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-xl">📊</span>
        <h2 class="text-lg sm:text-xl font-medium text-[#37352f]">迭代历史</h2>
      </div>
      
      <div class="flex gap-2">
        <button class="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm border border-[#e3e2e0] rounded hover:bg-[#f7f6f3] text-[#6b6b6b] transition-colors">
          导出
        </button>
        
        <button 
          v-if="history.length > 0"
          class="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm bg-[#e03e3e]/10 text-[#e03e3e] border border-[#e03e3e]/30 rounded hover:bg-[#e03e3e]/20 transition-colors"
        >
          清空
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="history.length > 0" class="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      <div class="lab-card p-3 sm:p-4 text-center">
        <p class="text-xl sm:text-2xl font-semibold text-[#2383e2]">{{ history.length }}</p>
        <p class="text-xs text-[#6b6b6b]">总实验次数</p>
      </div>
      
      <div class="lab-card p-3 sm:p-4 text-center">
        <p class="text-xl sm:text-2xl font-semibold text-[#0f7b6f]">{{ avgImprovement }}%</p>
        <p class="text-xs text-[#6b6b6b]">平均改进</p>
      </div>
      
      <div class="lab-card p-3 sm:p-4 text-center">
        <p class="text-xl sm:text-2xl font-semibold text-[#dfab01]">{{ favoriteCategory }}</p>
        <p class="text-xs text-[#6b6b6b]">最常用类型</p>
      </div>
      
      <div class="lab-card p-3 sm:p-4 text-center">
        <p class="text-xl sm:text-2xl font-semibold text-[#6940a5]">{{ totalTime }}h</p>
        <p class="text-xs text-[#6b6b6b]">累计优化时间</p>
      </div>
    </div>

    <!-- History List -->
    <div v-if="history.length > 0" class="space-y-3">
      <div 
        v-for="(item, index) in history" 
        :key="item.id"
        class="lab-card p-3 sm:p-4"
      >
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <span class="text-xl sm:text-2xl shrink-0">{{ item.icon }}</span>
            <div class="min-w-0">
              <h3 class="font-medium text-[#37352f] text-sm sm:text-base truncate">{{ item.title }}</h3>
              <p class="text-xs text-[#6b6b6b]">{{ item.date }} · {{ item.duration }}分钟</p>
            </div>
          </div>
          
          <div class="flex items-center gap-2 shrink-0">
            <span 
              class="px-2 py-0.5 rounded-full text-xs font-medium"
              :class="item.improvement > 0 ? 'bg-[#0f7b6f]/10 text-[#0f7b6f]' : 'bg-[#e03e3e]/10 text-[#e03e3e]'"
            >
              {{ item.improvement > 0 ? '+' : '' }}{{ item.improvement }}%
            </span>
            
            <button 
              @click="toggleExpand(index)" 
              class="text-xs sm:text-sm text-[#2383e2] hover:text-[#1a6fc2] font-medium px-2 py-1 rounded hover:bg-[#f7f6f3]"
            >
              {{ expanded === index ? '收起' : '展开' }}
            </button>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="expanded === index" class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[#e3e2e0] space-y-4">
          <!-- Before/After Comparison -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-[#f7f6f3] p-3 rounded border border-[#e3e2e0]">
              <p class="text-xs text-[#6b6b6b] mb-2">优化前</p>
              <pre class="text-xs text-[#9ca3af] overflow-auto max-h-32 whitespace-pre-wrap">{{ item.before }}</pre>
            </div>
            
            <div class="bg-[#f7f6f3] p-3 rounded border border-[#e3e2e0]">
              <p class="text-xs text-[#6b6b6b] mb-2">优化后</p>
              <pre class="text-xs text-[#0f7b6f] overflow-auto max-h-32 whitespace-pre-wrap">{{ item.after }}</pre>
            </div>
          </div>

          <!-- Key Changes -->
          <div v-if="item.changes.length > 0">
            <p class="text-sm font-medium mb-2 text-[#37352f]">关键改进:</p>
            <ul class="space-y-1">
              <li 
                v-for="(change, i) in item.changes" 
                :key="i" 
                class="text-xs sm:text-sm text-[#6b6b6b] flex items-start gap-2"
              >
                <span 
                  :class="change.type === 'add' ? 'text-[#0f7b6f]' : 'text-[#e03e3e]'"
                  class="font-medium shrink-0"
                >
                  {{ change.type === 'add' ? '+' : '-' }}
                </span>
                <span>{{ change.description }}</span>
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button 
              @click="reusePrompt(item.after)" 
              class="px-3 py-1.5 text-xs sm:text-sm bg-[#2383e2] hover:bg-[#1a6fc2] text-white rounded transition-colors"
            >
              复用此提示词
            </button>
            
            <button 
              @click="compareVersions(item)" 
              class="px-3 py-1.5 text-xs sm:text-sm border border-[#e3e2e0] text-[#6b6b6b] rounded hover:bg-[#f7f6f3] transition-colors"
            >
              详细对比
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="history.length === 0" class="text-center py-12 sm:py-16">
      <span class="text-5xl sm:text-6xl mb-4 block">🔬</span>
      <h3 class="text-base sm:text-lg font-medium mb-2 text-[#37352f]">还没有实验记录</h3>
      <p class="text-sm text-[#6b6b6b] mb-4">去实验室开始你的第一次提示词优化吧</p>
      
      <button class="px-4 py-2 bg-[#2383e2] hover:bg-[#1a6fc2] text-white rounded text-sm font-medium transition-colors">
        开始实验
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const expanded = ref(null)

const history = ref([
  {
    id: 1,
    title: '优化 React 组件性能提示词',
    icon: '⚡',
    date: '2026-02-24',
    duration: 15,
    improvement: 45,
    before: '让组件更快一点',
    after: '你的任务是优化 React 组件性能。\n\nPhase 1 - 仪表化：使用 React DevTools Profiler 记录当前渲染时间...',
    changes: [
      { type: 'add', description: '添加四阶段执行框架' },
      { type: 'add', description: '明确性能测量方法' },
      { type: 'add', description: '添加验证步骤' }
    ]
  },
  {
    id: 2,
    title: '改进 UI 实现提示词',
    icon: '🎨',
    date: '2026-02-23',
    duration: 22,
    improvement: 38,
    before: '按 Figma 设计实现页面',
    after: '实现 Figma 设计稿。\n\nPhase 1 - 分析：提取设计 token（颜色、间距、字体）...',
    changes: [
      { type: 'add', description: '添加设计 token 提取步骤' },
      { type: 'add', description: '添加截图对比验证' },
      { type: 'remove', description: '移除模糊的"参考设计"表述' }
    ]
  },
  {
    id: 3,
    title: '重构 API 错误处理',
    icon: '🔌',
    date: '2026-02-22',
    duration: 30,
    improvement: 52,
    before: '改进错误处理代码',
    after: '重构 API 错误处理模块。\n\nPhase 1 - 分析：统计当前错误类型和频率...',
    changes: [
      { type: 'add', description: '添加错误分类统计' },
      { type: 'add', description: '添加向后兼容性检查' }
    ]
  }
])

const avgImprovement = computed(() => {
  if (history.value.length === 0) return 0
  return Math.round(history.value.reduce((sum, item) => sum + item.improvement, 0) / history.value.length)
})

const favoriteCategory = computed(() => '性能优化')

const totalTime = computed(() => {
  return Math.round(history.value.reduce((sum, item) => sum + item.duration, 0) / 60)
})

function toggleExpand(index) {
  expanded.value = expanded.value === index ? null : index
}

function reusePrompt(prompt) {
  navigator.clipboard.writeText(prompt)
  alert('已复制到剪贴板')
}

function compareVersions(item) {
  alert(`对比 ${item.title} 的版本差异`)
}
</script>
