"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";


const Navbar = () => {
    const { theme, setTheme } = useTheme();
    const toggleTheme = () => 
      setTheme(theme === "light"? "dark" : "light");
    
  return (
    <nav className="flex justify-between items-center px-4 h-16 bg-primary/30 text-foreground">
      <span className="font-bold text-xl">NoPass</span>
      <ul className="flex gap-5 items-center justify-start">
        <li>Home</li>
        <li>About</li>
        <li>Contact</li>
        <li>Service</li>
      </ul>
      <div className="flex gap-4 justify-center items-center">

            <Button variant="outline" size="icon" onClick={toggleTheme}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>


        <SignedOut>
          <SignInButton />
          <SignUpButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
