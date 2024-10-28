"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Music, Users, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Appbar = () => {
  const session = useSession();

  return (
    <>
      <nav className="hidden md:flex space-x-4">
        <a
          href="#features"
          className="hover:text-purple-600 dark:hover:text-purple-400"
        >
          Features
        </a>
        <a
          href="#creators"
          className="hover:text-purple-600 dark:hover:text-purple-400"
        >
          For Creators
        </a>
        {/* <a
          href="#"
          className="hover:text-purple-600 dark:hover:text-purple-400"
        >
          Login
        </a> */}
      </nav>
      {/* <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button> */}

      {session.data?.user ? (
        <Button
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full text-md transition-colors duration-300"
          onClick={() => signOut()}
        >
          SignOut
        </Button>
      ) : (
        <Button
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-5 rounded-full text-md transition-colors duration-300"
          onClick={() => signIn()}
        >
          Sign in
        </Button>
      )}
    </>
  );
};

export default Appbar;
