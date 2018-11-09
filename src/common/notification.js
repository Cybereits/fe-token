Notification.requestPermission().then(() => console.info('notification granted!'))

export function notify(title, body) {
  if (Notification.permission === 'granted') {
    const t = new Notification(title, { body, image: '/logo-cre.png', badge: '/logo-cre.png' })
    t.onclick = () => console.log('click')
  } else {
    console.warn('未开启桌面通知')
  }
}
