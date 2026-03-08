// ============================================
// ShoreStack Vault — Plan Enforcement
// ============================================

import { PLAN_LIMITS, type PlanType } from '@/types/vault';

export interface PlanCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
}

export function checkItemLimit(plan: PlanType, currentCount: number): PlanCheckResult {
  const limit = PLAN_LIMITS[plan].maxItems;
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You've reached the ${limit}-item limit on the ${plan} plan. Upgrade to add more.`,
      limit,
      current: currentCount,
    };
  }
  return { allowed: true, limit, current: currentCount };
}

export function checkStorageLimit(plan: PlanType, currentMB: number, newFileMB: number): PlanCheckResult {
  const limitMB = PLAN_LIMITS[plan].maxStorageMB;
  if (currentMB + newFileMB > limitMB) {
    return {
      allowed: false,
      reason: `This upload would exceed your ${limitMB >= 1024 ? `${limitMB / 1024} GB` : `${limitMB} MB`} storage limit. Upgrade for more space.`,
      limit: limitMB,
      current: currentMB,
    };
  }
  return { allowed: true, limit: limitMB, current: currentMB };
}

export function checkAuditAccess(plan: PlanType): PlanCheckResult {
  if (!PLAN_LIMITS[plan].auditLog) {
    return { allowed: false, reason: 'Audit log requires an Individual or Team plan.' };
  }
  return { allowed: true };
}
