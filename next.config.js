const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      // NextJS <Image> component needs to whitelist domains for src={}
      "www.feistyagency.com",
    ],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.wgsl$/i,
      type: 'asset/source',
    });
    return config;
  },
};

module.exports = nextConfig;
