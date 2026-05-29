import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any
let win: BrowserWindow | null

function initDB() {
  const Database = require('better-sqlite3')
  const dbPath = path.join(app.getPath('userData'), 'floatnote.db')
  db = new Database(dbPath)

  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      title TEXT DEFAULT '',
      content TEXT DEFAULT '',
      color TEXT DEFAULT 'yellow',
      category TEXT DEFAULT 'personal',
      mode TEXT DEFAULT 'text',
      x REAL DEFAULT 100,
      y REAL DEFAULT 100,
      width REAL DEFAULT 280,
      height REAL DEFAULT 320,
      pinned INTEGER DEFAULT 0,
      archived INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS checklist_items (
      id TEXT PRIMARY KEY,
      note_id TEXT NOT NULL,
      text TEXT DEFAULT '',
      checked INTEGER DEFAULT 0,
      order_idx INTEGER DEFAULT 0,
      FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
    );
  `)
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    transparent: true,
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
    icon: path.join(process.env.VITE_PUBLIC!, 'icon.png'),
    webPreferences: {
      preload: path.join(MAIN_DIST, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 16, y: 16 },
  })

  win.setAlwaysOnTop(false)

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.whenReady().then(() => {
  initDB()
  createWindow()

  globalShortcut.register('CommandOrControl+Shift+N', () => {
    win?.webContents.send('shortcut:new-note')
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

// IPC: Notes CRUD
ipcMain.handle('notes:getAll', () => {
  return db.prepare('SELECT * FROM notes WHERE archived = 0 ORDER BY pinned DESC, updated_at DESC').all()
})

ipcMain.handle('notes:create', (_e, note) => {
  db.prepare(`
    INSERT INTO notes (id, title, content, color, category, mode, x, y, width, height, pinned)
    VALUES (@id, @title, @content, @color, @category, @mode, @x, @y, @width, @height, @pinned)
  `).run(note)
  return note
})

ipcMain.handle('notes:update', (_e, note) => {
  db.prepare(`
    UPDATE notes SET title=@title, content=@content, color=@color, category=@category,
    mode=@mode, x=@x, y=@y, width=@width, height=@height, pinned=@pinned,
    updated_at=datetime('now') WHERE id=@id
  `).run(note)
  return note
})

ipcMain.handle('notes:delete', (_e, id) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(id)
  return id
})

ipcMain.handle('notes:archive', (_e, id) => {
  db.prepare("UPDATE notes SET archived = 1, updated_at=datetime('now') WHERE id = ?").run(id)
  return id
})

// IPC: Checklist items
ipcMain.handle('checklist:getByNote', (_e, noteId) => {
  return db.prepare('SELECT * FROM checklist_items WHERE note_id = ? ORDER BY order_idx').all(noteId)
})

ipcMain.handle('checklist:upsert', (_e, item) => {
  db.prepare(`
    INSERT INTO checklist_items (id, note_id, text, checked, order_idx)
    VALUES (@id, @note_id, @text, @checked, @order_idx)
    ON CONFLICT(id) DO UPDATE SET text=@text, checked=@checked, order_idx=@order_idx
  `).run(item)
  return item
})

ipcMain.handle('checklist:delete', (_e, id) => {
  db.prepare('DELETE FROM checklist_items WHERE id = ?').run(id)
  return id
})

ipcMain.handle('checklist:reorder', (_e, items) => {
  const stmt = db.prepare('UPDATE checklist_items SET order_idx = ? WHERE id = ?')
  const reorder = db.transaction((its: { id: string; order_idx: number }[]) => {
    for (const it of its) stmt.run(it.order_idx, it.id)
  })
  reorder(items)
  return items
})
