/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclure les modules client-only du bundle serveur
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Leaflet et Three.js ne fonctionnent que côté client
      config.externals = [...(config.externals || []), 'leaflet', 'three'];
    }
    return config;
  },
};

module.exports = nextConfig;
