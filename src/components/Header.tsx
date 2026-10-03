"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from "next/link";
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  showNavLinks?: boolean;
}

const NAV_LINKS = [
  { href: 'https://status.wheeloh.com', label: 'Status' },
  { href: '/#features', label: 'Features' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/engineering', label: 'Engineering' },
  { href: '/#contact', label: 'Contact' },
];

export default function Header({ showNavLinks = true }: HeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative px-4 lg:px-6 h-14 flex items-center"
    >
      <Link href="/" className="flex items-center justify-center" prefetch={false}>
        <img src="/applogo.svg" alt="Wheeloh" className='w-20' />
      </Link>
      {showNavLinks && (
        <>
          {/* Desktop nav */}
          <nav className="ml-auto hidden md:flex gap-4 sm:gap-6">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="text-sm font-medium hover:underline underline-offset-4" prefetch={false}>
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="ml-auto md:hidden p-2 -mr-2"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <AnimatePresence>
            {open && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full z-50 flex flex-col border-b bg-background px-4 py-2 shadow-lg md:hidden"
              >
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="py-3 text-sm font-medium border-b last:border-b-0"
                    prefetch={false}
                  >
                    {link.label}
                  </Link>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.header>
  );
}
