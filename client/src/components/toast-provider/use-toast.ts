import { useCallback } from 'react'
import { toast } from 'sonner'

export function useToast() {
  const showToast = useCallback(({ title, message, variant = 'info', durationMs }: ShowToastPayload) => {
    const options = {
      description: message,
      duration: durationMs,
      className: `app-toast app-toast--${variant}`,
    }
    toast(title, options)
  }, [])

  return { showToast }
}

type ShowToastPayload = {
  title: string;
  message?: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
  durationMs?: number;
}
