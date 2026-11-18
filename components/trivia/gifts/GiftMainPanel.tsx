'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, ShoppingBag, Send, Inbox, Wallet } from 'lucide-react';
import GiftCatalog from './GiftCatalog';
import GiftSend from './GiftSend';
import GiftReceived from './GiftReceived';
import GiftWallet from './GiftWallet';

type GiftTab = 'received' | 'buy' | 'send' | 'wallet';

export default function GiftMainPanel({ credits }: { credits: number }) {
  const [activeTab, setActiveTab] = useState<GiftTab>('received');

  const tabs = [
    { id: 'received' as GiftTab, label: 'Received', icon: Inbox },
    { id: 'buy' as GiftTab, label: 'Buy', icon: ShoppingBag },
    { id: 'send' as GiftTab, label: 'Send', icon: Send },
    { id: 'wallet' as GiftTab, label: 'Wallet', icon: Wallet },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-100 bg-slate-50/60">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                initial={false}
                animate
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'received' && <GiftReceived />}
        {activeTab === 'buy' && <GiftCatalog credits={credits} />}
        {activeTab === 'send' && <GiftSend />}
        {activeTab === 'wallet' && <GiftWallet credits={credits} />}
      </div>
    </div>
  );
}
