import type { NoteColor } from '../types'
import { useNoteStore } from '../store/noteStore'

const COLORS: { id: NoteColor; label: string; dot: string }[] = [
  { id: 'yellow',   label: '옐로',   dot: 'bg-amber-300' },
  { id: 'pink',     label: '핑크',   dot: 'bg-rose-300' },
  { id: 'lavender', label: '라벤더', dot: 'bg-purple-300' },
  { id: 'mint',     label: '민트',   dot: 'bg-emerald-300' },
  { id: 'blue',     label: '블루',   dot: 'bg-sky-300' },
  { id: 'peach',    label: '피치',   dot: 'bg-orange-300' },
]

interface Props {
  noteId: string
  currentColor: NoteColor
  onClose: () => void
}

export default function ColorPicker({ noteId, currentColor, onClose }: Props) {
  const { updateNote } = useNoteStore()
  return (
    <div className="absolute top-8 left-0 z-50 bg-white rounded-xl shadow-lg p-2 flex gap-1.5 border border-gray-100">
      {COLORS.map(c => (
        <button
          key={c.id}
          onClick={() => { updateNote(noteId, { color: c.id }); onClose() }}
          className={`w-5 h-5 rounded-full ${c.dot} transition-all hover:scale-110 ${currentColor === c.id ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : ''}`}
          title={c.label}
        />
      ))}
    </div>
  )
}
