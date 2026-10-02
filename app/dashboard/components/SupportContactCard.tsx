'use client';

import { useState, type FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { LifeBuoy, Send } from 'lucide-react';

interface SupportContactResponse {
  contact?: { id: string };
  error?: string;
}

interface CreateConversationResponse {
  conversation?: { id: string };
  error?: string;
}

interface SupportContactCardProps {
  collapsed?: boolean;
}

export function SupportContactCard({
  collapsed = false,
}: SupportContactCardProps) {
  const { data: session } = useSession();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendStatus, setSendStatus] = useState<'sent' | 'error' | null>(null);
  const {
    data: contactId,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['support-contact'],
    queryFn: async () => {
      const response = await fetch('/api/support/contact');
      const result = await response.json().catch(() => ({})) as SupportContactResponse;

      if (!response.ok || !result.contact?.id) {
        throw new Error(result.error || 'Unable to load Selfless Support');
      }

      return result.contact.id;
    },
    enabled: Boolean(session?.user?.id),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!contactId || !content || isSending) return;

    setIsSending(true);
    setSendStatus(null);

    try {
      const conversationResponse = await fetch('/api/messages/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: contactId }),
      });
      const conversationResult = await conversationResponse
        .json()
        .catch(() => ({})) as CreateConversationResponse;

      if (!conversationResponse.ok || !conversationResult.conversation?.id) {
        throw new Error(conversationResult.error || 'Could not start a support conversation.');
      }

      const messageResponse = await fetch(
        `/api/messages/${conversationResult.conversation.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content }),
        },
      );
      const messageResult = await messageResponse.json().catch(() => ({})) as {
        error?: string;
      };

      if (!messageResponse.ok) {
        throw new Error(messageResult.error || 'Could not send your message.');
      }

      setMessage('');
      setSendStatus('sent');
    } catch (error) {
      console.error('Failed to message Selfless Support:', error);
      setSendStatus('error');
    } finally {
      setIsSending(false);
    }
  };

  if (collapsed) {
    return (
      <div
        aria-label="Selfless Support"
        title="Selfless Support"
        className="mx-3 mb-1 flex h-9 items-center justify-center rounded-md border border-slate-700 bg-slate-800"
      >
        <LifeBuoy className="h-4 w-4 text-slate-300" />
      </div>
    );
  }

  return (
    <section className="mx-3 mb-2 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 text-slate-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 pt-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
          <LifeBuoy className="h-3.5 w-3.5 text-[#B98A3E]" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-xs font-semibold text-white">Selfless Support</h2>
          <p className="truncate text-[10px] text-slate-400">
            Questions about navigation or anything else? Ask us.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex min-w-0 items-center gap-1.5 px-3 pb-2 pt-3">
        <input
          type="text"
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            setSendStatus(null);
          }}
          placeholder={
            isLoading
              ? 'Connecting…'
              : isError
                ? 'Support unavailable'
                : 'Message Selfless Support…'
          }
          aria-label="Message Selfless Support"
          disabled={!contactId || isSending}
          className="h-8 min-w-0 flex-1 border border-slate-700 bg-slate-800 px-2 text-[11px] text-white placeholder:text-slate-400 focus:border-[#B98A3E] focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!message.trim() || !contactId || isSending}
          aria-label="Send message to Selfless Support"
          title="Send message"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-[#B98A3E] text-white transition-colors hover:bg-[#9F7430] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {sendStatus && (
        <p
          className={`px-3 pb-2 text-[10px] ${
            sendStatus === 'error' ? 'text-[#FCA5A5]' : 'text-emerald-300'
          }`}
          aria-live="polite"
        >
          {sendStatus === 'sent'
            ? 'Message sent to Selfless Support.'
            : 'Could not send your message. Please try again.'}
        </p>
      )}
    </section>
  );
}
