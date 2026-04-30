import { Toaster } from 'sonner'
import './toast-provider.scss'

export function ToastProvider() {
  return (
    <Toaster
      theme='dark'
      position='bottom-right'
      visibleToasts={3}
      expand={false}
      offset={40}
      richColors={false}
      toastOptions={{
        classNames: {
          toast: 'app-toast',
          title: 'app-toast__title',
          description: 'app-toast__description',
        },
      }}
    />
  )
}
