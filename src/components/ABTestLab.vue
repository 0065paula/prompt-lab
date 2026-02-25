<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-3">
      <span class="text-2xl">🧪</span>
      <div>
        <h2 class="text-xl font-semibold text-[#37352f]">A/B 测试台</h2>
        <p class="text-sm text-[#6b6b6b]">对比不同版本提示词的效果，用数据说话</p>
      </div>
    </div>

    <!-- 测试配置 -->
    <div class="lab-card p-4">
      <h3 class="font-medium text-[#37352f] mb-4">测试配置</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 版本 A -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-[#6b6b6b]">版本 A（原始）</label>
          <textarea
            v-model="versionA.prompt"
            class="w-full h-32 p-3 bg-[#f7f6f3] border border-[#e3e2e0] rounded-lg resize-none focus:border-[#2383e2] focus:outline-none text-sm"
            placeholder="原始提示词..."
          />
        </div>
        
        <!-- 测试输入 -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-[#6b6b6b]">测试输入</label>
          <textarea
            v-model="testInput"
            class="w-full h-32 p-3 bg-[#f7f6f3] border border-[#e3e2e0] rounded-lg resize-none focus:border-[#2383e2] focus:outline-none text-sm"
            placeholder="输入测试用例..."
          />
          
          <button
            type="button"
            @click="runTest"
            :disabled="!canTest || isTesting"
            :class="['w-full py-2 rounded-lg font-medium text-sm transition-colors mt-2', canTest && !isTesting ? 'bg-[#2383e2] hover:bg-[#1a6fc2] text-white' : 'bg-[#e3e2e0] text-[#6b6b6b] cursor-not-allowed']"
          >
            {{ isTesting ? '测试中...' : '开始测试' }}
          </button>
        </div>
        
        <!-- 版本 B -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-[#6b6b6b]">版本 B（优化）</label>
          <textarea
            v-model="versionB.prompt"
            class="w-full h-32 p-3 bg-[#f7f6f3] border border-[#e3e2e0] rounded-lg resize-none focus:border-[#2383e2] focus:outline-none text-sm"
            placeholder="优化后的提示词..."
          />
        </div>
      </div>
    </div>

    <!-- 测试结果 -->
    <div v-if="testResult" class="lab-card p-4">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-medium text-[#37352f]">测试结果</h3>
        
        <div class="flex items-center gap-4">
          <div class="text-center">
            <p class="text-2xl font-bold" :class="versionA.score >= versionB.score ? 'text-[#0f7b6f]' : 'text-[#6b6b6b]'">{{ versionA.score }}</p>
            <p class="text-xs text-[#6b6b6b]">版本 A</p>
          </div>
          
          <span class="text-2xl text-[#9ca3af]">VS</span>
          
          <div class="text-center">
            <p class="text-2xl font-bold" :class="versionB.score > versionA.score ? 'text-[#0f7b6f]' : 'text-[#6b6b6b]'">{{ versionB.score }}</p>
            <p class="text-xs text-[#6b6b6b]">版本 B</p>
          </div>
        </div>
      </div>

      <!-- 对比维度 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div
          v-for="metric in comparisonMetrics"
          :key="metric.name"
          class="p-3 bg-[#f7f6f3] rounded-lg"
        >
          <p class="text-xs text-[#6b6b6b] mb-1">{{ metric.name }}</p>
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium" :class="metric.a >= metric.b ? 'text-[#0f7b6f]' : 'text-[#6b6b6b]'">{{ metric.a }}</span>
            <span class="text-xs text-[#9ca3af]">vs</span>
            <span class="text-sm font-medium" :class="metric.b > metric.a ? 'text-[#0f7b6f]' : 'text-[#6b6b6b]'">{{ metric.b }}</span>
          </div>
          <!-- 进度条 -->
          <div class="mt-2 h-1.5 bg-[#e3e2e0] rounded-full overflow-hidden flex">
            <div 
              class="h-full bg-[#2383e2] transition-all"
              :style="{ width: `${(metric.a / (metric.a + metric.b)) * 100}%` }"
            />
            <div 
              class="h-full bg-[#0f7b6f] transition-all"
              :style="{ width: `${(metric.b / (metric.a + metric.b)) * 100}%` }"
            />
          </div>
        </div>
      </div>

      <!-- 输出对比 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-[#37352f]">版本 A 输出</p>
            <button
              type="button"
              @click="vote('a')"
              :class="['px-3 py-1 text-xs rounded-full transition-colors', winner === 'a' ? 'bg-[#0f7b6f] text-white' : 'bg-[#e3e2e0] text-[#6b6b6b] hover:bg-[#0f7b6f]/20']"
            >
              {{ winner === 'a' ? '✓ 更好' : '这个更好' }}
            </button>
          </div>          
          <div class="bg-[#f7f6f3] p-4 rounded-lg h-64 overflow-auto">
            <pre class="text-sm text-[#37352f] whitespace-pre-wrap">{{ versionA.output }}</pre>
          </div>
        </div>
        
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium text-[#37352f]">版本 B 输出</p>
            <button
              type="button"
              @click="vote('b')"
              :class="['px-3 py-1 text-xs rounded-full transition-colors', winner === 'b' ? 'bg-[#0f7b6f] text-white' : 'bg-[#e3e2e0] text-[#6b6b6b] hover:bg-[#0f7b6f]/20']"
            >
              {{ winner === 'b' ? '✓ 更好' : '这个更好' }}
            </button>
          </div>
          
          <div class="bg-[#f7f6f3] p-4 rounded-lg h-64 overflow-auto">
            <pre class="text-sm text-[#37352f] whitespace-pre-wrap">{{ versionB.output }}</pre>
          </div>
        </div>
      </div>

      <!-- 结论 -->
      <div v-if="winner" class="mt-4 p-4 rounded-lg text-center"
        :class="winner === 'draw' ? 'bg-[#dfab01]/10' : 'bg-[#0f7b6f]/10'"
      >
        <p class="font-medium"
          :class="winner === 'draw' ? 'text-[#dfab01]' : 'text-[#0f7b6f]'"
        >
          {{ winnerText }}
        </p>
        
        <button
          v-if="winner !== 'draw'"
          type="button"
          @click="saveWinner"
          class="mt-2 px-4 py-2 bg-[#2383e2] hover:bg-[#1a6fc2] text-white rounded-lg text-sm font-medium transition-colors"
        >
          保存为最佳版本
        </button>
      </div>
    </div>

    <!-- 测试历史 -->
    <div v-if="testHistory.length > 0" class="lab-card p-4">
      <h3 class="font-medium text-[#37352f] mb-4">📚 测试历史</h3>
      
      <div class="space-y-2">
        <div
          v-for="(record, index) in testHistory.slice(0, 5)"
          :key="index"
          class="flex items-center justify-between p-3 bg-[#f7f6f3] rounded-lg"
        >
          <div class="flex-1 min-w-0">
            <p class="text-sm text-[#37352f] truncate">测试 #{{ testHistory.length - index }}</p>
            <p class="text-xs text-[#6b6b6b]">{{ formatTime(record.timestamp) }}</p>
          </div>
          
          <div class="flex items-center gap-3">
            <span class="text-sm">{{ record.scoreA }} vs {{ record.scoreB }}</span>            
            <span 
              class="px-2 py-0.5 rounded text-xs"
              :class="record.winner === 'a' ? 'bg-[#2383e2]/10 text-[#2383e2]' : 'bg-[#0f7b6f]/10 text-[#0f7b6f]'"
            >
              {{ record.winner === 'a' ? 'A胜' : 'B胜' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToast } from '../composables/useToast'
import { useLocalStorage } from '../composables/useLocalStorage'

const toast = useToast()

const versionA = ref({ prompt: '', output: '', score: 0 })
const versionB = ref({ prompt: '', output: '', score: 0 })
const testInput = ref('')
const isTesting = ref(false)
const testResult = ref(false)
const winner = ref(null)
const testHistory = useLocalStorage('ab-test-history', [])

const canTest = computed(() => 
  versionA.value.prompt.trim() && 
  versionB.value.prompt.trim() && 
  testInput.value.trim()
)

const comparisonMetrics = ref([])

const winnerText = computed(() => {
  if (winner.value === 'draw') return '平局！两个版本表现相当'
  if (winner.value === 'a') return '版本 A 胜出！原始提示词更优'
  if (winner.value === 'b') return '版本 B 胜出！优化提示词更有效'
  return ''
})

// 自动加载从优化器传来的数据
const savedA = localStorage.getItem('ab-test-plan-a')
const savedB = localStorage.getItem('ab-test-plan-b')
if (savedA) versionA.value.prompt = savedA
if (savedB) versionB.value.prompt = savedB

async function runTest() {
  isTesting.value = true
  testResult.value = false
  winner.value = null
  
  // 模拟测试过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 生成模拟输出
  versionA.value.output = generateMockOutput(versionA.value.prompt, testInput.value)
  versionB.value.output = generateMockOutput(versionB.value.prompt, testInput.value)
  
  // 模拟评分
  versionA.value.score = Math.round(6 + Math.random() * 3)
  versionB.value.score = Math.round(6 + Math.random() * 3)
  
  // 确保有差异
  if (Math.abs(versionA.value.score - versionB.value.score) < 0.5) {
    versionB.value.score = Math.min(10, versionA.value.score + 1)
  }
  
  // 对比维度
  comparisonMetrics.value = [
    { name: '相关性', a: Math.round(7 + Math.random() * 2), b: Math.round(7 + Math.random() * 2) },
    { name: '完整性', a: Math.round(6 + Math.random() * 3), b: Math.round(7 + Math.random() * 2) },
    { name: '准确性', a: Math.round(6 + Math.random() * 3), b: Math.round(7 + Math.random() * 2) },
    { name: '可读性', a: Math.round(7 + Math.random() * 2), b: Math.round(6 + Math.random() * 3) }
  ]
  
  testResult.value = true
  isTesting.value = false
  
  toast.success('测试完成！请查看结果并投票')
}

function vote(choice) {
  winner.value = choice
  
  // 保存测试记录
  testHistory.value.unshift({
    timestamp: new Date().toISOString(),
    promptA: versionA.value.prompt.slice(0, 50) + '...',
    promptB: versionB.value.prompt.slice(0, 50) + '...',
    scoreA: versionA.value.score,
    scoreB: versionB.value.score,
    winner: choice
  })
  
  // 限制历史记录数量
  if (testHistory.value.length > 20) {
    testHistory.value = testHistory.value.slice(0, 20)
  }
}

function saveWinner() {
  const winningPrompt = winner.value === 'a' ? versionA.value.prompt : versionB.value.prompt
  localStorage.setItem('prompt-lab-original', winningPrompt)
  toast.success('最佳版本已保存！')
}

function generateMockOutput(prompt, input) {
  // 根据提示词长度生成模拟输出
  const length = prompt.length > 100 ? '详细' : '简洁'
  return `【模拟输出 - ${length}版本】

基于输入"${input.slice(0, 20)}..."的处理结果：

1. 分析阶段
   - 识别核心需求：${input.slice(0, 10)}...
   - 确定处理方式：${prompt.includes('步骤') ? '分步骤处理' : '直接生成'}

2. 生成内容
   ${prompt.includes('示例') ? '- 参考示例风格生成' : '- 基于指令生成'}
   ${prompt.includes('角色') ? '- 以指定角色视角输出' : '- 以助手视角输出'}

3. 输出结果
   这是一个模拟的输出结果，用于展示不同提示词版本的效果差异。
   在实际使用中，这里会显示 AI 的真实回复内容。

（注：这是 A/B 测试的模拟数据，非真实 AI 输出）`
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN') + ' ' + date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}
</script>
