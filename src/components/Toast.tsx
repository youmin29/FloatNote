import { useToastStore } from '../store/toastStore'

export default function Toast() {
  const message = useToastStore(s => s.message)

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[500]
        bg-gray-800/90 backdrop-blur-sm text-white text-xs font-medium
        px-4 py-2.5 rounded-2xl shadow-lg pointer-events-none
        transition-all duration-200
        ${message ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      {message}
    </div>
  )
}
