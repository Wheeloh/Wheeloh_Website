"use client";
import { motion } from 'framer-motion';
import Link from "next/link";

interface HeaderProps {
  showNavLinks?: boolean;
}

export default function Header({ showNavLinks = true }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="px-4 lg:px-6 h-14 flex items-center"
    >
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <img src="/applogo.svg" alt="" className='w-20' />
        <span className="sr-only">Wheeloh</span>
      </Link>
      {showNavLinks && (
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/#features" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Features
          </Link>
          <Link href="/#team" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Team
          </Link>
          <Link href="/#contact" className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
            Contact
          </Link>
        </nav>
      )}
    </motion.header>
  );
} 