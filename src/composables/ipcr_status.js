// src/composables/ipcr_status.js

export function useIPCRStatus() {
  const getStatusColor = (status) => {
    if (!status) return 'grey'

    const s = String(status).toLowerCase().trim()

    switch (s) {
      case 'draft':
        return 'grey-6'

      case 'discussed target':
        return 'blue-6'

      case 'approved target':
      case 'approved accomplishment':
        return 'cyan-7'

      case 'received target':
      case 'received accomplishment':
        return 'indigo-6'

      case 'returned target':
      case 'returned accomplishment':
        return 'red-6'

      case 'reviewed target':
      case 'reviewed accomplishment':
        return 'purple-6'

      case 'calibrated/validated target':
      case 'calibrated/validated accomplishment':
        return 'green-7'

      default:
        // Fallback for any other statuses
        if (s.includes('approved')) return 'positive'
        if (s.includes('draft')) return 'info'
        if (s.includes('pending')) return 'warning'
        if (s.includes('for approval')) return 'warning'
        if (s.includes('review')) return 'purple'
        if (s.includes('rejected')) return 'negative'
        if (s.includes('returned')) return 'negative'
        if (s.includes('cancelled')) return 'grey-7'
        if (s.includes('completed')) return 'teal'
        return 'grey'
    }
  }

  const getStatusTextColor = (status) => {
    if (!status) return 'black'

    const s = String(status).toLowerCase().trim()
    const color = getStatusColor(status)

    // For dark backgrounds, use white text
    const darkStatuses = ['grey-6', 'blue-6', 'cyan-7', 'indigo-6', 'red-6', 'purple-6', 'green-7']

    if (darkStatuses.includes(color)) {
      return 'white'
    }

    // Check for other dark colors
    if (s.includes('approved')) return 'white'
    if (s.includes('draft')) return 'white'
    if (s.includes('review')) return 'white'
    if (s.includes('rejected')) return 'white'
    if (s.includes('returned')) return 'white'
    if (s.includes('cancelled')) return 'white'
    if (s.includes('completed')) return 'white'

    return 'black'
  }

  const getStatusIcon = (status) => {
    if (!status) return 'help_outline'

    const s = String(status).toLowerCase().trim()

    switch (s) {
      case 'draft':
        return 'edit_note'
      case 'discussed target':
        return 'chat'
      case 'approved target':
      case 'approved accomplishment':
        return 'check_circle'
      case 'received target':
      case 'received accomplishment':
        return 'inbox'
      case 'returned target':
      case 'returned accomplishment':
        return 'undo'
      case 'reviewed target':
      case 'reviewed accomplishment':
        return 'rate_review'
      case 'calibrated/validated target':
      case 'calibrated/validated accomplishment':
        return 'verified'
      default:
        // Fallback for any other statuses
        if (s.includes('approved')) return 'check_circle'
        if (s.includes('draft')) return 'edit_note'
        if (s.includes('pending')) return 'hourglass_empty'
        if (s.includes('for approval')) return 'hourglass_empty'
        if (s.includes('review')) return 'rate_review'
        if (s.includes('rejected')) return 'cancel'
        if (s.includes('returned')) return 'undo'
        if (s.includes('cancelled')) return 'block'
        if (s.includes('completed')) return 'task_alt'
        return 'help_outline'
    }
  }

  return {
    getStatusColor,
    getStatusTextColor,
    getStatusIcon,
  }
}
