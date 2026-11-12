'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Heart, Check, X, Loader2 } from 'lucide-react';
import { getApiErrorMessage, isJsonObject } from '@/lib/api-response';

interface Donor {
  id: string;
  name: string;
  requested: boolean;
}

interface IncomingRequest {
  id: string;
  requester: { id: string; name: string };
}

interface HeartState {
  heartsRemaining: number;
  requestsRemaining: number;
  requestLimit: number;
  donors: Donor[];
  incoming: IncomingRequest[];
}

interface HeartSharingPanelProps {
  // "request": shown on the out-of-hearts card. "incoming": banner for givers.
  mode: 'request' | 'incoming';
  // Called in "request" mode once a friend has shared a heart.
  onHeartsChanged?: () => void;
}

const POLL_MS = { request: 10_000, incoming: 30_000 };

function readState(data: unknown): HeartState | null {
  if (
    !isJsonObject(data) ||
    data.success !== true ||
    typeof data.heartsRemaining !== 'number' ||
    typeof data.requestsRemaining !== 'number' ||
    typeof data.requestLimit !== 'number' ||
    !Array.isArray(data.donors) ||
    !Array.isArray(data.incoming)
  ) {
    return null;
  }
  return {
    heartsRemaining: data.heartsRemaining,
    requestsRemaining: data.requestsRemaining,
    requestLimit: data.requestLimit,
    donors: data.donors as Donor[],
    incoming: data.incoming as IncomingRequest[],
  };
}

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

function Avatar({ name }: { name: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
      {initials(name)}
    </span>
  );
}

export default function HeartSharingPanel({ mode, onHeartsChanged }: HeartSharingPanelProps) {
  const [state, setState] = useState<HeartState | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [selectedDonorId, setSelectedDonorId] = useState('');
  const [message, setMessage] = useState<{ text: string; tone: 'ok' | 'error' } | null>(null);
  const onHeartsChangedRef = useRef(onHeartsChanged);
  useEffect(() => {
    onHeartsChangedRef.current = onHeartsChanged;
  }, [onHeartsChanged]);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/trivia/heart-requests', { cache: 'no-store' });
      const next = readState(await response.json());
      if (!next) return;
      setState(next);
      if (mode === 'request' && next.heartsRemaining > 0) {
        onHeartsChangedRef.current?.();
      }
    } catch (error) {
      console.error('Failed to load heart sharing state:', error);
    } finally {
      setLoaded(true);
    }
  }, [mode]);

  useEffect(() => {
    const first = setTimeout(() => void load(), 0);
    const timer = setInterval(() => void load(), POLL_MS[mode]);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [load, mode]);

  const send = async (url: string, body: unknown, busyKey: string) => {
    setBusyId(busyKey);
    setMessage(null);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data: unknown = await response.json();
      if (!response.ok || !isJsonObject(data) || data.success !== true) {
        setMessage({ text: getApiErrorMessage(data, 'Something went wrong.'), tone: 'error' });
        return null;
      }
      return data;
    } catch {
      setMessage({ text: 'Check your connection and try again.', tone: 'error' });
      return null;
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const selectedDonor = state?.donors.find((donor) => donor.id === selectedDonorId) ?? null;

  const requestHeart = async (donor: Donor) => {
    const data = await send('/api/trivia/heart-requests', { donorId: donor.id }, donor.id);
    if (data) {
      setSelectedDonorId('');
      setMessage({ text: `Request sent to ${donor.name}.`, tone: 'ok' });
    }
  };

  const respond = async (request: IncomingRequest, action: 'accept' | 'decline') => {
    const data = await send(
      `/api/trivia/heart-requests/${request.id}`,
      { action },
      request.id,
    );
    if (data && action === 'accept') {
      setMessage({ text: `You shared a heart with ${request.requester.name}.`, tone: 'ok' });
    }
  };

  const messageEl = message && (
    <p
      role="status"
      className={`mt-2 text-xs font-medium ${
        message.tone === 'ok' ? 'text-emerald-600' : 'text-rose-600'
      }`}
    >
      {message.text}
    </p>
  );

  if (mode === 'incoming') {
    if (!state || state.incoming.length === 0) return messageEl ? <div className="px-5 pt-3 sm:px-6">{messageEl}</div> : null;
    return (
      <div className="border-b border-rose-100 bg-rose-50/60 px-5 py-3 sm:px-6">
        <p className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
          <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
          Heart requests
        </p>
        <ul className="mt-2 space-y-2">
          {state.incoming.map((request) => (
            <li key={request.id} className="flex items-center gap-2">
              <Avatar name={request.requester.name} />
              <span className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-800">
                {request.requester.name}
              </span>
              <button
                onClick={() => void respond(request, 'accept')}
                disabled={busyId !== null}
                className="inline-flex items-center gap-1 rounded-md bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50"
              >
                {busyId === request.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                Give 1 heart
              </button>
              <button
                onClick={() => void respond(request, 'decline')}
                disabled={busyId !== null}
                aria-label={`Decline ${request.requester.name}`}
                className="rounded-md p-1 text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        {messageEl}
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-slate-100 pt-4 text-left">
      <p className="text-sm font-bold text-slate-900">Ask a friend for a heart</p>
      <p className="mt-0.5 text-xs text-slate-500">
        People you follow who have a spare heart can share one with you.
      </p>

      {!loaded ? (
        <div className="mt-3 flex justify-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        </div>
      ) : state && state.requestsRemaining === 0 ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          You have used all {state.requestLimit} heart requests for today. Hearts
          reset at midnight UTC.
        </p>
      ) : state && state.donors.length > 0 ? (
        <>
        <div className="mt-3 flex items-center gap-2">
          <select
            value={selectedDonor ? selectedDonor.id : ''}
            onChange={(event) => setSelectedDonorId(event.target.value)}
            disabled={busyId !== null}
            aria-label="Choose a friend to ask for a heart"
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 disabled:opacity-60"
          >
            <option value="" disabled>
              Choose a friend ({state.donors.length})
            </option>
            {state.donors.map((donor) => (
              <option key={donor.id} value={donor.id} disabled={donor.requested}>
                {donor.name}
                {donor.requested ? ' (requested)' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={() => selectedDonor && void requestHeart(selectedDonor)}
            disabled={!selectedDonor || selectedDonor.requested || busyId !== null}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:bg-slate-200 disabled:text-slate-500"
          >
            {busyId !== null ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Heart className="h-3.5 w-3.5" />
            )}
            Request
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">
          {state.requestsRemaining} of {state.requestLimit} requests left today
        </p>
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
          None of the people you follow have a spare heart right now. Follow more
          players on the portal, or check back later.
        </p>
      )}
      {messageEl}
    </div>
  );
}
