const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "www.feistyagency.com",
    ],
  },
};

module.exports = nextConfig;
