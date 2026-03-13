// ============================================
// ShoreStack Vault — IndexedDB Vault Cache
// ============================================
// Stores ENCRYPTED vault items locally for offline read access.
// NEVER stores plaintext — only AES-256-GCM ciphertext (same as Supabase).

import type { VaultItemRow } from '@/types/vault';

const DB_NAME = 'shorestack-vault';
const DB_VERSION = 1;
const ITEMS_STORE = 'vault_items';
const META_STORE = 'metadata';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ITEMS_STORE)) {
        const store = db.createObjectStore(ITEMS_STORE, { keyPath: 'id' });
        store.createIndex('user_id', 'user_id', { unique: false });
        store.createIndex('item_type', 'item_type', { unique: false });
      }
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// --- Cached Item (encrypted row + sync flag) ---

export interface CachedVaultItem extends VaultItemRow {
  synced: boolean;
}

// --- Read Operations ---

export async function getCachedItems(userId: string): Promise<CachedVaultItem[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, 'readonly');
    const store = tx.objectStore(ITEMS_STORE);
    const index = store.index('user_id');
    const request = index.getAll(userId);

    request.onsuccess = () => resolve(request.result as CachedVaultItem[]);
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedItem(itemId: string): Promise<CachedVaultItem | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, 'readonly');
    const store = tx.objectStore(ITEMS_STORE);
    const request = store.get(itemId);

    request.onsuccess = () => resolve(request.result as CachedVaultItem | undefined);
    request.onerror = () => reject(request.error);
  });
}

// --- Write Operations ---

export async function cacheItems(items: VaultItemRow[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, 'readwrite');
    const store = tx.objectStore(ITEMS_STORE);

    for (const item of items) {
      store.put({ ...item, synced: true });
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function cacheItem(item: VaultItemRow, synced: boolean = true): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, 'readwrite');
    const store = tx.objectStore(ITEMS_STORE);
    store.put({ ...item, synced });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteCachedItem(itemId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, 'readwrite');
    const store = tx.objectStore(ITEMS_STORE);
    store.delete(itemId);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Sync Helpers ---

export async function getUnsyncedItems(userId: string): Promise<CachedVaultItem[]> {
  const items = await getCachedItems(userId);
  return items.filter((item) => !item.synced);
}

export async function clearUserCache(userId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEMS_STORE, 'readwrite');
    const store = tx.objectStore(ITEMS_STORE);
    const index = store.index('user_id');
    const request = index.openCursor(userId);

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor) {
        cursor.delete();
        cursor.continue();
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// --- Metadata ---

export async function setLastSyncTime(userId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readwrite');
    const store = tx.objectStore(META_STORE);
    store.put({ key: `last_sync_${userId}`, value: Date.now() });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getLastSyncTime(userId: string): Promise<number | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly');
    const store = tx.objectStore(META_STORE);
    const request = store.get(`last_sync_${userId}`);

    request.onsuccess = () => resolve(request.result?.value ?? null);
    request.onerror = () => reject(request.error);
  });
}
