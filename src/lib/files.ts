// Uploaded files live in IndexedDB so they survive a refresh; form state only holds their metadata.
const DB = 'pm-intake-files';
const STORE = 'files';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const putFile = (id: string, file: Blob) => tx('readwrite', (s) => s.put(file, id));
export const getFile = (id: string) => tx<Blob | undefined>('readonly', (s) => s.get(id));
export const deleteFile = (id: string) => tx('readwrite', (s) => s.delete(id));
export const clearFiles = () => tx('readwrite', (s) => s.clear());

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 ** 2) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 ** 2).toFixed(1)} MB`;
}

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));
