"use client";
import { motion } from 'framer-motion';
import Link from "next/link";
import { Heart } from 'lucide-react';
import { APP_STORE_URL, PLAY_STORE_URL, STATUS_URL, CONTACT_EMAIL } from "@/lib/seo";

const PRODUCT_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/changelog", label: "Changelog" },
  { href: "/engineering", label: "Engineering" },
  { href: STATUS_URL, label: "Status", external: true },
];

const LEGAL_LINKS = [
  { href: "/legal", label: "Legal Information" },
  { href: "/cgu", label: "CGU" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/community-standards", label: "Community Standards" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full border-t py-6"
    >
      <div className="container grid gap-8 px-4 md:px-6 md:grid-cols-4">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center" prefetch={false}>
            <img src="/applogo.svg" alt="" className='w-12' />
            <span className="sr-only">Wheeloh</span>
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            The car-spotting app for enthusiasts. Spot, identify and collect the rarest cars around you.
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Product</h2>
          {PRODUCT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Legal</h2>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold">Get the app</h2>
          <Link href={APP_STORE_URL} prefetch={false} className="text-sm text-muted-foreground hover:underline underline-offset-4">
            Download on the App Store
          </Link>
          <Link href={PLAY_STORE_URL} prefetch={false} className="text-sm text-muted-foreground hover:underline underline-offset-4">
            Get it on Google Play
          </Link>
          <Link href={`mailto:${CONTACT_EMAIL}`} className="text-sm text-muted-foreground hover:underline underline-offset-4">
            Contact
          </Link>
        </nav>
      </div>
      <div className="container px-4 md:px-6">
        <p className="text-sm text-muted-foreground mt-8">
          © {currentYear} Wheeloh. All rights reserved.
        </p>
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