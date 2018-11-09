Notification.requestPermission().then(() => console.info('notification granted!'))

export function notify(title, body, { onclick, url, requireInteraction = false } = {}) {
  if (Notification.permission === 'granted') {
    const t = new Notification(title, { body, icon: '/logo-cre.png', tag: Date.now(), requireInteraction })
    if (onclick) {
      t.onclick = onclick
    } else if (url) {
      t.onclick = () => window.open(url, '_blank')
    }
  } else {
    console.warn('未开启桌面通知')
  }
}
