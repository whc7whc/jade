// src/services/chatService.js
// SignalR 已移除，保留一組本地 stub API 以便不改動其他呼叫端
let listeners = new Map();

export function on(event, cb) {
  if (!listeners.has(event)) listeners.set(event, []);
  listeners.get(event).push(cb);
}

function emit(event, payload) {
  (listeners.get(event) || []).forEach(cb => cb(payload));
}

export async function connect(token) {
  // 之前透過 SignalR 連線，現改為立即回傳成功以保留行為
  return Promise.resolve(true);
}

export function joinDialog(otherUserId) {
  // stub: 模擬成功
  return Promise.resolve({ success: true, dialogId: otherUserId });
}

export function sendPrivateMessage(toUserId, content, type = 'text') {
  // 模擬接收回呼：在短延遲後從本地 event bus 發出 ReceiveMessage
  setTimeout(() => {
    emit('ReceiveMessage', { toUserId, content, type, time: new Date().toISOString() });
  }, 200);
  return Promise.resolve({ success: true });
}

export function markDialogRead(otherUserId) {
  return Promise.resolve({ success: true });
}

export function typing(otherUserId, isTyping) {
  // 模擬 Typing 事件
  emit('Typing', { otherUserId, isTyping });
  return Promise.resolve({ success: true });
}