'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, ShoppingBag, Send, Inbox, Wallet } from 'lucide-react';
import GiftCatalog from './GiftCatalog';
import GiftSend from './GiftSend';
import GiftSent from './GiftSent';
import GiftReceived from './GiftReceived';
import GiftWallet from './GiftWallet';

type GiftTab = 'received' | 'buy' | 'send' | 'sent' | 'wallet';

export default function GiftMainPanel({ credits }: { credits: number }) {
  const [activeTab, setActiveTab] = useState<GiftTab>('buy');

  const tabs = [
    { id: 'buy' as GiftTab, label: 'Buy', icon: ShoppingBag },
    { id: 'received' as GiftTab, label: 'Received', icon: Inbox },
    { id: 'send' as GiftTab, label: 'Send', icon: Send },
    { id: 'sent' as GiftTab, label: 'Sent', icon: Gift },
    { id: 'wallet' as GiftTab, label: 'My Account', icon: Wallet },
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
            className={`relative flex-1 flex items-center justify-center gap-1 px-1 py-1.5 text-[10px] font-semibold whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.id
                ? 'text-indigo-600'
                : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            <span className="whitespace-nowrap">{tab.label}</span>
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
        {activeTab === 'sent' && <GiftSent />}
        {activeTab === 'wallet' && <GiftWallet credits={credits} />}
      </div>
    </div>
  );
}
