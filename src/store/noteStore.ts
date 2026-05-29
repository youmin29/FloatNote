import { create } from 'zustand'
import type { Note, ChecklistItem, NoteColor, NoteCategory, NoteMode } from '../types'

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

interface NoteStore {
  notes: Note[]
  checklists: Record<string, ChecklistItem[]>
  activeNoteId: string | null
  searchQuery: string
  filterColor: NoteColor | null
  filterCategory: NoteCategory | null

  loadNotes: () => Promise<void>
  createNote: (pos?: { x: number; y: number }) => Promise<void>
  updateNote: (id: string, patch: Partial<Note>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  archiveNote: (id: string) => Promise<void>
  togglePin: (id: string) => Promise<void>
  duplicateNote: (id: string) => Promise<void>
  setActiveNote: (id: string | null) => void
  setSearchQuery: (q: string) => void
  setFilterColor: (c: NoteColor | null) => void
  setFilterCategory: (cat: NoteCategory | null) => void

  loadChecklist: (noteId: string) => Promise<void>
  addChecklistItem: (noteId: string, text: string) => Promise<void>
  toggleChecklistItem: (noteId: string, itemId: string) => Promise<void>
  updateChecklistText: (noteId: string, itemId: string, text: string) => Promise<void>
  deleteChecklistItem: (noteId: string, itemId: string) => Promise<void>
  reorderChecklist: (noteId: string, items: ChecklistItem[]) => Promise<void>
}

const COLOR_SEQUENCE: NoteColor[] = ['yellow', 'pink', 'lavender', 'mint', 'blue', 'peach']
let colorIdx = 0

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  checklists: {},
  activeNoteId: null,
  searchQuery: '',
  filterColor: null,
  filterCategory: null,

  loadNotes: async () => {
    if (!window.floatAPI) return
    const notes = await window.floatAPI.notes.getAll()
    set({ notes })
    for (const n of notes) {
      if (n.mode !== 'text') get().loadChecklist(n.id)
    }
  },

  createNote: async (pos) => {
    const color = COLOR_SEQUENCE[colorIdx % COLOR_SEQUENCE.length]
    colorIdx++
    const now = new Date().toISOString()
    const note: Note = {
      id: uid(),
      title: '',
      content: '',
      color,
      category: 'personal',
      mode: 'text',
      x: pos?.x ?? 120 + Math.random() * 200,
      y: pos?.y ?? 100 + Math.random() * 150,
      width: 280,
      height: 320,
      pinned: 0,
      archived: 0,
      created_at: now,
      updated_at: now,
    }
    if (window.floatAPI) await window.floatAPI.notes.create(note)
    set(s => ({ notes: [note, ...s.notes], activeNoteId: note.id }))
  },

  updateNote: async (id, patch) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    const updated = { ...note, ...patch, updated_at: new Date().toISOString() }
    if (window.floatAPI) await window.floatAPI.notes.update(updated)
    set(s => ({ notes: s.notes.map(n => n.id === id ? updated : n) }))
  },

  deleteNote: async (id) => {
    if (window.floatAPI) await window.floatAPI.notes.delete(id)
    set(s => ({ notes: s.notes.filter(n => n.id !== id), activeNoteId: s.activeNoteId === id ? null : s.activeNoteId }))
  },

  archiveNote: async (id) => {
    if (window.floatAPI) await window.floatAPI.notes.archive(id)
    set(s => ({ notes: s.notes.filter(n => n.id !== id) }))
  },

  togglePin: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    await get().updateNote(id, { pinned: note.pinned ? 0 : 1 })
  },

  duplicateNote: async (id) => {
    const note = get().notes.find(n => n.id === id)
    if (!note) return
    const now = new Date().toISOString()
    const newNote: Note = {
      ...note,
      id: uid(),
      x: note.x + 24,
      y: note.y + 24,
      pinned: 0,
      created_at: now,
      updated_at: now,
    }
    if (window.floatAPI) await window.floatAPI.notes.create(newNote)
    set(s => ({ notes: [newNote, ...s.notes] }))
  },

  setActiveNote: (id) => set({ activeNoteId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterColor: (c) => set({ filterColor: c }),
  setFilterCategory: (cat) => set({ filterCategory: cat }),

  loadChecklist: async (noteId) => {
    if (!window.floatAPI) { set(s => ({ checklists: { ...s.checklists, [noteId]: [] } })); return }
    const items = await window.floatAPI.checklist.getByNote(noteId)
    set(s => ({ checklists: { ...s.checklists, [noteId]: items } }))
  },

  addChecklistItem: async (noteId, text) => {
    const items = get().checklists[noteId] ?? []
    const item: ChecklistItem = { id: uid(), note_id: noteId, text, checked: 0, order_idx: items.length }
    if (window.floatAPI) await window.floatAPI.checklist.upsert(item)
    set(s => ({ checklists: { ...s.checklists, [noteId]: [...(s.checklists[noteId] ?? []), item] } }))
  },

  toggleChecklistItem: async (noteId, itemId) => {
    const item = (get().checklists[noteId] ?? []).find(i => i.id === itemId)
    if (!item) return
    const updated = { ...item, checked: item.checked ? 0 : 1 }
    if (window.floatAPI) await window.floatAPI.checklist.upsert(updated)
    set(s => ({ checklists: { ...s.checklists, [noteId]: s.checklists[noteId].map(i => i.id === itemId ? updated : i) } }))
  },

  updateChecklistText: async (noteId, itemId, text) => {
    const item = (get().checklists[noteId] ?? []).find(i => i.id === itemId)
    if (!item) return
    const updated = { ...item, text }
    if (window.floatAPI) await window.floatAPI.checklist.upsert(updated)
    set(s => ({ checklists: { ...s.checklists, [noteId]: s.checklists[noteId].map(i => i.id === itemId ? updated : i) } }))
  },

  deleteChecklistItem: async (noteId, itemId) => {
    if (window.floatAPI) await window.floatAPI.checklist.delete(itemId)
    set(s => ({ checklists: { ...s.checklists, [noteId]: s.checklists[noteId].filter(i => i.id !== itemId) } }))
  },

  reorderChecklist: async (noteId, items) => {
    const reindexed = items.map((it, idx) => ({ ...it, order_idx: idx }))
    if (window.floatAPI) await window.floatAPI.checklist.reorder(reindexed.map(i => ({ id: i.id, order_idx: i.order_idx })))
    set(s => ({ checklists: { ...s.checklists, [noteId]: reindexed } }))
  },
}))
