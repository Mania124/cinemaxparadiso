import { useCallback } from 'react'

export const useNotification = () => {
  const showNotification = useCallback((message, type = 'info') => {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = `notification notification-${type}`
    notification.textContent = message

    // Add to page
    document.body.appendChild(notification)

    // Remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 3000)
  }, [])

  return {
    showNotification
  }
}
