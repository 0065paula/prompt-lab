import { ref, readonly } from 'vue'

const toasts = ref([])

let toastId = 0

export function useToast() {
  function show(message, type = 'info', duration = 3000) {
    const id = ++toastId
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      remove(id)
    }, duration)
    
    return id
  }
  
  function success(message, duration) {
    return show(message, 'success', duration)
  }
  
  function error(message, duration) {
    return show(message, 'error', duration)
  }
  
  function warning(message, duration) {
    return show(message, 'warning', duration)
  }
  
  function remove(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  return {
    toasts: readonly(toasts),
    show,
    success,
    error,
    warning,
    remove
  }
}
