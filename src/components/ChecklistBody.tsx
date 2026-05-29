import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { useNoteStore } from '../store/noteStore'
import { Trash2 } from 'lucide-react'

interface Props {
  noteId: string
}

export default function ChecklistBody({ noteId }: Props) {
  const { checklists, loadChecklist, addChecklistItem, toggleChecklistItem, updateChecklistText, deleteChecklistItem } = useNoteStore()
  const items = checklists[noteId] ?? []
  const newItemRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!checklists[noteId]) loadChecklist(noteId)
  }, [noteId])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, itemId: string, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChecklistItem(noteId, '')
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>(`[data-checklist="${noteId}"]`)
        inputs[idx + 1]?.focus()
      }, 50)
    }
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '') {
      e.preventDefault()
      deleteChecklistItem(noteId, itemId)
    }
  }

  return (
    <div className="p-3 space-y-1.5">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-center gap-2 group">
          {/* Checkbox */}
          <button
            onClick={() => toggleChecklistItem(noteId, item.id)}
            className={`flex-shrink-0 w-4.5 h-4.5 rounded border-2 transition-all duration-150 animate-check
              ${item.checked
                ? 'bg-emerald-400 border-emerald-400'
                : 'border-gray-300 hover:border-gray-400 bg-transparent'}`}
            style={{ width: 18, height: 18 }}
          >
            {!!item.checked && (
              <svg viewBox="0 0 10 10" className="w-full h-full text-white fill-none stroke-current" strokeWidth="2">
                <polyline points="2,5 4,7.5 8,3" />
              </svg>
            )}
          </button>

          {/* Text with strikethrough */}
          <div className="relative flex-1 min-w-0">
            <input
              data-checklist={noteId}
              value={item.text}
              onChange={e => updateChecklistText(noteId, item.id, e.target.value)}
              onKeyDown={e => handleKeyDown(e, item.id, idx)}
              className={`w-full bg-transparent text-sm outline-none transition-all duration-200
                ${item.checked ? 'text-gray-300' : 'text-gray-600'}`}
              placeholder="항목 추가..."
            />
            {!!item.checked && (
              <div className="absolute top-1/2 left-0 h-px bg-gray-300 pointer-events-none animate-strike" style={{ transform: 'translateY(-50%)' }} />
            )}
          </div>

          {/* Delete */}
          <button
            onClick={() => deleteChecklistItem(noteId, item.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      {/* Add item */}
      <button
        onClick={() => addChecklistItem(noteId, '').then(() => setTimeout(() => newItemRef.current?.focus(), 50))}
        className="text-xs text-gray-300 hover:text-gray-400 transition mt-1 pl-0.5"
      >
        + 항목 추가
      </button>
    </div>
  )
}
