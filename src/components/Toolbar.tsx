import { Search, Plus, X } from 'lucide-react'
import { useNoteStore } from '../store/noteStore'
import type { NoteColor, NoteCategory } from '../types'

const COLORS: NoteColor[] = ['yellow', 'pink', 'lavender', 'mint', 'blue', 'peach']
const COLOR_DOT: Record<NoteColor, string> = {
  yellow: 'bg-amber-300',
  pink: 'bg-rose-300',
  lavender: 'bg-purple-300',
  mint: 'bg-emerald-300',
  blue: 'bg-sky-300',
  peach: 'bg-orange-300',
}
const CATEGORIES: { id: NoteCategory; label: string }[] = [
  { id: 'personal', label: '개인' },
  { id: 'work', label: '업무' },
  { id: 'idea', label: '아이디어' },
]

export default function Toolbar() {
  const { createNote, searchQuery, setSearchQuery, filterColor, setFilterColor, filterCategory, setFilterCategory } = useNoteStore()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2">
      {/* Backdrop pill */}
      <div
        className="flex items-center gap-2 bg-white/70 backdrop-blur-xl rounded-2xl px-4 py-2 shadow-lg border border-white/80 whitespace-nowrap"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        {/* New note */}
        <button
          onClick={() => createNote()}
          className="flex items-center gap-1.5 bg-pastel-pink hover:bg-rose-200 text-rose-500 font-semibold text-sm px-3 py-1.5 rounded-xl transition-all active:scale-95"
        >
          <Plus size={14} strokeWidth={2.5} />
          새 메모
        </button>

        <div className="w-px h-5 bg-gray-200" />

        {/* Search */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <Search size={13} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="메모 검색..."
            className="bg-transparent text-sm outline-none w-32 placeholder-gray-300"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="hover:text-gray-600 transition">
              <X size={12} />
            </button>
          )}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Color filter dots */}
        <div className="flex items-center gap-1">
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setFilterColor(filterColor === c ? null : c)}
              className={`w-4 h-4 rounded-full transition-all ${COLOR_DOT[c]} ${filterColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200" />

        {/* Category filter */}
        <div className="flex items-center gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(filterCategory === cat.id ? null : cat.id)}
              className={`text-xs px-2 py-1 rounded-lg transition-all
                ${filterCategory === cat.id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
