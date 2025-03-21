const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "www.feistyagency.com",
    ],
  },
};

module.exports = nextConfig;
