import { useRef, useState, useCallback, useEffect } from 'react'
import { Pin, X, Copy, Archive, List, CheckSquare, AlignLeft, ChevronDown } from 'lucide-react'
import type { Note, NoteColor, NoteMode, NoteCategory } from '../types'
import { useNoteStore } from '../store/noteStore'
import ChecklistBody from './ChecklistBody'
import OrderedBody from './OrderedBody'

const COLOR_STYLES: Record<NoteColor, { bg: string; header: string; border: string; accent: string }> = {
  yellow: { bg: 'bg-pastel-yellow', header: 'bg-amber-100', border: 'border-amber-200', accent: 'text-amber-600' },
  pink:   { bg: 'bg-pastel-pink',   header: 'bg-rose-100',   border: 'border-rose-200',   accent: 'text-rose-500' },
  lavender:{ bg: 'bg-pastel-lavender', header: 'bg-purple-100', border: 'border-purple-200', accent: 'text-purple-500' },
  mint:   { bg: 'bg-pastel-mint',   header: 'bg-emerald-100', border: 'border-emerald-200', accent: 'text-emerald-600' },
  blue:   { bg: 'bg-pastel-blue',   header: 'bg-sky-100',    border: 'border-sky-200',    accent: 'text-sky-500' },
  peach:  { bg: 'bg-pastel-peach',  header: 'bg-orange-100', border: 'border-orange-200', accent: 'text-orange-500' },
}

const MODE_ICONS = {
  text: AlignLeft,
  checklist: CheckSquare,
  ordered: List,
}

const CATEGORY_LABELS: Record<NoteCategory, string> = {
  personal: '개인',
  work: '업무',
  idea: '아이디어',
}

interface Props {
  note: Note
}

