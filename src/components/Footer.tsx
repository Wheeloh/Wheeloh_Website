"use client";
import { motion } from 'framer-motion';
import Link from "next/link";
import { Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full border-t py-6"
    >
      <div className="container flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:flex-row">
        <div className="flex gap-4 items-center">
          <Link href="/" className="flex items-center" prefetch={false}>
            <img src="/applogo.svg" alt="" className='w-12' />
            <span className="sr-only">Wheeloh</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            © {currentYear} Wheeloh. All rights reserved.
          </p>
        </div>
        <nav className="flex gap-4 sm:gap-6">
          <Link 
            href="/legal" 
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
            prefetch={false}
          >
            Legal Information
          </Link>
          <Link 
            href="/cgu" 
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
            prefetch={false}
          >
            CGU
          </Link>
          <Link 
            href="/privacy" 
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
            prefetch={false}
          >
            Privacy Policy
          </Link>
          <Link 
            href="/community-standards" 
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
            prefetch={false}
          >
            Community Standards
          </Link>
          <Link 
            href="mailto:contact@wheeloh.com" 
            className="text-sm text-muted-foreground hover:underline underline-offset-4"
          >
            Contact
          </Link>
        </nav>
      </div>
      <div className="border-t border-gray-300 mt-6 pt-6">
        <div className="flex justify-center">
          <p className="text-sm text-gray-500 flex items-center space-x-1">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500" />
            <span>for car enthusiasts</span>
          </p>
        </div>
      </div>
    </motion.footer>
  );
}