// HeroVideo.js
"use client";

import { useState } from 'react';
import Image from 'next/image';
import ButtonLead from "@/components/ButtonLead";

const HeroVideo = () => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlay = () => {
        setIsPlaying(true);
    };
    const style = "rounded-2xl aspect-square w-full sm:w-[26rem]";
    const size = {
        width: 500,
        height: 500,
    };
    const path = 'https://d3m8mk7e1mf7xn.cloudfront.net/app/newsletter.webm';

    return (
        <section className="relative hero overflow-hidden min-h-65 flex items-center justify-center bg-black">
            <div className="relative w-full max-w-4xl">

                <div className="relative">

                    <div className="flex text-white text-center flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">

                        <h1 className="font-extrabold text-center text-4xl lg:text-6xl tracking-tight md:-mb-4">
                            Automate, encrich, and qualify your inbound leads
                        </h1>
                        <p className="text-lg opacity-80 text-center leading-relaxed">
                            We build solutions for the future. We'll integrate your existing systems and tools into a decision making system, designed to complete a range of admin and operational tasks. Supercharge your dealflow.
                        </p>

                    </div>
                    <div className='flex flex-col items-center justify-center w-full p-2 lg:p-12 pb-0 lg:pb-4'>

                    <ButtonLead />

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
    );
};

export default HeroVideo;
