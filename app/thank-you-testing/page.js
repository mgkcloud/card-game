"use client"; // Add this line at the top

import React, { useState, Suspense } from 'react';
import { InlineWidget } from 'react-calendly';

export default function TYTEST() {

  return (
    <>
     
     <main className="w-[100vw] h-[100vh] mx-auto bg-black flex justify-center align-center pt-[200px]">

      <div className="w-full md:w-1/2 mt-8 md:mt-0 md:ml-8">
            <div className="rounded-2xl border-2 border-gray-800 bg-white text-white p-6 overflow-x-hidden overflow-y-scroll relative" style={{ height: '800px' }}>
              <InlineWidget
                url={`https://calendly.com/will-feistyagency/30min?hide_gdpr_banner=1`}
                styles={{
                  height: '1000px',
                  transform: 'scale(0.8)',
                  transformOrigin: 'middle',
                  marginTop: '-80px'
                }}
              />
            </div>
          </div>
    
      </main>
 
    </>
  );
}