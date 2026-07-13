import { useEffect, useRef, useCallback } from 'react';
import { xdr } from '@stellar/stellar-sdk';
import { getServer } from '../services/rpc.ts';
import { COUNTER_CONTRACT_ADDRESS } from '../utils/constants.ts';
import type { PaymentEvent } from '../types/contract.ts';

export function useEventListener(
  onPaymentReceived: (payment: PaymentEvent) => void
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(onPaymentReceived);
  callbackRef.current = onPaymentReceived;

  const decodePaymentEvent = useCallback(
    (value: string): PaymentEvent | null => {
      try {
        const scVal = xdr.ScVal.fromXDR(value, 'base64');
        const map = scVal.map();
        if (!map) return null;

        const toNum = (key: string): number => {
          const entry = map.find(
            (e) => e.key().sym()?.toString() === key
          );
          if (!entry) return 0;
          const val = entry.val();
          const u = val.u64();
          return u ? Number(u) : Number(val.u32() ?? 0);
        };

        const id = toNum('id');
        const amount = toNum('amount');
        const timestamp = toNum('timestamp');

        const senderEntry = map.find(
          (e) => e.key().sym()?.toString() === 'sender'
        );
        const sender = senderEntry
          ? senderEntry.val().address()?.toString() ?? ''
          : '';

        const recipientEntry = map.find(
          (e) => e.key().sym()?.toString() === 'recipient'
        );
        const recipient = recipientEntry
          ? recipientEntry.val().address()?.toString() ?? ''
          : '';

        const memoEntry = map.find(
          (e) => e.key().sym()?.toString() === 'memo'
        );
        const memo = memoEntry
          ? memoEntry.val().str()?.toString() ?? ''
          : '';

        if (!sender && !recipient) return null;

        return {
          id,
          sender,
          recipient,
          amount,
          memo,
          timestamp,
        };
      } catch {
        return null;
      }
    },
    []
  );

  useEffect(() => {
    const server = getServer();

    let isSubscribed = true;
    let cursor: string | undefined;

    const poll = async () => {
      try {
        const filter = {
          type: 'contract' as const,
          contractIds: COUNTER_CONTRACT_ADDRESS
            ? [COUNTER_CONTRACT_ADDRESS]
            : undefined,
        };

        const request: Parameters<typeof server._getEvents>[0] = cursor
          ? { cursor, filters: [filter], limit: 50 }
          : { startLedger: 0, filters: [filter], limit: 50 };

        const response = await server._getEvents(request);

        if (!isSubscribed) return;

        for (const rawEvent of response.events) {
          if (rawEvent.value) {
            const decoded = decodePaymentEvent(rawEvent.value);
            if (decoded) {
              callbackRef.current(decoded);
            }
          }
        }

        if (response.cursor) {
          cursor = response.cursor;
        }
      } catch {
        // silent retry
      }

      if (isSubscribed) {
        timeoutRef.current = setTimeout(poll, 3000);
      }
    };

    poll();

    return () => {
      isSubscribed = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [decodePaymentEvent]);
}
