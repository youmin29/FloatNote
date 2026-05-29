import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNoteStore } from '../store/noteStore'
import { GripVertical, Trash2 } from 'lucide-react'
import type { ChecklistItem } from '../types'

interface Props {
  noteId: string
}

export default function OrderedBody({ noteId }: Props) {
  const { checklists, loadChecklist, addChecklistItem, updateChecklistText, deleteChecklistItem, reorderChecklist } = useNoteStore()
  const items = checklists[noteId] ?? []
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!checklists[noteId]) loadChecklist(noteId)
  }, [noteId])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, itemId: string, idx: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addChecklistItem(noteId, '')
      setTimeout(() => {
        const inputs = document.querySelectorAll<HTMLInputElement>(`[data-ordered="${noteId}"]`)
        inputs[idx + 1]?.focus()
      }, 50)
    }
    if (e.key === 'Backspace' && (e.target as HTMLInputElement).value === '') {
      e.preventDefault()
      deleteChecklistItem(noteId, itemId)
    }
  }

  const handleDragEnd = () => {
    if (dragIdx !== null && overIdx !== null && dragIdx !== overIdx) {
      const reordered = [...items]
      const [moved] = reordered.splice(dragIdx, 1)
      reordered.splice(overIdx, 0, moved)
      reorderChecklist(noteId, reordered as ChecklistItem[])
    }
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div className="p-3 space-y-1.5">
      {items.map((item, idx) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragIdx(idx)}
          onDragOver={e => { e.preventDefault(); setOverIdx(idx) }}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-2 group rounded-lg px-1 py-0.5 transition-all duration-150
            ${overIdx === idx && dragIdx !== idx ? 'bg-white/60 scale-[1.01]' : ''}`}
        >
          {/* Grip */}
          <div className="cursor-grab text-gray-200 group-hover:text-gray-300 flex-shrink-0 transition">
            <GripVertical size={13} />
          </div>

          {/* Number badge */}
          <span className="text-xs font-semibold text-gray-400 w-5 flex-shrink-0 text-right">{idx + 1}.</span>

          {/* Text */}
          <input
            data-ordered={noteId}
            value={item.text}
            onChange={e => updateChecklistText(noteId, item.id, e.target.value)}
            onKeyDown={e => handleKeyDown(e, item.id, idx)}
            className={`flex-1 min-w-0 bg-transparent text-sm outline-none text-gray-600
              ${idx === 0 ? 'font-semibold' : ''}`}
            placeholder={`${idx + 1}번 항목...`}
          />

          {/* Delete */}
          <button
            onClick={() => deleteChecklistItem(noteId, item.id)}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}

      <button
        onClick={() => addChecklistItem(noteId, '')}
        className="text-xs text-gray-300 hover:text-gray-400 transition mt-1 pl-6"
      >
        + 항목 추가
      </button>
    </div>
  )
}
