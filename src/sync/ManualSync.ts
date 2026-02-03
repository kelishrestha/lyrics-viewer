let startTime = 0
let offset = 0

export function startSync() {
  console.log('▶ Starting sync...')
  startTime = performance.now()
  localStorage.setItem('startTime', startTime.toString());
}

export function adjust(ms: number) {
  offset += ms
}

export function getTime() {
  startTime = Number(localStorage.getItem('startTime')) || 0
  offset = Number(localStorage.getItem('offset')) || 0
  if (!startTime) return 0
  return performance.now() - startTime + offset
}

export function resetSync() {
  startTime = 0
  offset = 0
}
