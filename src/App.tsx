import { useEffect, useCallback } from 'react'
import { useNoteStore } from './store/noteStore'
import NoteCard from './components/NoteCard'
import Toolbar from './components/Toolbar'
import './index.css'

function App() {
  const { notes, loadNotes, createNote, setActiveNote, searchQuery, filterColor, filterCategory } = useNoteStore()

  useEffect(() => {
    loadNotes()
    if (window.floatAPI) {
      const unsub = window.floatAPI.onShortcut('shortcut:new-note', () => createNote())
      return unsub
    }
  }, [])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('canvas')) setActiveNote(null)
  }, [setActiveNote])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('canvas')) {
      createNote({ x: e.clientX - 140, y: e.clientY - 30 })
    }
  }, [createNote])

  const filteredNotes = notes.filter(n => {
    if (filterColor && n.color !== filterColor) return false
    if (filterCategory && n.category !== filterCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div
      className="canvas fixed inset-0 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 20% 30%, #fce7f3 0%, transparent 50%), radial-gradient(ellipse at 80% 70%, #e0f2fe 0%, transparent 50%), radial-gradient(ellipse at 50% 50%, #f5f3ff 0%, transparent 70%), #fefce8',
      }}
      onClick={handleCanvasClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 도트 그리드 */}
      <div
        className="canvas absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* 앱 창 드래그 영역 — 툴바 높이만큼 전체 너비 */}
      <div
        className="fixed top-0 left-0 right-0 h-20 z-[150]"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      <Toolbar />

      {filteredNotes.map(note => (
        <NoteCard key={note.id} note={note} />
      ))}

      {notes.length === 0 && (
        <div className="canvas absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
          <div className="text-6xl mb-4 opacity-40">🗒️</div>
          <p className="text-gray-400 text-sm font-medium">더블클릭으로 메모를 만들어보세요</p>
          <p className="text-gray-300 text-xs mt-1">또는 상단 툴바에서 <span className="font-semibold">새 메모</span>를 눌러보세요</p>
        </div>
      )}

      {notes.some(n => n.pinned) && (
        <div className="fixed bottom-4 right-4 text-gray-300 text-xs flex items-center gap-1 pointer-events-none">
          <span>📌</span> 고정된 메모는 항상 앞에 표시됩니다
        </div>
      )}
    </div>
  )
}

export default App
