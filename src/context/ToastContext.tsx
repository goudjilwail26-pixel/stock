import React, { createContext, useContext, useState, useCallback } from 'react'
import { cn } from '../lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

let nextId = 1

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = nextId++
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 max-w-sm">
        {toasts.map(t => (
          <div
            key={t.id}
            className={cn(
              'px-5 py-3 text-sm font-medium shadow-lg border animate-[slideIn_0.3s_ease]',
              t.type === 'success' && 'bg-stokiloo-emerald/90 text-white border-stokiloo-emerald',
              t.type === 'error' && 'bg-stokiloo-rose/90 text-white border-stokiloo-rose',
              t.type === 'info' && 'bg-stokiloo-dim/95 text-stokiloo-white border-stokiloo-border backdrop-blur-sm',
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
