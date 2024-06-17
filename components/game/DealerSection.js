import React from 'react';
import DealerTable from './DealerTable';

const cardData = [

  
  {
    title: 'Optimize your operations',
    color: 'bg-red-500',
    textColor: 'text-white',
    rank: 'high',
    mediaSrc: 'https://bbw-chan.link/.media/9c957b547c2d79640bbdca80fe1bf1fd6411fd55b75871706633cda964ddcf2e.mp4', // Add media source
    items: ['Reduce costs', 'Streamline processes', 'Improve productivity'],
  },

  {
    title: 'Enhance customer experience',
    color: 'bg-green-500',
    textColor: 'text-white',
    rank: 'high',
    mediaSrc: 'https://bbw-chan.link/.media/fa0b8011b8c41cdac3a536341755873fdd50329998c9488060b8be6514db8732.gif', // Add media source
    items: ['Personalized interactions', '24/7 support', 'Faster response times'],
  },

  {
    title: 'Transform your sales with AI',
    color: 'bg-blue-500',
    textColor: 'text-white',
    rank: 'high',
    mediaSrc: 'https://64.media.tumblr.com/73537d6f3783ced7ba684ad38326bcfc/9725645a713558c3-cf/s400x600/6ff429ba7c1e8556f41308b0415857934bc26c47.gifv', // Add media source
    items: ['Automate tasks', 'Increase efficiency', 'Boost sales'],
  },

];

const DealerSection = () => {
  return (
        <section className="bg-neutral text-neutral-content relative min-h-[80vh] overflow-hidden">
          <div className="relative hero-overlay bg-opacity-90"></div>
          <div className="container mx-auto px-8 py-8 md:py-8 flex flex-col items-center justify-center">
            <h2 className="max-w-3xl mx-auto font-extrabold text-4xl md:text-5xl tracking-tight text-center mb-2 md:mb-20">
              Make a choice: Outdated Sales or AI Automation?
            </h2>
            <div className="flex flex-col-reverse md:flex-row max-w-[900px] items-center justify-center w-full">
              <div
                className="relative w-full md:w-1/2" // Added overflow-hidden 
                style={{ height: 'calc(20vw * 1.4)', minHeight: '200px' }}
              >
                  <DealerTable cardData={cardData} />
              </div>
        </div>
            </div>
        </section>
  );
};

export default DealerSection;
