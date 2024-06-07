/* eslint-disable @next/next/no-img-element */
import React from "react";

const features = [
  {
    title: "Sales Chatbot for your prospects",
    description:
      "Crawl your knowledge-base and provide support with tailored answers.",
    styles: "bg-primary text-primary-content",
    demo: (
      <div className="overflow-hidden h-full flex items-stretch">
        <div className="w-full translate-x-12 bg-base-200 rounded-t-box h-full p-6">
          <p className="font-medium uppercase tracking-wide text-base-content/60 text-sm mb-3">
            Ask a question
          </p>
          <div
            className="relative textarea py-4 h-full mr-12 bg-base-100 border-base-content/10 text-base-content"
            placeholder="Feature on/off option for different pages"
          >

            <div className="chat chat-start ">
              <div className="chat-image avatar">
              
              </div>
              <div className="chat-bubble">Do you offer SEO services for Dentists?</div>
            </div>
            <div className="chat chat-end opacity-0 group-hover:opacity-100 duration-1000 pt-2">
              <div className="chat-image avatar">
                <div className="w-10 rounded-full">
                </div>
              </div>
              <div className="chat-bubble">Our base healthcare SEO package provides authoritarian links and content suitible for your audience, would you like to learn more about our package options?
              </div>
            </div>

            <button className="btn shadow-lg btn-primary absolute right-4 bottom-6 opacity-100 group-hover:opacity-0 duration-1000">
              Submit
            </button>





          </div>
        </div>
      </div>
    ),
  },
  {
    title: "Allocate leads to the right salesperson. Easy.",
    description: "Auto-categorisation can reduce your lead response time from 24 hours+ to less than 20 minutes.",
    styles: "md:col-span-2 bg-base-300 text-base-content ",
    demo: (
      <div className="px-6 max-w-[600px] flex flex-col gap-4 overflow-hidden ">
        {[
          {
            title: "Heath Moore, Director",
            description: "Sector: Health, Status: Book dicovery",
            allowed: true,
          },
          {
            title: "Clive Lee, Founder and Director, Professional",
            description: "Sector: Self improvement/ Life coaching, Status: Reject",
            allowed: false,
          },
          {
            title: "Mike Power, Managing Director",
            description: "Sector: Finance, Status: Book dicovery",
            allowed: true,
          },
          {
            title: "Michelle York, Marketing Assistant",
            description: "Sector: Business, Status: Reject",
            allowed: false,
          },
          {
            title: "Todd Glean, Insurance Agent",
            description: "Sector: Finance, Status: Book dicovery",
            allowed: true,
          },

        ].map((feature, i) => (
          <div
            className={`p-4 bg-base-100 text-base-content rounded-box flex justify-between mb-2 gap-4 ${i === 0 ? "group-hover:-mt-24 group-hover:opacity-0 duration-500" : ""}`}
            key={i}
          >
            <div>
              <p className="font-semibold mb-1">{feature.title}</p>
              <p className="text-base-content-secondary">
                {feature.description}
              </p>
            </div>
            <button
              className={`px-4 py-2 rounded-box group text-center text-lg duration-150 border border-transparent bg-primary text-primary-content`}
            >
              {feature.allowed ? "✅" : "❌"}
            </button>
          </div>
        ))}
      </div>
    ),
  },
  {
    title: "BYO website, and the rest of your marketing stack. We'll do the rest.",
    description: "We've worked with Ecom platforms, CRMs, Analytics, Email marketing, of various shapes and sizes. We'll connect the dots to make your data work for you.",
    styles: "md:col-span-2 bg-base-100 text-base-content",
    demo: (
      <div className="flex left-0 w-full h-full pt-0 lg:pt-8 overflow-hidden -mt-4">
        <div className="-rotate-[8deg] flex min-w-max overflow-x-visible h-full lg:pt-4">
          {[
            {
              buttonStyles: "",
              css: "-ml-1 rotate-[6deg] w-72 h-72 bg-base-200 text-base-content bg-primary rounded-2xl group-hover:-ml-64 group-hover:opacity-0 group-hover:scale-75 transition-all duration-500 p-4",
              cardTitle: "CRM",
              softwareTitle: "Hubspot",
              softwareTitle2: "Pipedrive",
            },
            {
              buttonStyles: "",
              css: "rotate-[6deg] bg-base-200 text-base-content bg-secondary  w-72 h-72 -mr-20 -ml-20 rounded-xl p-4",
              cardTitle: "Analytics",

              softwareTitle: "GA4",
              softwareTitle2: "Twilio Segment",

            },
            {
              buttonStyles: "",
              css: "rotate-[6deg] bg-base-200 text-base-content bg-accent  w-72 h-72 rounded-xl p-4",
              cardTitle: "Lead Forms",

              softwareTitle: "Wordpress Forms",
              softwareTitle2: "Conversion Pages",
            },
            {
              buttonStyles: "",
              css: "rotate-[6deg] bg-neutral bg-base-200 text-base-content w-72 h-72 -ml-20 rounded-xl p-4",
              cardTitle: "Booking",

              softwareTitle: "Chilipiper",
              softwareTitle2: "Calendly",
            },
          ].map((theme, i) => (
            <div className={theme.css} key={i}>
              <div className={`font-medium uppercase text-center tracking-wide ${i == 2 ? ("text-base") : ("text-white")} text-sm mb-3`}>
                {theme.cardTitle}
              </div>
              <div className="space-y-2">
                <div className="p-4 bg-base-100 rounded-box flex justify-between">
                  <div>
                    <p className="font-semibold mb-1">{theme.softwareTitle}</p>

                  </div>

                </div>
                <div className="p-4 bg-base-100 rounded-box flex justify-between ${theme.buttonStyles}">
                  <div>
                    <p className="font-semibold mb-1">{theme.softwareTitle2}</p>

                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    title: "Have another idea?",
    description: "The possibilities are endless when it comes to automating almost any repetive task. Let's see how you can automate your workflow.",
    styles: "bg-neutral text-neutral-content",
    demo: (
      <div className="text-neutral-content px-6 space-y-4">
        {[
          {
            id: 1,
            text: "Can we automate customer support replies for our SaaS product?",
            userName: "Marc Lou",
            createdAt: "2024-09-01T00:00:00Z",
          },
          {
            id: 2,
            text: "Certainly, we can create agents for any administrative or sales task.",
            userName: "William V.",
            createdAt: "2024-09-02T00:00:00Z",
            transition:
              "opacity-0 group-hover:opacity-100 duration-500 translate-x-1/4 group-hover:translate-x-0",
          },
        ]?.map((reply) => (
          <div
            key={reply.id}
            className={`px-6 py-4 bg-neutral-content text-neutral rounded-box ${reply?.transition}`}
          >
            <div className="mb-2 whitespace-pre-wrap">{reply.text}</div>
            <div className="text-neutral/80 flex items-center gap-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="avatar">
                  <div className="w-7 rounded-full">
                  </div>
                </div>
                <div className=""> {reply.userName} </div>
              </div>
              •
              <div>
                {new Date(reply.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
];
const FeaturesGrid = () => {
  return (
    <section className="flex justify-center items-center w-full bg-base-200/50 text-base-content">
      <div className="flex flex-col max-w-[82rem] gap-16 md:gap-20 px-4 max-w-7xl mx-auto px-8 py-16 md:py-32 text-center md:text-start">
        <h2 className="max-w-4xl font-black text-4xl md:text-6xl tracking-[-0.01em]">
          Enhance your sales<br />with
          <span className="underline decoration-dashed underline-offset-8 decoration-base-300">
            &nbsp;AI-Driven&nbsp;
          </span><br />
          automation {" "}
        </h2>
        <div className="flex flex-col w-full h-fit gap-4 lg:gap-10 text-text-default max-w-[82rem]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-10">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.styles} rounded-3xl flex flex-col gap-6 w-full h-[24rem] lg:h-[28rem] pt-6 overflow-hidden group`}
              >
                <div className="px-6 space-y-2">
                  <h3 className="font-bold text-xl lg:text-3xl tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="opacity-80">{feature.description}</p>
                </div>
                {feature.demo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
