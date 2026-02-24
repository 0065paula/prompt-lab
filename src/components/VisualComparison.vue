<template>
  <div class="lab-card p-6">
    <h2 class="text-xl font-semibold mb-6">视觉对比实验室</h2>
    
    <div class="grid grid-cols-2 gap-6">
      <!-- Design Reference -->
      <div class="space-y-4">
        <h3 class="font-medium text-slate-300">设计参考 (Figma/图片)</h3>
        <div 
          class="aspect-video bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all"
          @click="uploadReference"
        >
          <div v-if="!referenceImage" class="text-center">
            <span class="text-4xl mb-2">📸</span>
            <p class="text-slate-400">点击上传设计稿</p>
            <p class="text-sm text-slate-500">支持 Figma URL、PNG、JPG</p>
          </div>
          <img v-else :src="referenceImage" class="w-full h-full object-contain rounded-lg" />
        </div>
      </div>

      <!-- Implementation Screenshot -->
      <div class="space-y-4">
        <h3 class="font-medium text-slate-300">实现截图</h3>
        <div 
          class="aspect-video bg-slate-950 border-2 border-dashed border-slate-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-500 transition-all"
          @click="uploadImplementation"
        >
          <div v-if="!implementationImage" class="text-center">
            <span class="text-4xl mb-2">🖼️</span>
            <p class="text-slate-400">点击上传实现截图</p>
            <p class="text-sm text-slate-500">或使用 Chrome DevTools MCP</p>
          </div>
          <img v-else :src="implementationImage" class="w-full h-full object-contain rounded-lg" />
        </div>
      </div>
    </div>

    <!-- Comparison Tools -->
    <div v-if="referenceImage && implementationImage" class="mt-6 space-y-4">
      <div class="flex gap-3">
        <button 
          @click="runComparison"
          :disabled="isComparing"
          class="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg font-semibold transition-all"
        >
          {{ isComparing ? '分析中...' : '运行视觉对比' }}
        </button>
        
        <button 
          @click="toggleOverlay"
          class="px-4 py-3 border border-slate-600 rounded-lg hover:bg-slate-800"
          :class="{ 'bg-blue-500/20 border-blue-500': showOverlay }"
        >
          叠加对比
        </button>
      </div>

      <!-- Comparison Results -->
      <div v-if="comparisonResults" class="bg-slate-950 rounded-lg p-4">
        <h4 class="font-medium mb-3">差异分析结果:</h4>
        
        <div class="space-y-2">
          <div 
            v-for="(diff, index) in comparisonResults.differences" 
            :key="index"
            class="flex items-start gap-3 p-3 rounded-lg"
            :class="diff.severity === 'high' ? 'bg-red-500/20' : diff.severity === 'medium' ? 'bg-yellow-500/20' : 'bg-blue-500/20'"
          >
            <span class="text-xl">{{ diff.icon }}</span>
            <div class="flex-1">
              <p class="font-medium">{{ diff.category }}</p>
              <p class="text-sm text-slate-400">{{ diff.description }}</p>
              <p class="text-xs text-slate-500 mt-1">建议: {{ diff.suggestion }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p class="text-sm font-medium text-green-400">相似度评分: {{ comparisonResults.similarity }}%</p>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-6 p-4 bg-slate-800/50 rounded-lg">
      <h4 class="font-medium mb-2">💡 工作原理</h4>
      <ul class="text-sm text-slate-400 space-y-1">
        <li>1. 上传设计稿（Figma 导出或设计工具截图）</li>
        <li>2. 上传实现后的网页截图</li>
        <li>3. 系统自动对比颜色、间距、字体、布局等</li>
        <li>4. 生成详细的差异报告和修复建议</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const referenceImage = ref('')
const implementationImage = ref('')
const isComparing = ref(false)
const showOverlay = ref(false)
const comparisonResults = ref(null)

function uploadReference() {
  // Trigger file input
  alert('文件上传功能需要配合后端或使用 File API')
}

function uploadImplementation() {
  alert('文件上传功能需要配合后端或使用 File API')
}

async function runComparison() {
  isComparing.value = true
  
  // Simulate comparison
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  comparisonResults.value = {
    similarity: 78,
    differences: [
      {
        category: '颜色偏差',
        icon: '🎨',
        severity: 'medium',
        description: '主按钮颜色 #3B82F6 vs #2563EB',
        suggestion: '使用设计系统的颜色变量'
      },
      {
        category: '间距不一致',
        icon: '📏',
        severity: 'high',
        description: '卡片间距 24px vs 16px',
        suggestion: '统一使用设计规范的 spacing token'
      },
      {
        category: '字体大小',
        icon: '🔤',
        severity: 'low',
        description: '标题字体 18px vs 16px',
        suggestion: '检查 typography 配置'
      }
    ]
  }
  
  isComparing.value = false
}

function toggleOverlay() {
  showOverlay.value = !showOverlay.value
}
</script>
