/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/",
        has: [
          {
            type: "cookie",
            key: "group",
          },
        ],
        permanent: false,
        destination: "/:group",
      },
    ];
  },
};

module.exports = nextConfig;
