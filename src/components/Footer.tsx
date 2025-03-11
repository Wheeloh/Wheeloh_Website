"use client";
import { motion } from 'framer-motion';
import Link from "next/link";

export default function Footer() {
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
            © 2025 Wheeloh. Tous droits réservés.
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
    </motion.footer>
  );
}