/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Permet d'importer Leaflet côté client uniquement
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'leaflet': require.resolve('leaflet'),
    };
    return config;
  },
};

module.exports = nextConfig;
