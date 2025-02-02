import themes from "daisyui/src/theming/themes";

const config = {
  // REQUIRED
  appName: "Feisty Agency",
  // REQUIRED: a short description of your app for SEO tags (can be overwritten)
  appDescription:
    "Supercharge your dealflow. We'll integrate your existing systems into a decision making agent, designed to complete a range of sales and operational tasks.",
  // REQUIRED (no https://, not trialing slash at the end, just the naked domain)
  domainName: "www.feistyagency.com",
  crisp: {
    // Crisp website ID. IF YOU DON'T USE CRISP: just remove this => Then add a support email in this config file (mailgun.supportEmail) otherwise customer support won't work.
    id: "",
    // Hide Crisp by default, except on route "/". Crisp is toggled with <ButtonSupport/>. If you want to show Crisp on every routes, just remove this below
    onlyShowOnRoutes: ["/"],
  },
  stripe: {
    // Create multiple plans in your Stripe dashboard, then add them here. You can add as many plans as you want, just make sure to add the priceId
    plans: [
      {
        // REQUIRED — we use this to find the plan in the webhook (for instance if you want to update the user's credits based on the plan)
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1Niyy5AxyNprDp7iZIqEyD2h"
            : "price_456",
        //  REQUIRED - Name of the plan, displayed on the pricing page
        name: "Starter Exploration Milestone",
        // A friendly description of the plan, displayed on the pricing page. Tip: explain why this plan and not others
        description: "Get an actionable plan to kickstart your AI transformation",
        // The price you want to display, the one user will be charged on Stripe.
        price: 499,
        // If you have an anchor price (i.e. $29) that you want to display crossed out, put it here. Otherwise, leave it empty
        priceAnchor: 699,
        feature: "",
        features: [
          {
            name: "Expected generated outputs",
          },
          { name: "First-reply email templates" },
          { name: "Technology recommendation" },
        ],
      },
      {
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: true,
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNprDp8iftKnrrpw"
            : "price_457",
        name: "Advanced Exploration Milestone",
        description: "Get a more robust plan to help you implement AI lead categorisiation",
        price: 797,
        priceAnchor: 999,
        feature: "",
        features: [
          {
            name: "5 Day, in-depth AI Exploration",
          },
          { name: "Technology scoping and recommendation" },
          { name: "Quality score (output accuracy measurement)" },
          { name: "Includes Starter Exploration Milestone" },
        ],
      },
      {
        // This plan will look different on the pricing page, it will be highlighted. You can only have one plan with isFeatured: true
        isFeatured: false,
        priceId:
          process.env.NODE_ENV === "development"
            ? "price_1O5KtcAxyNpr4p7iftKnrrpw"
            : "price_426",
        name: "End-to-end Sales Automation",
        description: "Custom lead qualification, routing and first-reply automation for your sales team",
        feature: "",
        features: [
          {
            name: "1-on-1 support",
          },
          { name: "Guaranteed output similarity" },
          { name: "CRM data collection" },
          { name: "BYO marketing stack" },
          { name: "Upgradable" },

        ],
      },
    ],
  },
  aws: {
    // If you use AWS S3/Cloudfront, put values in here
    bucket: "bucket-name",
    bucketUrl: `https://bucket-name.s3.amazonaws.com/`,
    cdn: "https://cdn-id.cloudfront.net/",
  },
  mailgun: {
    // subdomain to use when sending emails, if you don't have a subdomain, just remove it. Highly recommended to have one (i.e. mg.yourdomain.com or mail.yourdomain.com)
    subdomain: "send",
    // REQUIRED — Email 'From' field to be used when sending magic login links
    fromNoReply: `Feisty Agency <will@feistyagency.com>`,
    // REQUIRED — Email 'From' field to be used when sending other emails, like abandoned carts, updates etc..
    fromAdmin: `Will at Feisty Agency <will@feistyagency.com>`,
    // Email shown to customer if need support. Leave empty if not needed => if empty, set up Crisp above, otherwise you won't be able to offer customer support."
    supportEmail: "will@feistyagency.com",
    // When someone replies to supportEmail sent by the app, forward it to the email below (otherwise it's lost). If you set supportEmail to empty, this will be ignored.
    forwardRepliesTo: "will@feistyagency.com",
  },
  colors: {
    // REQUIRED — The DaisyUI theme to use (added to the main layout.js). Leave blank for default (light & dark mode). If you any other theme than light/dark, you need to add it in config.tailwind.js in daisyui.themes.
    theme: "light",
    // REQUIRED — This color will be reflected on the whole app outside of the document (loading bar, Chrome tabs, etc..). By default it takes the primary color from your DaisyUI theme (make sure to update your the theme name after "data-theme=")
    // OR you can just do this to use a custom color: main: "#f37055". HEX only.
    main: themes["light"]["primary"],
  },
  auth: {
    // REQUIRED — the path to log in users. It's use to protect private routes (like /dashboard). It's used in apiClient (/libs/api.js) upon 401 errors from our API
    loginUrl: "/signin",
    // REQUIRED — the path you want to redirect users after successfull login (i.e. /dashboard, /private). This is normally a private page for users to manage their accounts. It's used in apiClient (/libs/api.js) upon 401 errors from our API & in ButtonSignin.js
    callbackUrl: "/cards",
  },
};

export default config;
