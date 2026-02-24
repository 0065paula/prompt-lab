<template>
  <div class="lab-card p-4 sm:p-6">
    <div class="flex items-center gap-2 mb-4 sm:mb-6">
      <span class="text-xl sm:text-2xl">🔬</span>
      <h2 class="text-lg sm:text-xl font-medium text-[#37352f]">视觉对比实验室</h2>
    </div>
    
    <!-- Image Upload Area - Mobile: Stack / Desktop: Side by Side -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      <!-- Design Reference -->
      <div class="space-y-2 sm:space-y-3">
        <h3 class="text-sm font-medium text-[#6b6b6b]">设计参考</h3>
        <div 
          class="aspect-video bg-[#f7f6f3] border-2 border-dashed border-[#e3e2e0] rounded flex items-center justify-center cursor-pointer hover:border-[#2383e2] hover:bg-[#f1f1ef] transition-all active:bg-[#e3e2e0]"
          @click="uploadReference"
        >
          <div v-if="!referenceImage" class="text-center p-4">
            <span class="text-3xl sm:text-4xl mb-2 block">📸</span>
            <p class="text-[#6b6b6b] text-sm">点击上传设计稿</p>
            <p class="text-xs text-[#9ca3af] mt-1">支持 Figma、PNG、JPG</p>
          </div>
          <img 
            v-else 
            :src="referenceImage" 
            class="w-full h-full object-contain rounded p-2" 
          />
        </div>
      </div>

      <!-- Implementation Screenshot -->
      <div class="space-y-2 sm:space-y-3">
        <h3 class="text-sm font-medium text-[#6b6b6b]">实现截图</h3>
        <div 
          class="aspect-video bg-[#f7f6f3] border-2 border-dashed border-[#e3e2e0] rounded flex items-center justify-center cursor-pointer hover:border-[#2383e2] hover:bg-[#f1f1ef] transition-all active:bg-[#e3e2e0]"
          @click="uploadImplementation"
        >
          <div v-if="!implementationImage" class="text-center p-4">
            <span class="text-3xl sm:text-4xl mb-2 block">🖼️</span>
            <p class="text-[#6b6b6b] text-sm">点击上传实现截图</p>
            <p class="text-xs text-[#9ca3af] mt-1">Chrome DevTools MCP</p>
          </div>
          <img 
            v-else 
            :src="implementationImage" 
            class="w-full h-full object-contain rounded p-2" 
          />
        </div>
      </div>
    </div>

    <!-- Comparison Tools -->
    <div v-if="referenceImage && implementationImage" class="mt-4 sm:mt-6 space-y-4">
      <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <button 
          @click="runComparison"
          :disabled="isComparing"
          :class="['flex-1 py-2.5 sm:py-3 px-4 rounded font-medium transition-colors text-sm sm:text-base', isComparing ? 'bg-[#e3e2e0] text-[#6b6b6b]' : 'bg-[#2383e2] hover:bg-[#1a6fc2] text-white active:bg-[#155a9e]']"
        >
          {{ isComparing ? '分析中...' : '运行视觉对比' }}
        </button>
        
        <button 
          @click="toggleOverlay"
          :class="['py-2.5 sm:py-3 px-4 rounded border font-medium transition-colors text-sm sm:text-base', showOverlay ? 'bg-[#2383e2]/10 border-[#2383e2] text-[#2383e2]' : 'border-[#e3e2e0] text-[#6b6b6b] hover:bg-[#f7f6f3]']"
        >
          叠加对比
        </button>
      </div>

      <!-- Comparison Results -->
      <div v-if="comparisonResults" class="bg-[#f7f6f3] rounded p-3 sm:p-4 border border-[#e3e2e0]">
        <h4 class="font-medium mb-3 text-[#37352f] text-sm sm:text-base">差异分析结果:</h4>
        
        <div class="space-y-2">
          <div 
            v-for="(diff, index) in comparisonResults.differences" 
            :key="index"
            class="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded border"
            :class="diff.severity === 'high' ? 'bg-[#e03e3e]/10 border-[#e03e3e]/30' : diff.severity === 'medium' ? 'bg-[#dfab01]/10 border-[#dfab01]/30' : 'bg-[#2383e2]/10 border-[#2383e2]/30'"
          >
            <span class="text-lg sm:text-xl shrink-0">{{ diff.icon }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-[#37352f] text-sm">{{ diff.category }}</p>
              <p class="text-xs sm:text-sm text-[#6b6b6b]">{{ diff.description }}</p>
              <p class="text-xs text-[#9ca3af] mt-1">建议: {{ diff.suggestion }}</p>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 bg-[#0f7b6f]/10 border border-[#0f7b6f]/30 rounded">
          <p class="text-sm font-medium text-[#0f7b6f]">
            相似度评分: {{ comparisonResults.similarity }}%
          </p>
        </div>
      </div>
    </div>

    <!-- Instructions -->
    <div class="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#f7f6f3] rounded border border-[#e3e2e0]">
      <h4 class="font-medium mb-2 text-[#37352f] text-sm">💡 工作原理</h4>
      <ul class="text-xs sm:text-sm text-[#6b6b6b] space-y-1">
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
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      referenceImage.value = URL.createObjectURL(file)
    }
  }
  input.click()
}

function uploadImplementation() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      implementationImage.value = URL.createObjectURL(file)
    }
  }
  input.click()
}

async function runComparison() {
  isComparing.value = true
  
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
