'use client';

import GiftMainPanel from './gifts/GiftMainPanel';

export default function TriviaAccountPanel({ credits }: { credits: number }) {
  return <GiftMainPanel credits={credits} />;
}
