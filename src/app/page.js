"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import Link from "next/link";

const sectionVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 50 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -30 },
};

const sections = [
  {
    id: "hero",
    content: (
      <>
        <h1 className="text-6xl font-bold mb-4">Welcome to the Alumni Portal</h1>
        <p className="text-2xl mb-6">Connect, Network, and Grow with Your Alumni Community</p>
        <div className="flex space-x-4 justify-center">
          <Link href="/auth/signup">
            <motion.button 
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform"
              whileHover={{ scale: 1.1 }}
            >
              Sign Up
            </motion.button>
          </Link>
          <Link href="/auth/login">
            <motion.button 
              className="bg-transparent border border-white text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:bg-white hover:text-blue-700 transition-all"
              whileHover={{ scale: 1.1 }}
            >
              Login
            </motion.button>
          </Link>
        </div>
      </>
    )
  },
  {
    id: "about",
    content: (
      <>
        <h2 className="text-5xl font-bold text-white mb-6">About Us</h2>
        <p className="text-2xl text-white max-w-4xl mx-auto">
          The Alumni Portal is designed to connect graduates, foster professional relationships, and celebrate achievements within our university community.
        </p>
      </>
    )
  },
  {
    id: "events",
    content: (
      <>
        <h2 className="text-5xl font-bold text-white mb-6">Upcoming Events</h2>
        <p className="text-2xl text-white max-w-4xl mx-auto">
          Stay updated with the latest alumni meetups, networking events, and university functions.
        </p>
      </>
    )
  },
  {
    id: "testimonials",
    content: (
      <>
        <h2 className="text-5xl font-bold text-white mb-6">Alumni Testimonials</h2>
        <p className="text-2xl text-white max-w-4xl mx-auto">
          Read inspiring stories from our successful alumni and see how they have grown in their careers.
        </p>
      </>
    )
  },
  {
    id: "contact",
    content: (
      <>
        <h2 className="text-5xl font-bold text-white mb-6">Contact Us</h2>
        <p className="text-2xl text-white max-w-4xl mx-auto mb-6">
          Have questions or need support? Reach out to us!
        </p>
        <div className="flex justify-center items-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-3 border border-gray-400 rounded-md w-80 text-gray-800 bg-white shadow-md focus:outline-none"
          />
          <button className="bg-blue-600 text-white px-6 py-3 rounded-md ml-4 hover:bg-blue-700 shadow-md">
            Send
          </button>
        </div>
      </>
    )
  }
];

export default function HomePage() {
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll(".section");
      const triggerBottom = window.innerHeight * 0.9;

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top < triggerBottom && rect.bottom > 0) {
          section.classList.add("animate-visible");
        } else {
          section.classList.remove("animate-visible");
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative bg-gradient-to-b from-blue-600 to-purple-700 min-h-screen">
      <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 z-50">
        <div
          className="h-full bg-white transition-all duration-300 ease-in-out"
          style={{ width: "100%" }}
        ></div>
      </div>

      <nav className="sticky top-0 z-40 bg-gradient-to-r from-blue-600 to-purple-700 text-white shadow-md py-4 px-6 flex justify-between">
        <h1 className="text-xl font-bold">Alumni Portal</h1>
        <div className="space-x-4">
          <a href="#about" className="hover:text-gray-200">About</a>
          <a href="#events" className="hover:text-gray-200">Events</a>
          <a href="#testimonials" className="hover:text-gray-200">Testimonials</a>
          <a href="#contact" className="hover:text-gray-200">Contact</a>
        </div>
      </nav>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className="section flex flex-col items-center justify-center h-screen text-white text-center transition-all duration-700 px-4"
        >
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 1.0 }}
            className="opacity-0 animate-visible"
          >
            {section.content}
          </motion.div>
        </section>
      ))}

      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">© 2025 Graphic ERA Hill University. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <FaFacebook className="text-xl hover:text-blue-500 transition-colors" />
            <FaTwitter className="text-xl hover:text-blue-400 transition-colors" />
            <FaInstagram className="text-xl hover:text-pink-500 transition-colors" />
            <FaLinkedin className="text-xl hover:text-blue-600 transition-colors" />
          </div>
        </div>
      </footer>
    </div>
  );
}
