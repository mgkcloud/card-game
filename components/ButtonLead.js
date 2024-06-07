"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

// This component is used to collect the emails from the landing page
// You'd use this if your product isn't ready yet or you want to collect leads
// For instance: A popup to send a freebie, joining a waitlist, etc.
// It calls the /api/lead/route.js route and store a Lead document in the database
const ButtonLead = ({ extraStyle }) => {
  const [email, setEmail] = useState("");
  const [process, setProcess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append("form-name", "lead-form");
    formData.append("email", email);
    formData.append("process", process);

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (response.ok) {
      toast.success("Thanks! We're generating your agents...");
      setEmail("");
      setProcess("");
      setIsDisabled(true);
      } else {
        toast.error("Something went wrong. Please try again.");
    }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form
        className={`w-full max-w-xs space-y-3 ${extraStyle ? extraStyle : ""}`}
        onSubmit={handleSubmit}
      >
        <input
          required
          type="text"
          value={process}
          placeholder="A task you're looking to automate"
          className="input input-bordered w-full placeholder:opacity-60"
          onChange={(e) => setProcess(e.target.value)}
        />
        <input
          required
          type="email"
          value={email}
          autoComplete="email"
          placeholder="your@business-email.com"
          className="input input-bordered w-full placeholder:opacity-60"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input type="hidden" name="form-name" value="lead-form" />
        <button
          className="btn btn-primary btn-block"
          type="submit"
          disabled={isDisabled}
        >
          Generate now
          {isLoading && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </button>
        <div data-netlify-recaptcha="true"></div>
      </form>
    </>
  );
};

export default ButtonLead;
