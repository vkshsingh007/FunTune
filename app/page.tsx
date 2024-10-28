"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Music, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Appbar from "./components/Appbar";
import Redirect from "./components/Redirect";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-purple-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Music className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          <span className="text-2xl font-bold">FanTune</span>
        </div>
        <Appbar />
        <Redirect />
      </header>

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400">
            Let Your Fans Drive the Beat
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            FanTune empowers creators to stream music chosen by their audience,
            creating an interactive and engaging experience like never before.
          </p>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-colors duration-300">
            Get Started
          </Button>
        </section>

        <section id="features" className="bg-white dark:bg-gray-800 py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Why Choose FanTune?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={
                  <Users className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                }
                title="Fan Engagement"
                description="Boost interaction by letting your audience pick the soundtrack to your stream."
              />
              <FeatureCard
                icon={
                  <Zap className="h-12 w-12 text-pink-600 dark:text-pink-400" />
                }
                title="Real-time Voting"
                description="Seamless, instant music selection based on live audience preferences."
              />
              <FeatureCard
                icon={
                  <Music className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                }
                title="Vast Music Library"
                description="Access millions of tracks to keep your stream fresh and exciting."
              />
            </div>
          </div>
        </section>

        <section id="creators" className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Revolutionize Your Streams?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of creators who are taking their music streams to
              the next level with FanTune.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 transform hover:scale-105">
              Start Streaming Now <ArrowRight className="ml-2 h-5 w-5 inline" />
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-gray-100 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Music className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-semibold">FanTune</span>
          </div>
          <nav className="flex space-x-4">
            <a
              href="#"
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              About
            </a>
            <a
              href="#"
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Privacy
            </a>
            <a
              href="#"
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Terms
            </a>
            <a
              href="#"
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Contact
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-purple-50 dark:bg-gray-700 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300 text-center">
        {description}
      </p>
    </div>
  );
}
