import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('floatAPI', {
  notes: {
    getAll: () => ipcRenderer.invoke('notes:getAll'),
    create: (note: unknown) => ipcRenderer.invoke('notes:create', note),
    update: (note: unknown) => ipcRenderer.invoke('notes:update', note),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    archive: (id: string) => ipcRenderer.invoke('notes:archive', id),
  },
  checklist: {
    getByNote: (noteId: string) => ipcRenderer.invoke('checklist:getByNote', noteId),
    upsert: (item: unknown) => ipcRenderer.invoke('checklist:upsert', item),
    delete: (id: string) => ipcRenderer.invoke('checklist:delete', id),
    reorder: (items: unknown[]) => ipcRenderer.invoke('checklist:reorder', items),
  },
  onShortcut: (channel: string, cb: () => void) => {
    ipcRenderer.on(channel, cb)
    return () => ipcRenderer.removeListener(channel, cb)
  },
})
