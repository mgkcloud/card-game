import { useState, useEffect, useRef } from "react";
import config from "@/config";
import Modal from "@/components/Modal"; // Import the Modal component
import ButtonLead from "@/components/ButtonLead";
import TronBackground from "@/components/TronBackground"; // Import the TronBackground component

const CTA = () => {
  const [leads, setLeads] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ctaRef = useRef(null);

  const calculateLeads = () => {
    const now = new Date();
    const baseLeads = 500000;
    const day = now.getDate();
    const month = now.getMonth() + 1; // Months are zero-indexed
    const year = now.getFullYear();

    // Seed a pseudo-random number generator with the current date
    const seed = year * 10000 + month * 100 + day;
    const random = (seed) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    // Calculate the number of leads based on the current date
    const dailyIncrease = Math.floor(random(seed) * (50000 - 10000 + 1)) + 10000;
    return baseLeads + dailyIncrease;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const targetLeads = calculateLeads();
          let currentLeads = 0;
          const increment = Math.ceil(targetLeads / 100); // Adjust the increment as needed

          // Start the interval to update the leads
          const interval = setInterval(() => {
            currentLeads += increment;
            if (currentLeads >= targetLeads) {
              currentLeads = targetLeads;
              clearInterval(interval);
            }
            setLeads(currentLeads);
          }, 10); // Adjust the interval time (in milliseconds) as needed
        }
      },
      { threshold: 0.3 } // Adjust the threshold as needed
    );

    if (ctaRef.current) {
      observer.observe(ctaRef.current);
    }

    // Cleanup the observer on component unmount
    return () => {
      if (ctaRef.current) {
        observer.unobserve(ctaRef.current);
      }
    };
  }, [hasAnimated]);

  // Add a resize event listener to ensure the animation only triggers once
  useEffect(() => {
    const handleResize = () => {
      if (hasAnimated) {
        window.removeEventListener('resize', handleResize);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [hasAnimated]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <section ref={ctaRef} className="relative hero overflow-hidden min-h-screen">
      <TronBackground startAnimation={hasAnimated} />
      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative hero-content text-center text-neutral-content p-8">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="font-bold text-3xl md:text-5xl tracking-tight mb-8 md:mb-12">
            Routed <span className="inline-block font-mono">{leads.toLocaleString()}</span>+<br />
            qualified leads to<br />
            <span className="underline decoration-dashed underline-offset-8 decoration-base-300">
              &nbsp;happier&nbsp;
            </span>
            salespeople
          </h2>

          <p className="text-lg opacity-80 mb-12 md:mb-16">
            Join 1M+ MRR B2B businesses that have transformed their sales and operational processes with Feisty Agency. Our AI-driven automation solutions are designed to enhance your deal flow, reduce response times, and integrate seamlessly with your existing systems.
          </p>
          <button className="btn btn-primary btn-wide" onClick={openModal}>
            Get Started
          </button>
          {/* Modal component */}
          <Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
            <ButtonLead />
          </Modal>
        </div>
      </div>
    </section>
  );
};

export default CTA;
