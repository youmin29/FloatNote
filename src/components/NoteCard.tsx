import { useRef, useState, useCallback, useEffect } from 'react'
import { Pin, X, Copy, Archive, List, CheckSquare, AlignLeft, ChevronDown } from 'lucide-react'
import type { Note, NoteColor, NoteCategory, BlockType } from '../types'
import { useNoteStore } from '../store/noteStore'
import ColorPicker from './ColorPicker'
import NoteEditor from './NoteEditor'
import type { NoteEditorHandle } from './NoteEditor'

const COLOR_STYLES: Record<NoteColor, { bg: string; header: string; border: string; accent: string }> = {
  yellow:   { bg: 'bg-pastel-yellow',   header: 'bg-amber-100',  border: 'border-amber-200',  accent: 'text-amber-600' },
  pink:     { bg: 'bg-pastel-pink',     header: 'bg-rose-100',   border: 'border-rose-200',   accent: 'text-rose-500' },
  lavender: { bg: 'bg-pastel-lavender', header: 'bg-purple-100', border: 'border-purple-200', accent: 'text-purple-500' },
  mint:     { bg: 'bg-pastel-mint',     header: 'bg-emerald-100',border: 'border-emerald-200',accent: 'text-emerald-600' },
  blue:     { bg: 'bg-pastel-blue',     header: 'bg-sky-100',    border: 'border-sky-200',    accent: 'text-sky-500' },
  peach:    { bg: 'bg-pastel-peach',    header: 'bg-orange-100', border: 'border-orange-200', accent: 'text-orange-500' },
}

const COLOR_BG: Record<NoteColor, string> = {
  yellow: '#FFF8C8', pink: '#FFD6E0', lavender: '#E8D5F5',
  mint: '#C8F0E8', blue: '#C8E4F8', peach: '#FFE5CC',
}

const BLOCK_ICONS: Record<BlockType, typeof AlignLeft> = {
  text: AlignLeft,
  check: CheckSquare,
  ordered: List,
}

const BLOCK_LABELS: Record<BlockType, string> = {
  text: '텍스트',
  check: '체크리스트',
  ordered: '순서 리스트',
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
  const { updateNote, deleteNote, archiveNote, togglePin, duplicateNote, setActiveNote, activeNoteId } = useNoteStore()
  const isActive = activeNoteId === note.id
  const cs = COLOR_STYLES[note.color]

  const cardRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<NoteEditorHandle>(null)
  const dragOffset = useRef({ x: 0, y: 0 })
  const isDragging = useRef(false)

  const [isDeleting, setIsDeleting] = useState(false)
  const [showFormatMenu, setShowFormatMenu] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [focusedBlockType, setFocusedBlockType] = useState<BlockType>('text')
  const [titleValue, setTitleValue] = useState(note.title)

  useEffect(() => { setTitleValue(note.title) }, [note.title])

  const closeAllMenus = () => {
    setShowFormatMenu(false)
    setShowCategoryMenu(false)
    setShowColorPicker(false)
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

  // Resize
  const onResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX, startY = e.clientY
    const startW = note.width, startH = note.height
    const onMove = (ev: MouseEvent) => {
      updateNote(note.id, {
        width: Math.max(220, startW + ev.clientX - startX),
        height: Math.max(200, startH + ev.clientY - startY),
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

  const FormatIcon = BLOCK_ICONS[focusedBlockType]

  return (
    <div
      ref={cardRef}
      className={`absolute select-none rounded-2xl border ${cs.border} ${cs.bg} overflow-hidden
        ${isDeleting ? 'animate-pop-out' : 'animate-pop-in'}
        ${note.pinned ? 'shadow-note-pinned' : isActive ? 'shadow-note-hover' : 'shadow-note'}
        transition-shadow duration-150`}
      style={{
        left: note.x, top: note.y,
        width: note.width, height: note.height,
        zIndex: note.pinned ? 100 : isActive ? 50 : 10,
      }}
      onMouseDown={onMouseDown}
      onClick={() => setActiveNote(note.id)}
    >
      {/* Header */}
      <div className={`flex items-center gap-1.5 px-3 py-2 rounded-t-2xl ${cs.header} border-b ${cs.border} cursor-grab active:cursor-grabbing`}>

        {/* 색상 변경 */}
        <div className="relative" data-no-drag>
          <button
            onClick={() => { setShowColorPicker(v => !v); setShowFormatMenu(false); setShowCategoryMenu(false) }}
            className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${cs.border}`}
            style={{ background: COLOR_BG[note.color] }}
          />
          {showColorPicker && (
            <ColorPicker noteId={note.id} currentColor={note.color} onClose={() => setShowColorPicker(false)} />
          )}
        </div>

        {/* 핀 */}
        <button
          data-no-drag
          onClick={() => togglePin(note.id)}
          className={`p-1 rounded-lg hover:bg-white/50 transition-all ${note.pinned ? `animate-bounce-pin ${cs.accent}` : 'text-gray-400'}`}
        >
          <Pin size={13} fill={note.pinned ? 'currentColor' : 'none'} />
        </button>

        {/* 제목 */}
        <input
          data-no-drag
          value={titleValue}
          onChange={e => setTitleValue(e.target.value)}
          onBlur={() => updateNote(note.id, { title: titleValue })}
          placeholder="제목 없음"
          className="flex-1 min-w-0 bg-transparent text-sm font-semibold text-gray-600 placeholder-gray-300 outline-none truncate"
        />

        {/* 카테고리 */}
        <div className="relative" data-no-drag>
          <button
            onClick={() => { setShowCategoryMenu(v => !v); setShowFormatMenu(false); setShowColorPicker(false) }}
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

        {/* 줄 서식 */}
        <div className="relative" data-no-drag>
          <button
            onClick={() => { setShowFormatMenu(v => !v); setShowCategoryMenu(false); setShowColorPicker(false) }}
            className={`flex items-center gap-0.5 p-1 rounded-lg hover:bg-white/50 transition ${cs.accent}`}
            title="현재 줄 서식 변경"
          >
            <FormatIcon size={13} />
            <ChevronDown size={10} />
          </button>
          {showFormatMenu && (
            <div className="absolute right-0 top-7 z-50 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden text-xs w-32">
              {(['text', 'check', 'ordered'] as BlockType[]).map(type => {
                const Icon = BLOCK_ICONS[type]
                return (
                  <button key={type}
                    onClick={() => { editorRef.current?.convertFocused(type); setShowFormatMenu(false) }}
                    className={`flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50
                      ${focusedBlockType === type ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                    <Icon size={12} /> {BLOCK_LABELS[type]}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* 복제 */}
        <button data-no-drag onClick={() => duplicateNote(note.id)} className="p-1 rounded-lg hover:bg-white/50 text-gray-400 transition">
          <Copy size={13} />
        </button>

        {/* 아카이브 */}
        <button data-no-drag onClick={() => archiveNote(note.id)} className="p-1 rounded-lg hover:bg-white/50 text-gray-400 transition">
          <Archive size={13} />
        </button>

        {/* 삭제 */}
        <button data-no-drag onClick={handleDelete} className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-400 transition">
          <X size={13} />
        </button>
      </div>

      {/* Body — 블록 에디터 */}
      <div data-no-drag onClick={closeAllMenus}>
        <NoteEditor
          ref={editorRef}
          content={note.content}
          noteHeight={note.height}
          onChange={content => updateNote(note.id, { content })}
          onFocusedTypeChange={setFocusedBlockType}
        />
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
        {note.updated_at
          ? new Date(note.updated_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
          : ''}
      </div>
    </div>
  )
}
