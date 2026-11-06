/** Aggregate-only, in-memory view of Telegram outbox rows. No row data is returned. */

export type TelegramOutboxStatus = 'pending' | 'sending' | 'accepted' | 'failed' | 'uncertain';

export interface TelegramObservability {
  total: number;
  statuses: Record<TelegramOutboxStatus, number>;
  unknownStatus: number;
  attempts: { total: number; overflow: boolean; invalidRows: number };
  createdAt: { invalid: number; future: number };
  retryAt: { scheduled: number; due: number; future: number; invalid: number };
}

/**
 * Policy: retryAt.due counts metadata timestamps <= now across all statuses. It
 * never authorizes or selects a retry, including for accepted/uncertain rows. A
 * missing retryAt is unscheduled. Invalid/non-finite timestamps are counted as
 * invalid; future creation times are counted but do not affect status counts.
 * attempts must be a non-negative safe integer to contribute. Their sum saturates
 * at MAX_SAFE_INTEGER and sets overflow=true when the exact sum exceeds it; this
 * avoids reporting an imprecise number. `accepted` means Telegram accepted the API
 * request; it does not prove delivery to, or reading on, a phone.
 */
export function projectTelegramOutbox(
  outbox: readonly unknown[],
  now: number,
): TelegramObservability {
  if (!Number.isFinite(now)) throw new Error('now must be a finite timestamp');

  const result: TelegramObservability = {
    total: outbox.length,
    statuses: { pending: 0, sending: 0, accepted: 0, failed: 0, uncertain: 0 },
    unknownStatus: 0,
    attempts: { total: 0, overflow: false, invalidRows: 0 },
    createdAt: { invalid: 0, future: 0 },
    retryAt: { scheduled: 0, due: 0, future: 0, invalid: 0 },
  };

  for (const row of outbox) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) {
      result.unknownStatus++;
      result.attempts.invalidRows++;
      result.createdAt.invalid++;
      continue;
    }
    const fields = row as Record<string, unknown>;
    const status = fields.status;
    if (typeof status === 'string' && Object.hasOwn(result.statuses, status)) {
      result.statuses[status as TelegramOutboxStatus]++;
    } else result.unknownStatus++;

    const attempts = fields.attempts;
    if (typeof attempts === 'number' && Number.isSafeInteger(attempts) && attempts >= 0) {
      if (attempts > Number.MAX_SAFE_INTEGER - result.attempts.total) {
        result.attempts.total = Number.MAX_SAFE_INTEGER;
        result.attempts.overflow = true;
      } else if (!result.attempts.overflow) result.attempts.total += attempts;
    } else result.attempts.invalidRows++;

    const created = fields.created;
    if (typeof created !== 'number' || !Number.isFinite(created)) result.createdAt.invalid++;
    else if (created > now) result.createdAt.future++;

    if (Object.hasOwn(fields, 'retryAt') && fields.retryAt !== undefined && fields.retryAt !== null) {
      const retryAt = fields.retryAt;
      if (typeof retryAt !== 'number' || !Number.isFinite(retryAt)) result.retryAt.invalid++;
      else {
        result.retryAt.scheduled++;
        if (retryAt <= now) result.retryAt.due++;
        else result.retryAt.future++;
      }
    }
  }
  return result;
}
