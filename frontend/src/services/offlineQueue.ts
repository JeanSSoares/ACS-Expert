/**
 * Fila offline usando IndexedDB (via idb).
 * Cada item representa uma requisição que falhou por falta de conectividade
 * e será re-enviada quando a conexão for restaurada.
 */
import { openDB, type IDBPDatabase } from 'idb'
import api from './api'

const DB_NAME = 'acs-expert-offline'
const STORE = 'queue'
const DB_VERSION = 1

export interface QueueItem {
  id?: number
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  body: unknown
  offlineUuid: string
  createdAt: string
}

let db: IDBPDatabase | null = null

async function getDb(): Promise<IDBPDatabase> {
  if (db) return db
  db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE)) {
        database.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
  return db
}

export async function enqueue(item: Omit<QueueItem, 'id' | 'createdAt'>): Promise<void> {
  const database = await getDb()
  await database.add(STORE, { ...item, createdAt: new Date().toISOString() })
}

export async function getQueue(): Promise<QueueItem[]> {
  const database = await getDb()
  return database.getAll(STORE)
}

export async function removeFromQueue(id: number): Promise<void> {
  const database = await getDb()
  await database.delete(STORE, id)
}

export async function clearQueue(): Promise<void> {
  const database = await getDb()
  await database.clear(STORE)
}

/** Tenta re-enviar todos os itens pendentes na fila. */
export async function flushQueue(): Promise<void> {
  const items = await getQueue()
  for (const item of items) {
    try {
      await api.request({ method: item.method, url: item.url, data: item.body })
      await removeFromQueue(item.id!)
    } catch {
      // Mantém na fila para tentar novamente mais tarde
    }
  }
}
