<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-semibold">迭代历史</h2>
      <div class="flex gap-2">
        <button class="px-3 py-1.5 text-sm border border-slate-600 rounded-lg hover:bg-slate-800">
          导出全部
        </button>
        <button class="px-3 py-1.5 text-sm bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30">
          清空历史
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-4 gap-4">
      <div class="lab-card p-4 text-center">
        <p class="text-2xl font-bold text-blue-400">{{ history.length }}</p>
        <p class="text-sm text-slate-400">总实验次数</p>
      </div>
      <div class="lab-card p-4 text-center">
        <p class="text-2xl font-bold text-green-400">{{ avgImprovement }}%</p>
        <p class="text-sm text-slate-400">平均改进</p>
      </div>
      <div class="lab-card p-4 text-center">
        <p class="text-2xl font-bold text-yellow-400">{{ favoriteCategory }}</p>
        <p class="text-sm text-slate-400">最常用类型</p>
      </div>
      <div class="lab-card p-4 text-center">
        <p class="text-2xl font-bold text-purple-400">{{ totalTime }}h</p>
        <p class="text-sm text-slate-400">累计优化时间</p>
      </div>
    </div>

    <!-- History List -->
    <div class="space-y-4">
      <div 
        v-for="(item, index) in history" 
        :key="item.id"
        class="lab-card p-5"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <span class="text-2xl">{{ item.icon }}</span>
            <div>
              <h3 class="font-semibold">{{ item.title }}</h3>
              <p class="text-sm text-slate-400">{{ item.date }} · {{ item.duration }}分钟</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="item.improvement > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'"
            >
              {{ item.improvement > 0 ? '+' : '' }}{{ item.improvement }}%
            </span>
            <button @click="toggleExpand(index)" class="text-slate-400 hover:text-white">
              {{ expanded === index ? '收起' : '展开' }}
            </button>
          </div>
        </div>

        <!-- Expanded Content -->
        <div v-if="expanded === index" class="space-y-4 border-t border-slate-700 pt-4">
          <!-- Before/After Comparison -->
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-slate-950 p-3 rounded-lg">
              <p class="text-xs text-slate-500 mb-2">优化前</p>
              <pre class="text-xs text-slate-400 overflow-auto max-h-32">{{ item.before }}</pre>
            </div>
            <div class="bg-slate-950 p-3 rounded-lg">
              <p class="text-xs text-slate-500 mb-2">优化后</p>
              <pre class="text-xs text-green-400 overflow-auto max-h-32">{{ item.after }}</pre>
            </div>
          </div>

          <!-- Key Changes -->
          <div>
            <p class="text-sm font-medium mb-2">关键改进:</p>
            <ul class="space-y-1">
              <li v-for="(change, i) in item.changes" :key="i" class="text-sm text-slate-400 flex items-center gap-2">
                <span :class="change.type === 'add' ? 'text-green-400' : 'text-red-400'">
                  {{ change.type === 'add' ? '+' : '-' }}
                </span>
                {{ change.description }}
              </li>
            </ul>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button @click="reusePrompt(item.after)" class="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 rounded">
              复用此提示词
            </button>            <button @click="compareVersions(item)" class="px-3 py-1.5 text-sm border border-slate-600 rounded hover:bg-slate-800">
              详细对比
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="history.length === 0" class="text-center py-12">
      <span class="text-6xl mb-4">🔬</span>
      <h3 class="text-lg font-semibold mb-2">还没有实验记录</h3>
      <p class="text-slate-400 mb-4">去实验室开始你的第一次提示词优化吧</p>
      <button class="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg">
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
    after: '你的任务是优化 React 组件性能。\\n\\nPhase 1 - 仪表化：使用 React DevTools Profiler 记录当前渲染时间...',
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
    after: '实现 Figma 设计稿。\\n\\nPhase 1 - 分析：提取设计 token（颜色、间距、字体）...',
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
    after: '重构 API 错误处理模块。\\n\\nPhase 1 - 分析：统计当前错误类型和频率...',
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
