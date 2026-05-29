export type NoteColor = 'yellow' | 'pink' | 'lavender' | 'mint' | 'blue' | 'peach'
export type NoteCategory = 'personal' | 'work' | 'idea'
export type NoteMode = 'text' | 'checklist' | 'ordered'
export type BlockType = 'text' | 'check' | 'ordered'

export interface Block {
  id: string
  type: BlockType
  content: string
  checked: boolean
}

export interface Note {
  id: string
  title: string
  content: string
  color: NoteColor
  category: NoteCategory
  mode: NoteMode
  x: number
  y: number
  width: number
  height: number
  pinned: number // 0 | 1 (sqlite)
  archived: number
  created_at: string
  updated_at: string
}

export interface ChecklistItem {
  id: string
  note_id: string
  text: string
  checked: number // 0 | 1
  order_idx: number
}

export interface FloatAPI {
  notes: {
    getAll: () => Promise<Note[]>
    create: (note: Omit<Note, 'created_at' | 'updated_at'>) => Promise<Note>
    update: (note: Partial<Note> & { id: string }) => Promise<Note>
    delete: (id: string) => Promise<string>
    archive: (id: string) => Promise<string>
  }
  checklist: {
    getByNote: (noteId: string) => Promise<ChecklistItem[]>
    upsert: (item: ChecklistItem) => Promise<ChecklistItem>
    delete: (id: string) => Promise<string>
    reorder: (items: { id: string; order_idx: number }[]) => Promise<unknown>
  }
  onShortcut: (channel: string, cb: () => void) => () => void
}

declare global {
  interface Window {
    floatAPI: FloatAPI
  }
}
