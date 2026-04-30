import type { zh } from './zh'

export const en = {
  // SidebarHeader
  'sidebar.title': 'AI Coding Assistant',
  'sidebar.subtitle': 'Frontend Expert',
  // Sidebar
  'sidebar.newChat': 'New Chat',
  'sidebar.empty': 'No conversations',
  'sidebar.untitled': 'New conversation',
  // ChatHeader
  'header.title': 'AI Coding Assistant',
  'header.subtitle': 'Frontend Expert · mock mode',
  'header.toDark': 'Switch to dark mode',
  'header.toLight': 'Switch to light mode',
  'header.switchLang': '切换为中文',
  'header.openSidebar': 'Open sidebar',
  // MessageList
  'message.regenerate': 'Regenerate',
  'message.copy': 'Copy',
  'message.copied': 'Copied',
  'message.copyCode': 'Copy code',
  'message.error': 'Sorry, an error occurred. Please try again.',
  'message.ragPrefix': 'Retrieved relevant knowledge: ',
  // InputArea
  'input.placeholder': 'Ask a coding question... Enter to send, Shift+Enter for newline',
  'input.send': 'Send',
  'input.stop': 'Stop',
  'input.disclaimer':
    'AI Coding Assistant provides programming-related answers for reference only.',
  'input.hintEnter': 'Enter',
  'input.hintShift': 'Shift',
  'input.hintNewline': 'newline',
  'input.hintSend': 'send',
  'input.overLimit': 'Input exceeds {max} character limit',
  'input.uploadImage': 'Upload image',
  'input.removeImage': 'Remove image',
  'input.imageTypeError': 'Only {types} formats are supported',
  'input.imageSizeError': 'Each image must not exceed {maxSize}MB',
  'input.imageMaxError': 'Maximum {max} images allowed',
  // EmptyState
  'empty.eyebrow': 'POWERED BY AI',
  'empty.title': 'Hi, how can I help you today?',
  'empty.desc':
    'Specialized in frontend development — React, Vue, TypeScript, Webpack and more.\nAnswers cover both design thinking and code implementation.',
  'empty.s0Title': 'React Hooks',
  'empty.s0Desc': 'What are the common Hooks and how to use them?',
  'empty.s1Title': 'Architecture',
  'empty.s1Desc': 'How to configure Webpack for code splitting?',
  'empty.s2Title': 'TypeScript',
  'empty.s2Desc': 'How to use generics in practice?',
  'empty.s3Title': 'CSS Layout',
  'empty.s3Desc': 'Flexbox vs. Grid — what is the difference?',
  // Session
  'session.confirmDelete': 'Confirm delete?',
  'session.deleteConfirm': 'Confirm',
  'session.deleteCancel': 'Cancel',
  'sidebar.search': 'Search conversations...',
  'sidebar.searchEmpty': 'No matching conversations',
  'sidebar.groupToday': 'Today',
  'sidebar.groupYesterday': 'Yesterday',
  'sidebar.groupEarlier': 'Earlier',
  'sidebar.footerTitle': 'Local Account',
  'sidebar.footerSubtitle': 'Workspace · Local',
  'sidebar.viewSource': 'View Source',
  'model.switch': 'Switch model',
  'model.selectTitle': 'Select model',
  'model.loading': 'Loading...',
  // Local mode
  'message.offlineMode': 'Model unavailable, switched to local mode',
  'header.offlineMode': 'Local Mode (Model Unavailable)',
  'message.onlineRestored': 'Model restored, switched back to online mode',
  // Error bubble
  'message.errorDefault': 'Request failed, please retry',
  'message.retry': 'Retry',
  // Tweaks Panel
  'tweaks.title': 'Tweaks',
  'tweaks.brandHue': 'Brand Hue',
  'tweaks.darkMode': 'Dark Mode',
  'tweaks.bgDecor': 'Background Decor',
  'tweaks.collapse': 'Collapse',
  'tweaks.open': 'Open Tweaks',
  'tweaks.toDark': 'Switch to dark mode',
  'tweaks.toLight': 'Switch to light mode',
  'tweaks.hideBg': 'Hide background decoration',
  'tweaks.showBg': 'Show background decoration',
  // Local mode reply
  'localMode.reply': 'The model/network is currently unavailable, please try again later.',
  // Error fallback
  'fallback.title': 'Something went wrong',
  'fallback.desc': 'Please refresh the page and try again',
  'fallback.reload': 'Refresh',
} satisfies Record<keyof typeof zh, string>
