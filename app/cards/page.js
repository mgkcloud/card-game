"use client"; // Add this line at the top

import React, { useState, Suspense } from 'react';
import DealerSection from '@/components/game/DealerSection';

export default function Cards() {

    const cardData = [
        {
          title: 'Transform your sales with AI-powered automation',
          color: 'bg-primary',
          textColor: 'text-white',
          items: [
            'Qualify and engage leads 24/7',
            'Automate personalised follow-ups',
            'Reduce response times',
            'Integrates with your CRM',
            'Tailored customer journeys',
          ],
        },
        {
          title: 'Relying on outdated sales tactics?',
          color: 'bg-secondary',
          textColor: 'text-white',
          items: [
            'Struggling to engage leads',
            'Wasting time on unqualified leads',
            'Experiencing slow response times',
            'Lacking a centralised system for lead data',
            'Not personalising the customer journey.',
          ],
        },
      ];



  return (
    <>
    
      <main>

        <DealerSection />


      </main>
      
    </>
  );
}