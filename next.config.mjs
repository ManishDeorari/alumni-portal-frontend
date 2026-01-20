/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: [
      "res.cloudinary.com", // for Cloudinary uploads
      "localhost",          // for local testing
      // "images.unsplash.com", // add more if needed
    ],
  },
};

export default nextConfig;
