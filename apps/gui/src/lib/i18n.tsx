import React, { createContext, useContext, useState, useEffect } from 'react'

// Supported languages
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
  zh: '中文',
  pt: 'Português',
  ru: 'Русский',
  ar: 'العربية',
  hi: 'हिन्दी',
} as const

export type Language = keyof typeof SUPPORTED_LANGUAGES

// Translation keys and default English strings
interface Translations {
  // Navigation
  'nav.dashboard': string
  'nav.pipeline': string
  'nav.quality': string
  'nav.settings': string
  'nav.help': string

  // Actions
  'action.create': string
  'action.edit': string
  'action.delete': string
  'action.save': string
  'action.cancel': string
  'action.continue': string
  'action.back': string
  'action.next': string
  'action.finish': string
  'action.retry': string

  // Status
  'status.loading': string
  'status.error': string
  'status.success': string
  'status.warning': string
  'status.info': string
  'status.completed': string
  'status.failed': string
  'status.pending': string

  // Projects
  'project.title': string
  'project.description': string
  'project.create': string
  'project.new': string
  'project.duration': string
  'project.topic': string
  'project.level': string
  'project.progress': string

  // Pipeline
  'pipeline.planning': string
  'pipeline.scripting': string
  'pipeline.rendering': string
  'pipeline.assembling': string
  'pipeline.complete': string
  'pipeline.start': string
  'pipeline.stop': string
  'pipeline.reset': string

  // Quality
  'quality.analysis': string
  'quality.score': string
  'quality.issues': string
  'quality.metrics': string
  'quality.threshold': string

  // Errors
  'error.network': string
  'error.validation': string
  'error.permission': string
  'error.notFound': string
  'error.generic': string

  // Accessibility
  'a11y.skipToMain': string
  'a11y.openMenu': string
  'a11y.closeDialog': string
  'a11y.loading': string
  'a11y.required': string
}

const defaultTranslations: Translations = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.pipeline': 'Pipeline',
  'nav.quality': 'Quality Assurance',
  'nav.settings': 'Settings', 
  'nav.help': 'Help',

  // Actions
  'action.create': 'Create',
  'action.edit': 'Edit',
  'action.delete': 'Delete',
  'action.save': 'Save',
  'action.cancel': 'Cancel',
  'action.continue': 'Continue',
  'action.back': 'Back',
  'action.next': 'Next',
  'action.finish': 'Finish',
  'action.retry': 'Retry',

  // Status
  'status.loading': 'Loading...',
  'status.error': 'Error',
  'status.success': 'Success',
  'status.warning': 'Warning',
  'status.info': 'Info',
  'status.completed': 'Completed',
  'status.failed': 'Failed',
  'status.pending': 'Pending',

  // Projects
  'project.title': 'Project Title',
  'project.description': 'Description',
  'project.create': 'Create New Physics Video Project',
  'project.new': 'New Project',
  'project.duration': 'Duration (seconds)',
  'project.topic': 'Physics Topic',
  'project.level': 'Difficulty Level',
  'project.progress': 'Progress',

  // Pipeline
  'pipeline.planning': 'Planning',
  'pipeline.scripting': 'Scripting', 
  'pipeline.rendering': 'Rendering',
  'pipeline.assembling': 'Assembling',
  'pipeline.complete': 'Complete',
  'pipeline.start': 'Start Pipeline',
  'pipeline.stop': 'Stop',
  'pipeline.reset': 'Reset',

  // Quality
  'quality.analysis': 'Quality Analysis',
  'quality.score': 'Quality Score',
  'quality.issues': 'Issues',
  'quality.metrics': 'Metrics',
  'quality.threshold': 'Threshold',

  // Errors
  'error.network': 'Network connection error. Please check your internet connection.',
  'error.validation': 'Please check your input and try again.',
  'error.permission': 'You do not have permission to perform this action.',
  'error.notFound': 'The requested resource was not found.',
  'error.generic': 'An unexpected error occurred. Please try again.',

  // Accessibility
  'a11y.skipToMain': 'Skip to main content',
  'a11y.openMenu': 'Open menu',
  'a11y.closeDialog': 'Close dialog',
  'a11y.loading': 'Loading, please wait',
  'a11y.required': 'Required field',
}

