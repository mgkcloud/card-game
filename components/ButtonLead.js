"use client";

import { useState, useRef } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/libs/api";

// This component is used to collect the emails from the landing page
// You'd use this if your product isn't ready yet or you want to collect leads
// For instance: A popup to send a freebie, joining a waitlist, etc.
// It calls the /api/lead/route.js route and store a Lead document in the database
const ButtonLead = ({ extraStyle }) => {
  const emailInputRef = useRef(null);
  const processInputRef = useRef(null);
  const [email, setEmail] = useState("");
  const [process, setProcess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();

    setIsLoading(true);
    try {
      await apiClient.post("/lead", { email, process });

      toast.success("Thanks! We're generating your agents...");

      // just remove the focus on the inputs
      emailInputRef.current.blur();
      processInputRef.current.blur();
      setEmail("");
      setProcess("");
      setIsDisabled(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form
      className={`w-full max-w-xs space-y-3 ${extraStyle ? extraStyle : ""}`}
      onSubmit={handleSubmit}
      netlify
    >

      <input
        required
        type="text"
        value={process}
        ref={processInputRef}
        placeholder="A task you're looking to automate"
        className="input input-bordered w-full placeholder:opacity-60"
        onChange={(e) => setProcess(e.target.value)}
      />

      <input
        required
        type="email"
        value={email}
        ref={emailInputRef}
        autoComplete="email"
        placeholder="your@business-email.com"
        className="input input-bordered w-full placeholder:opacity-60"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input type="hidden" name="lead-form" value="main_lead_form" />

   
      <button
        className="btn btn-primary btn-block"
        type="submit"
        disabled={isDisabled}
      >
        Generate now
        {isLoading ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5 10a.75.75 0 01.75-.75h6.638L10.23 7.29a.75.75 0 111.04-1.08l3.5 3.25a.75.75 0 010 1.08l-3.5 3.25a.75.75 0 11-1.04-1.08l2.158-1.96H5.75A.75.75 0 015 10z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      <div data-netlify-recaptcha="true"></div>
    </form>
  );
};

export default ButtonLead;
