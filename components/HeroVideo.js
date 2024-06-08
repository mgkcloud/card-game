// HeroVideo.js
"use client";
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import ButtonLead from "@/components/ButtonLead";
import MatrixBackground from '@/components/MatrixBackground';
import TestimonialsAvatars from '@/components/TestimonialsAvatars';
import emojibg from "@/app/emojibg.png";

const HeroVideo = () => {
    const [isPlaying, setIsPlaying] = useState(false);
  const [isCanvasLoaded, setIsCanvasLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
};
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
};

  const handleCanvasLoad = () => {
    setIsCanvasLoaded(true);
  };

  const style = "rounded-2xl aspect-square w-full sm:w-[26rem]";
  const size = {
    width: 500,
    height: 500,
  };
  const path = 'https://d3m8mk7e1mf7xn.cloudfront.net/app/newsletter.webm';

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }} ref={sectionRef}>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <section className="relative hero overflow-hidden min-h-65 flex items-center justify-center bg-black">
          <Image
            src={emojibg}
            alt="Background"
            className={`object-cover w-full h-full absolute top-0 left-0 z-0 transition-opacity duration-500 ${isCanvasLoaded ? 'opacity-0' : 'opacity-100'}`}
            style={{ filter: 'blur(2px)' }}
            fill
          />
          <MatrixBackground onLoad={handleCanvasLoad} isVisible={isVisible} />
          <div className="relative w-full max-w-4xl">
            <div className="relative p-12">
              <div className="flex text-white text-center flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
                <h1 className="font-extrabold text-center text-4xl lg:text-6xl tracking-tight md:-mb-4">
                  Automate, enrich, and qualify your inbound leads
                </h1>
                <p className="text-lg opacity-80 text-center leading-relaxed  pb-4 md:pb-0">
                  We build solutions for the future. We&apos;ll integrate your existing systems into a decision making agent, designed to complete a range of sales and operational tasks.<br /><br /><span className='font-bold underline'>Supercharge your dealflow.</span>
                </p>
              </div>
              <div className='flex flex-col items-center justify-center w-full p-2 lg:p-4 pb-0 lg:pb-4'>
                <ButtonLead />
                <TestimonialsAvatars />
              </div>
              <div className="relative flex justify-center">
                {/* <video
                  className={style}
                  autoPlay
                  muted
                  loop
                  playsInline
                  controls
                  width={size.width}
                  height={size.height}
                >
                  <source src={path} type="video/webm" />
                </video> */}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HeroVideo;