// Translation data - in a real app, these would be loaded dynamically
const translations: Record<Language, Partial<Translations>> = {
  en: defaultTranslations,
  es: {
    'nav.dashboard': 'Panel de Control',
    'nav.pipeline': 'Tubería',
    'nav.quality': 'Aseguramiento de Calidad',
    'nav.settings': 'Configuración',
    'nav.help': 'Ayuda',
    'action.create': 'Crear',
    'action.edit': 'Editar',
    'action.delete': 'Eliminar',
    'action.save': 'Guardar',
    'action.cancel': 'Cancelar',
    'project.create': 'Crear Nuevo Proyecto de Video de Física',
    'project.new': 'Nuevo Proyecto',
    'status.loading': 'Cargando...',
    // ... more Spanish translations
  },
  fr: {
    'nav.dashboard': 'Tableau de Bord',
    'nav.pipeline': 'Pipeline',
    'nav.quality': 'Assurance Qualité', 
    'nav.settings': 'Paramètres',
    'nav.help': 'Aide',
    'action.create': 'Créer',
    'action.edit': 'Modifier',
    'project.create': 'Créer un Nouveau Projet Vidéo de Physique',
    'status.loading': 'Chargement...',
    // ... more French translations
  },
  de: {
    'nav.dashboard': 'Dashboard',
    'nav.pipeline': 'Pipeline',
    'nav.quality': 'Qualitätssicherung',
    'nav.settings': 'Einstellungen',
    'nav.help': 'Hilfe',
    'project.create': 'Neues Physik-Video-Projekt Erstellen',
    'status.loading': 'Wird geladen...',
    // ... more German translations
  },
  ja: {
    'nav.dashboard': 'ダッシュボード',
    'nav.pipeline': 'パイプライン',
    'nav.quality': '品質保証',
    'nav.settings': '設定',
    'nav.help': 'ヘルプ',
    'project.create': '新しい物理動画プロジェクトを作成',
    'status.loading': '読み込み中...',
    // ... more Japanese translations
  },
  zh: {
    'nav.dashboard': '仪表板',
    'nav.pipeline': '管道',
    'nav.quality': '质量保证',
    'nav.settings': '设置',
    'nav.help': '帮助',
    'project.create': '创建新的物理视频项目',
    'status.loading': '加载中...',
    // ... more Chinese translations
  },
  pt: {
    'nav.dashboard': 'Painel',
    'nav.pipeline': 'Pipeline',
    'nav.quality': 'Garantia de Qualidade',
    'project.create': 'Criar Novo Projeto de Vídeo de Física',
    'status.loading': 'Carregando...',
    // ... more Portuguese translations
  },
  ru: {
    'nav.dashboard': 'Панель управления',
    'nav.pipeline': 'Конвейер',
    'nav.quality': 'Контроль качества',
    'project.create': 'Создать новый проект физического видео',
    'status.loading': 'Загрузка...',
    // ... more Russian translations
  },
  ar: {
    'nav.dashboard': 'لوحة التحكم',
    'nav.pipeline': 'خط الأنابيب',
    'nav.quality': 'ضمان الجودة',
    'project.create': 'إنشاء مشروع فيديو فيزياء جديد',
    'status.loading': 'جار التحميل...',
    // ... more Arabic translations
  },
  hi: {
    'nav.dashboard': 'डैशबोर्ड',
    'nav.pipeline': 'पाइपलाइन',
    'nav.quality': 'गुणवत्ता आश्वासन',
    'project.create': 'नई भौतिकी वीडियो परियोजना बनाएं',
    'status.loading': 'लोड हो रहा है...',
    // ... more Hindi translations
  },
}

// Internationalization context
interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof Translations, fallback?: string) => string
  formatNumber: (num: number) => string
  formatDate: (date: Date) => string
  formatRelativeTime: (date: Date) => string
  isRTL: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

// Language provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Check localStorage first
    const saved = localStorage.getItem('physics-foundry-language')
    if (saved && saved in SUPPORTED_LANGUAGES) {
      return saved as Language
    }

    // Detect browser language
    const browserLang = navigator.language.split('-')[0] as Language
    if (browserLang in SUPPORTED_LANGUAGES) {
      return browserLang
    }

    return 'en'
  })

  // Save language preference
  useEffect(() => {
    localStorage.setItem('physics-foundry-language', language)
    document.documentElement.lang = language
    
    // Set dir attribute for RTL languages
    const rtlLanguages: Language[] = ['ar']
    document.documentElement.dir = rtlLanguages.includes(language) ? 'rtl' : 'ltr'
  }, [language])

  const t = (key: keyof Translations, fallback?: string): string => {
    const languageTranslations = translations[language]
    return languageTranslations?.[key] || defaultTranslations[key] || fallback || key
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat(language).format(num)
  }

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const formatRelativeTime = (date: Date): string => {
    const rtf = new Intl.RelativeTimeFormat(language, { numeric: 'auto' })
    const diffInSeconds = (date.getTime() - Date.now()) / 1000
    
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(Math.round(diffInSeconds), 'second')
    } else if (Math.abs(diffInSeconds) < 3600) {
      return rtf.format(Math.round(diffInSeconds / 60), 'minute')
    } else if (Math.abs(diffInSeconds) < 86400) {
      return rtf.format(Math.round(diffInSeconds / 3600), 'hour')
    } else {
      return rtf.format(Math.round(diffInSeconds / 86400), 'day')
    }
  }

  const isRTL = ['ar'].includes(language)

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatNumber,
        formatDate,
        formatRelativeTime,
        isRTL,
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

// Hook to use internationalization
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Language selector component
export function LanguageSelector() {
  const { language, setLanguage } = useI18n()

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as Language)}
      className="rounded border px-3 py-1 text-sm"
      aria-label="Select language"
    >
      {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
        <option key={code} value={code}>
          {name}
        </option>
      ))}
    </select>
  )
}