export default function NoteCard({ note }: Props) {
  const { updateNote, deleteNote, archiveNote, togglePin, duplicateNote, setActiveNote, activeNoteId, loadChecklist } = useNoteStore()
  const isActive = activeNoteId === note.id
  const cs = COLOR_STYLES[note.color]

  const cardRef = useRef<HTMLDivElement>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [titleValue, setTitleValue] = useState(note.title)

  useEffect(() => { setTitleValue(note.title) }, [note.title])

  // Switch to checklist/ordered: load items
  const handleModeChange = async (mode: NoteMode) => {
    setShowModeMenu(false)
    await updateNote(note.id, { mode })
    if (mode !== 'text') loadChecklist(note.id)
  }

  // Drag
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return
    e.preventDefault()
    setActiveNote(note.id)
    isDragging.current = true
    dragOffset.current = { x: e.clientX - note.x, y: e.clientY - note.y }

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      updateNote(note.id, { x: ev.clientX - dragOffset.current.x, y: ev.clientY - dragOffset.current.y })
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [note.id, note.x, note.y, updateNote, setActiveNote])

  // Resize (bottom-right handle)
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX, startY = e.clientY
    const startW = note.width, startH = note.height

    const onMove = (ev: MouseEvent) => {
      updateNote(note.id, {
        width: Math.max(220, startW + ev.clientX - startX),
        height: Math.max(240, startH + ev.clientY - startY),
      })
    }
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [note.id, note.width, note.height, updateNote])

  const handleDelete = () => {
    setIsDeleting(true)
    setTimeout(() => deleteNote(note.id), 200)
  }

  const ModeIcon = MODE_ICONS[note.mode]

  return (
    <div
      ref={cardRef}
      className={`absolute select-none rounded-2xl border ${cs.border} ${cs.bg}
        ${isDeleting ? 'animate-pop-out' : 'animate-pop-in'}
        ${note.pinned ? 'shadow-note-pinned' : isActive ? 'shadow-note-hover' : 'shadow-note'}
        transition-shadow duration-150`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        zIndex: note.pinned ? 100 : isActive ? 50 : 10,
      }}
      onMouseDown={onMouseDown}
      onClick={() => setActiveNote(note.id)}
    >
      {/* Header */}
      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl ${cs.header} border-b ${cs.border} cursor-grab active:cursor-grabbing`}>
        {/* Pin */}
        <button
          data-no-drag
          onClick={() => togglePin(note.id)}
          className={`p-1 rounded-lg hover:bg-white/50 transition-all ${note.pinned ? `animate-bounce-pin ${cs.accent}` : 'text-gray-400'}`}
        >
          <Pin size={13} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>

        {/* Title */}
        <input
          data-no-drag
          value={titleValue}
          onChange={e => setTitleValue(e.target.value)}
          onBlur={() => updateNote(note.id, { title: titleValue })}
          placeholder="제목 없음"
          className={`flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-600 placeholder-gray-300 outline-none truncate`}
        />

        {/* Category selector */}
        <div className="relative" data-no-drag>
          <button
            onClick={() => { setShowCategoryMenu(v => !v); setShowModeMenu(false) }}
            className="flex items-center gap-0.5 p-1 rounded-lg hover:bg-white/50 transition text-gray-400"
          >
            <span className="text-[10px] font-medium">{CATEGORY_LABELS[note.category]}</span>
            <ChevronDown size={10} />
          </button>
          {showCategoryMenu && (
            <div className="absolute left-0 top-7 z-50 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-xs w-24">
              {(['personal', 'work', 'idea'] as NoteCategory[]).map(cat => (
                <button key={cat}
                  onClick={() => { updateNote(note.id, { category: cat }); setShowCategoryMenu(false) }}
                  className={`w-full px-3 py-2 text-left hover:bg-gray-50 ${note.category === cat ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode switcher */}
        <div className="relative" data-no-drag>
          <button
            onClick={() => { setShowModeMenu(v => !v); setShowCategoryMenu(false) }}
            className={`flex items-center gap-0.5 p-1 rounded-lg hover:bg-white/50 transition ${cs.accent}`}
          >
            <ModeIcon size={13} />
            <ChevronDown size={10} />
          </button>
          {showModeMenu && (
            <div className="absolute right-0 top-7 z-50 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-xs w-32">
              {(['text', 'checklist', 'ordered'] as NoteMode[]).map(m => {
                const Icon = MODE_ICONS[m]
                const label = m === 'text' ? '텍스트' : m === 'checklist' ? '체크리스트' : '순서 리스트'
                return (
                  <button key={m} onClick={() => handleModeChange(m)}
                    className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 ${note.mode === m ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    <Icon size={12} /> {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Duplicate */}
        <button data-no-drag onClick={() => duplicateNote(note.id)} className="p-1 rounded-lg hover:bg-white/50 text-gray-400 transition">
          <Copy size={13} />
        </button>

        {/* Archive */}
        <button data-no-drag onClick={() => archiveNote(note.id)} className="p-1 rounded-lg hover:bg-white/50 text-gray-400 transition">
          <Archive size={13} />
        </button>

        {/* Delete */}
        <button data-no-drag onClick={handleDelete} className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-400 transition">
          <X size={13} />
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto overflow-x-hidden" style={{ height: note.height - 44 }} data-no-drag>
        {note.mode === 'text' && (
          <textarea
            ref={el => {
              // 마운트 & 내용 변경 시 높이 맞추기
              if (!el) return
              el.style.height = 'auto'
              el.style.height = Math.max(el.scrollHeight, note.height - 44) + 'px'
            }}
            value={note.content}
            onChange={e => {
              updateNote(note.id, { content: e.target.value })
              e.target.style.height = 'auto'
              e.target.style.height = Math.max(e.target.scrollHeight, note.height - 44) + 'px'
            }}
            placeholder="여기에 메모를 입력하세요..."
            className="w-full resize-none bg-transparent p-3 text-sm text-gray-600 placeholder-gray-300 outline-none leading-relaxed overflow-hidden block"
          />
        )}
        {note.mode === 'checklist' && <ChecklistBody noteId={note.id} />}
        {note.mode === 'ordered' && <OrderedBody noteId={note.id} />}
      </div>

      {/* Resize handle */}
      <div
        onMouseDown={onResizeMouseDown}
        className="absolute bottom-1 right-1 w-4 h-4 cursor-se-resize opacity-30 hover:opacity-70 transition-opacity"
        style={{ touchAction: 'none' }}
      >
        <svg viewBox="0 0 8 8" className="w-full h-full text-gray-500 fill-current">
          <circle cx="6" cy="6" r="1.2" />
          <circle cx="3.5" cy="6" r="1.2" />
          <circle cx="6" cy="3.5" r="1.2" />
        </svg>
      </div>

      {/* Timestamp */}
      <div className="absolute bottom-2 left-3 text-gray-300 text-[9px] pointer-events-none">
        {note.updated_at ? new Date(note.updated_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
      </div>
    </div>
  )
}
