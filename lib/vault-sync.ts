// ============================================
// ShoreStack Vault — Online/Offline Sync
// ============================================
// Syncs encrypted vault items between Supabase and IndexedDB.
// Server wins on conflicts (simple, safe for single-user vault).

import { createClient } from '@/lib/supabase';
import type { VaultItemRow } from '@/types/vault';
import {
  cacheItems,
  cacheItem,
  deleteCachedItem,
  getCachedItems,
  getUnsyncedItems,
  setLastSyncTime,
} from '@/lib/vault-cache';

// --- Full Sync (on vault unlock) ---

export async function syncVaultToCache(userId: string): Promise<VaultItemRow[]> {
  const supabase = createClient();

  if (!navigator.onLine) {
    // Offline: return cached items
    const cached = await getCachedItems(userId);
    return cached;
  }

  // Online: fetch from Supabase and update cache
  const { data: rows, error } = await supabase
    .from('vault_items')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.warn('[Sync] Failed to fetch from Supabase, using cache:', error.message);
    return getCachedItems(userId);
  }

  const items = (rows || []) as VaultItemRow[];

  // First push any unsynced local items to server
  await pushUnsyncedItems(userId);

  // Then overwrite local cache with server state
  await cacheItems(items);
  await setLastSyncTime(userId);

  return items;
}

// --- Push unsynced local items to server ---

async function pushUnsyncedItems(userId: string): Promise<void> {
  const unsynced = await getUnsyncedItems(userId);
  if (unsynced.length === 0) return;

  const supabase = createClient();

  for (const item of unsynced) {
    const { error } = await supabase
      .from('vault_items')
      .upsert({
        id: item.id,
        user_id: item.user_id,
        item_type: item.item_type,
        encrypted_data: item.encrypted_data,
        iv: item.iv,
        search_index: item.search_index,
        favorite: item.favorite,
        created_at: item.created_at,
        updated_at: item.updated_at,
      });

    if (error) {
      console.warn('[Sync] Failed to push item:', item.id, error.message);
    } else {
      // Mark as synced in cache
      await cacheItem(item, true);
    }
  }
}

// --- Single item operations (keep cache in sync) ---

export async function onItemCreated(item: VaultItemRow): Promise<void> {
  await cacheItem(item, navigator.onLine);
}

export async function onItemUpdated(item: VaultItemRow): Promise<void> {
  await cacheItem(item, navigator.onLine);
}

export async function onItemDeleted(itemId: string): Promise<void> {
  await deleteCachedItem(itemId);
}

// --- Online status listener ---

export function setupSyncListeners(userId: string): () => void {
  const handleOnline = async () => {
    console.log('[Sync] Back online, pushing unsynced items...');
    await pushUnsyncedItems(userId);
  };

  window.addEventListener('online', handleOnline);

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}
