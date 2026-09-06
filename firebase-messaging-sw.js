/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js')

/**
 * Development Configuration
 */

// firebase.initializeApp({
//   apiKey: 'AIzaSyBp9myCoK_SV4Y3sirL0gRsNn4cCr8OdI4',
//   authDomain: 'task-12f91.firebaseapp.com',
//   projectId: 'task-12f91',
//   messagingSenderId: '105465786949',
//   appId: '1:105465786949:web:8cb198764688f285ffa92c',
// })

/**
 * Production Configuration
 */

firebase.initializeApp({
  apiKey: 'AIzaSyDy4iA6HWWSfkcHzHZHnaqIxpakq9rZ9FU',
  authDomain: 'intime-prod.firebaseapp.com',
  projectId: 'intime-prod',
  messagingSenderId: '577842551018',
  appId: '1:577842551018:web:deb7a4e4f28403cc2f1f93',
})

const messaging = firebase.messaging()

// 🔔 Background Notification
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)

  const notificationTitle = payload.data?.title || 'New Notification'

  const notificationOptions = {
    body: payload.data?.body || '',
    icon: '/icons/logo.png',
    data: payload.data || {},
    requireInteraction: false,
  }

  self.registration
    .showNotification(notificationTitle, notificationOptions)
    .then(() => console.log('✅ Notification shown'))
    .catch((err) => console.error('❌ Notification error:', err))

  // 🔊 TRY PLAY SOUND (may not always work)
  // self.registration.getNotifications().then(() => {
  //   const audio = new Audio('/sounds/notification_sound.mp3') //notification_sound.mp3 must be present at /inTIME\public\sound
  //   audio.play().catch(() => {})
  // })
})

// 🔁 Click handling
self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  const data = event.notification.data || {}

  const finalUrl = buildNotificationPath(data)

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(finalUrl)
          return client.focus()
        }
      }
      return clients.openWindow(finalUrl)
    }),
  )
})

function buildNotificationPath(data = {}) {
  let path = `/community/${data.communityId || ''}`

  if (data.type === 'MENTION' || data.type === 'COMMENT' || data.type === 'TASK_ASSIGNED') {
    path += `/task/${data.entityId || ''}`
  } else if (data.type === 'COMMUNITY_ADDED') {
    path += `/users`
  }

  // 🔥 Build query params dynamically
  const queryParams = new URLSearchParams()

  if (data.commentId && data.commentId !== 'undefined' && data.commentId !== undefined) {
    queryParams.append('commentId', data.commentId)
  }

  if (
    data.notificationId &&
    data.notificationId !== 'undefined' &&
    data.notificationId !== undefined
  ) {
    queryParams.append('notificationId', data.notificationId)
  }

  if (data.uid && data.uid !== 'undefined' && data.uid !== undefined) {
    queryParams.append('uid', data.uid)
  }

  // ✅ Append query string if exists
  const queryString = queryParams.toString()

  return queryString ? `${path}?${queryString}` : path
}
