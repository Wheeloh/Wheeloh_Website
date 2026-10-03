"use client";
import { motion } from 'framer-motion';
import Link from "next/link";
import { Heart } from 'lucide-react';
import { APP_STORE_URL, PLAY_STORE_URL, STATUS_URL, CONTACT_EMAIL, INSTAGRAM_URL, TIKTOK_URL } from "@/lib/seo";

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
      <div className="container grid gap-8 px-4 md:px-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center" prefetch={false}>
            <img src="/applogo.svg" alt="Wheeloh" className='w-12' />
          </Link>
          <p className="text-sm text-muted-foreground max-w-xs">
            The car-spotting app for enthusiasts. Spot, identify and collect the rarest cars around you.
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Product</p>
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
          <p className="text-sm font-semibold">Legal</p>
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
          <p className="text-sm font-semibold">Get the app</p>
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

        <nav className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Follow us</p>
          <Link href={INSTAGRAM_URL} prefetch={false} className="text-sm text-muted-foreground hover:underline underline-offset-4">
            Instagram
          </Link>
          <Link href={TIKTOK_URL} prefetch={false} className="text-sm text-muted-foreground hover:underline underline-offset-4">
            TikTok
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