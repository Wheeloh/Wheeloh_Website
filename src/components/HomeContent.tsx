"use client";
import { useState, useEffect, useMemo } from 'react'
import Link from "next/link"
import Image from "next/image"
import dynamic from "next/dynamic"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Header from "@/components/Header";
import Footer from '@/components/Footer';
import LazyMount from "@/components/LazyMount";
import { useIsDesktop } from "@/hooks/useIsDesktop";
import { FAQ_ITEMS } from "@/lib/seo";

const Spline = dynamic(() => import('@/components/SplineLazy'), { ssr: false });
const GarageFeature = dynamic(() => import('@/components/GarageFeature'), { ssr: false });
const FilloutStandardEmbed = dynamic(() => import('@/components/FilloutEmbedLazy'), { ssr: false });


interface CardInfo {
  name: string;
  role: string;
  avatar: string;
}

const cards: CardInfo[] = [
  {
    name: "Henri",
    role: "Directeur General",
    avatar: "HA",
  },
  {
    name: "Théophile",
    role: "Directeur Technique",
    avatar: "TB",
  },
  {
    name: "Antoine",
    role: "Directeur Marketing",
    avatar: "AS",
  }
];

const shuffleArray = (array: CardInfo[]): CardInfo[] => {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
};

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

interface LatestUpdate {
  slug: string;
  title: string;
}

export default function Home({ latestUpdate }: { latestUpdate?: LatestUpdate }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [shuffledCards, setShuffledCards] = useState<CardInfo[]>(cards);
  const [maintenanceActive, setMaintenanceActive] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");

  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["Car Spotting", "Car Collecting", "Discovering", "Sharing"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  useEffect(() => {
    setShuffledCards(shuffleArray(cards));

    fetch('/maintenance.json?t=' + new Date().getTime())
      .then(res => res.json())
      .then(data => {
        setMaintenanceActive(!!data.active);
        if (data.message) {
          setMaintenanceMessage(data.message);
        }
      })
      .catch(err => console.error("Could not load maintenance config", err));
  }, []);

  const handleClickAppStore = (e: React.MouseEvent) => {
    if (maintenanceActive) {
      e.preventDefault();
      toast.error(maintenanceMessage || "Wheeloh is currently unavailable on App Store");
    }
  };
  const handleClickPlayStore = (e: React.MouseEvent) => {
    if (maintenanceActive) {
      e.preventDefault();
      toast.error(maintenanceMessage || "Wheeloh is currently unavailable on Play Store");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const embedData = {
      content: "<@&1197274909819293767>",
      embeds: [
        {
          title: "New Contact Form Response",
          fields: [
            { name: "Name", value: name, inline: true },
            { name: "Email", value: email, inline: true },
            { name: "Message", value: message }
          ],
        },
      ],
    };

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL as string, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(embedData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      toast.success('Message sent successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error sending message');
    }
  };

  const isDesktop = useIsDesktop();

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Toaster />
      <Header showNavLinks={true} />
      <main className="flex-1">
        <section id="home" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 ">
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="lg:ml-14 flex flex-col items-center text-center lg:items-start lg:text-left justify-center space-y-4">
                <motion.div variants={fadeInUp} className="space-y-2">
                  {latestUpdate && (
                    <Link
                      href={`/changelog/${latestUpdate.slug}`}
                      className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium hover:bg-muted transition-colors sm:text-sm"
                    >
                      <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">New</span>
                      <span className="truncate">{latestUpdate.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                    </Link>
                  )}
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none flex flex-col items-center lg:items-start font-heading">
                    <span>Master the Art of</span>
                    <span className="relative flex w-full justify-center lg:justify-start overflow-hidden text-center lg:text-left h-[1.2em] mt-1">
                      {titles.map((title, index) => (
                        <motion.span
                          key={index}
                          className="absolute pb-2"
                          initial={{ opacity: 0, y: "-100%" }}
                          transition={{ type: "spring", stiffness: 50 }}
                          animate={
                            titleNumber === index
                              ? {
                                  y: 0,
                                  opacity: 1,
                                }
                              : {
                                  y: titleNumber > index ? "-150%" : "150%",
                                  opacity: 0,
                                }
                          }
                        >
                          {title}
                        </motion.span>
                      ))}
                    </span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Wheeloh is the ultimate car spotting app for enthusiasts. Spot, identify, and collect the rarest cars around you, and share your finds with a passionate community of spotters.
                  </p>
                </motion.div>
                <motion.div variants={fadeInUp} className="flex flex-col gap-2 min-[400px]:flex-row">
                  <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-4 w-full lg:w-auto">
                    {/* App Store Button */}
                    <Link href={maintenanceActive ? "#" : "https://apps.apple.com/fr/app/wheeloh-carspotting/id6746037128?utm_source=website&utm_medium=organic&utm_campaign=app_download"} target={maintenanceActive ? "_self" : "_blank"} onClick={handleClickAppStore} className="inline-flex items-center justify-center rounded-lg bg-black text-white px-3 py-1.5 hover:bg-zinc-800 transition-colors border border-zinc-800 h-10 min-w-[140px]">
                      <svg className="w-5 h-5 mr-2 mb-0.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[9px] font-medium opacity-80">Download on the</span>
                        <span className="text-sm font-bold">App Store</span>
                      </div>
                    </Link>

                    {/* Google Play Button */}
                    <Link href={maintenanceActive ? "#" : "https://play.google.com/store/apps/details?id=com.wheeloh.app&utm_source=website&utm_medium=organic&utm_campaign=app_download&referrer=utm_source%3Dwebsite%26utm_medium%3Dorganic%26utm_campaign%3Dapp_download"} target={maintenanceActive ? "_self" : "_blank"} onClick={handleClickPlayStore} className="inline-flex items-center justify-center rounded-lg bg-black text-white px-3 py-1.5 hover:bg-zinc-800 transition-colors border border-zinc-800 h-10 min-w-[140px]">
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 32 32" fill="currentColor">
                        <path d="M17,14.5l4.2-4.5L4.9,1.2C4.8,1.1,4.6,1.1,4.3,1L17,14.5z" />
                        <path d="M23,21l5.9-3.2c0.7-0.4,1.1-1,1.1-1.8s-0.4-1.5-1.1-1.8L23,11l-4.7,5L23,21z" />
                        <path d="M2.4,1.9C2.1,2.2,2,2.6,2,3V29c0,0.4,0.1,0.8,0.4,1.2L15.6,16L2.4,1.9z" />
                        <path d="M17,17.5L4.3,31c0.2,0,0.4-0.1,0.6-0.2L21.2,22L17,17.5z" />
                      </svg>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[9px] font-medium opacity-80">GET IT ON</span>
                        <span className="text-sm font-bold">Google Play</span>
                      </div>
                    </Link>

                    <Link
                      href="#features"
                      className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-6 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                      prefetch={false}
                    >
                      Learn More
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
                transition={{
                  opacity: { duration: 0.5 },
                  x: { duration: 0.5 },
                  y: {
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                    delay: 0.5
                  }
                }}>
                {isDesktop ? (
                  <Spline className="mx-auto aspect-[346/720] rounded-xl object-cover sm:w-full lg:order-last max-h-[552px] max-w-[300px]" scene="https://prod.spline.design/0UPCp4GVK8DoDLkA/scene.splinecode" />
                ) : (
                  <Image src="/presentation/camera_page_Capturez_une_voiture.png" width={346} height={715} priority sizes="267px" alt="The Wheeloh app camera identifying a car on an iPhone" className="mx-auto aspect-[346/715] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last max-h-[552px] max-w-[267px]" />
                )}
              </motion.div>
            </div>
          </div>
        </section>
        {/* BENTO GRID FEATURES SECTION */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50/50 dark:bg-black/50">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 space-y-4"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Unleash Your Potential</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                A complete ecosystem for car spotters. Collect, share, and compete.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-max">

              {/* Feature 1: Capture (Span 2) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="z-10 md:w-1/2 space-y-4">
                  <h3 className="text-2xl md:text-4xl font-bold">Capture a Car</h3>
                  <p className="text-muted-foreground">
                    Use our smart camera to instantly identify any vehicle and add it to your collection. Curious how it works? Read about our{" "}
                    <Link href="/engineering/semantic-car-search" className="underline underline-offset-4 hover:text-foreground">
                      semantic car search
                    </Link>{" "}
                    over 22,180 models.
                  </p>
                </div>
                <div className="md:w-1/2 flex justify-center items-center">
                  <Image
                    src="/presentation/camera_page_Capturez_une_voiture.png"
                    width={1200}
                    height={2388}
                    sizes="(max-width: 768px) 90vw, 400px"
                    alt="The Wheeloh smart camera identifying a car"
                    className="w-full h-auto max-h-[350px] object-contain drop-shadow-2xl rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </motion.div>

              {/* Feature 2: Share (Span 1) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="col-span-1 md:col-span-1 bg-white dark:bg-zinc-900 rounded-[2rem] p-8 flex flex-col items-center text-center gap-6 overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="z-10 space-y-2">
                  <h3 className="text-2xl font-bold">Share</h3>
                  <p className="text-muted-foreground text-sm">Earn points by sharing your best finds with the community.</p>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                  <Image
                    src="/presentation/feedpage_Partagez_la.png"
                    width={1200}
                    height={2369}
                    sizes="(max-width: 768px) 90vw, 300px"
                    alt="Sharing a car spot in the Wheeloh community feed"
                    className="w-full h-auto max-h-[300px] object-contain drop-shadow-2xl rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </motion.div>

              {/* Feature 3: MAP INTEGRATION (Span 3 / Full Width) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="col-span-1 md:col-span-3 min-h-[500px] bg-black rounded-[2rem] relative overflow-hidden group shadow-2xl flex items-center justify-center"
              >
                {/* Background Image - BRIGHTER */}
                <div className="absolute inset-0 z-0 opacity-85 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src="/presentation/map_background.png"
                    alt=""
                    fill
                    sizes="100vw"
                    className="object-cover object-center"
                  />
                </div>
                {/* Overlay - LIGHTER */}
                <div className="absolute inset-0 z-0" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between w-full px-8 md:px-16 gap-8">
                  <div className="text-center md:text-left space-y-4 max-w-lg">
                    <h3 className="text-3xl md:text-5xl font-bold text-white drop-shadow-xl">Track your Spots</h3>
                    <p className="text-white text-lg md:text-xl font-medium drop-shadow-md">Find the exact location of all your finds on the real-time interactive map.</p>
                  </div>

                  <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="w-full max-w-[300px] md:max-w-[400px]"
                  >
                    <Image
                      src="/presentation/garage_penché_track_spot.png"
                      width={1200}
                      height={1906}
                      sizes="(max-width: 768px) 90vw, 400px"
                      alt="Interactive map showing where cars were spotted"
                      className="w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.6)] transition-all duration-500"
                    />
                  </motion.div>
                </div>
              </motion.div>


              {/* Feature 4: Compete (Span 1) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="col-span-1 md:col-span-1 bg-white dark:bg-zinc-900 rounded-[2rem] p-8 flex flex-col items-center text-center gap-6 overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="z-10 space-y-2">
                  <h3 className="text-2xl font-bold">Compete</h3>
                  <p className="text-muted-foreground text-sm">Climb the global leaderboard and challenge your friends.</p>
                </div>
                <div className="flex-1 flex items-center justify-center w-full">
                  <Image
                    src="/presentation/classement.png"
                    width={1106}
                    height={2184}
                    sizes="(max-width: 768px) 90vw, 300px"
                    alt="Global leaderboard ranking of car spotters"
                    className="w-full h-auto max-h-[300px] object-contain drop-shadow-2xl rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </motion.div>

              {/* Feature 5: Garage (Span 2) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-900 rounded-[2rem] p-8 flex flex-col md:flex-row-reverse items-center justify-between gap-8 overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="z-10 md:w-1/2 space-y-4 text-right">
                  <h3 className="text-2xl md:text-4xl font-bold">Organized Garage</h3>
                  <p className="text-muted-foreground">Find all your cars perfectly sorted in your virtual garage.</p>
                </div>
                <div className="md:w-1/2 flex justify-center items-center w-full">
                  {isDesktop ? (
                    <div className="w-full">
                      <GarageFeature />
                    </div>
                  ) : (
                    <Image
                      src="/presentation/albums_trie.png"
                      width={1200}
                      height={2368}
                      sizes="90vw"
                      alt="Organized virtual garage of collected cars"
                      className="w-full h-auto max-h-[350px] object-contain drop-shadow-2xl rounded-xl transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
              </motion.div>
            </div>

            {/* Split row for last 2 items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Feature 5: Collection */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 flex flex-col items-center gap-6 overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="z-10 space-y-2 text-center">
                  <h3 className="text-2xl font-bold">Brand Collection</h3>
                  <p className="text-muted-foreground">Complete your collection, brand by brand.</p>
                </div>
                <div className="flex justify-center w-full">
                  <Image
                    src="/presentation/brand_list.png"
                    width={1200}
                    height={2020}
                    sizes="(max-width: 768px) 90vw, 400px"
                    alt="Brand collection progress by car manufacturer"
                    className="w-full h-auto max-h-[300px] object-contain drop-shadow-2xl rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </motion.div>

              {/* Feature 6: News */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 flex flex-col items-center gap-6 overflow-hidden relative group shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="z-10 space-y-2 text-center">
                  <h3 className="text-2xl font-bold">Auto News</h3>
                  <p className="text-muted-foreground">
                    Stay informed with the latest news from the automotive world, and follow every app update on our{" "}
                    <Link href="/changelog" className="underline underline-offset-4 hover:text-foreground">changelog</Link>.
                  </p>
                </div>
                <div className="flex justify-center w-full">
                  <Image
                    src="/presentation/automobile_news.png"
                    width={1200}
                    height={2486}
                    sizes="(max-width: 768px) 90vw, 400px"
                    alt="Latest automotive news feed in the Wheeloh app"
                    className="w-full h-auto max-h-[300px] object-contain drop-shadow-2xl rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </section>
        {/*<motion.section id="team"
        initial={{ opacity: 0, x: 0 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Meet the Team</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">The Minds Behind Wheeloh</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Learn more about the talented team that developed Wheeloh.
                </p>
              </div>
              <div className="grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shuffledCards.map((card, index) => (
                  <Card key={index} className="border-0 rounded-none shadow-none">
                    <CardContent className="p-6 bg-muted rounded-lg">
                      <div className="flex flex-col gap-4 items-center">
                        <Avatar className="w-20 h-20 border">
                          {/* <AvatarImage src="/placeholder-user.jpg" /> (fin du commentaire)
                          <AvatarFallback>{card.avatar}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <div className="font-medium">{card.name}</div>
                          <div className="text-sm text-muted-foreground">{card.role}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </motion.section>*/}
        <section id="affiliate" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2"
            >
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Join Us</div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Become an Affiliate</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Join our community of car enthusiasts and enjoy exclusive benefits like special badges and the ability to import your car photos directly into the app.
                  </p>
                </div>
                <div className="hidden md:block">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4 rounded-lg">Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Affiliate Program Application</DialogTitle>
                        <DialogDescription>
                          Review the requirements below before submitting your application.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4" style={{ height: 540 }}>
                        <FilloutStandardEmbed filloutId="3nF36BZAZ3us" />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <motion.div
                variants={fadeInUp}
                className="flex flex-col justify-center items-center space-y-4"
              >
                <div className="bg-muted p-6 rounded-md w-full max-w-md">
                  <h3 className="font-semibold mb-4 text-xl">Affiliate Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 bg-primary rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>Exclusive badge on your profile</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 bg-primary rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>Import your car photos directly</span>
                    </li>
                    {/*<li className="flex items-start">
                      <div className="mr-2 mt-1 bg-primary rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>Featured content in the app</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 bg-primary rounded-full p-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span>Early access to new features</span>
                    </li>*/}
                  </ul>
                </div>
                <div className="md:hidden w-full flex justify-center">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="mt-4">Apply Now</Button>
                    </DialogTrigger>
                    <DialogContent className="w-[calc(100%-2rem)] max-w-[650px] max-h-[90vh] overflow-y-auto">
                      <DialogHeader className="sticky top-0 bg-background pt-4 pb-2 z-10">
                        <DialogTitle>Affiliate Program Application</DialogTitle>
                        <DialogDescription>
                          Review the requirements below before submitting your application.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-2" style={{ height: 480 }}>
                        <FilloutStandardEmbed filloutId="3nF36BZAZ3us" />
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        <section id="faq" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 space-y-2"
            >
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">FAQ</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Frequently Asked Questions</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl">
                Everything you need to know about the Wheeloh car-spotting app.
              </p>
            </motion.div>
            <div className="mx-auto max-w-3xl divide-y rounded-2xl border bg-white dark:bg-zinc-900">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
                    <h3 className="text-lg font-semibold">{item.question}</h3>
                    <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
            <p className="mx-auto max-w-3xl mt-6 text-center text-sm text-muted-foreground">
              Want to go deeper? Read our{" "}
              <Link href="/engineering" className="underline underline-offset-4 hover:text-foreground">engineering deep dives</Link>{" "}
              or browse the latest{" "}
              <Link href="/changelog" className="underline underline-offset-4 hover:text-foreground">product updates</Link>.
            </p>
          </div>
        </section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Get in Touch</div>
                <h2 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem]">
                  Have a Question? Let's Chat.
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Whether you have a question about the app, want to provide feedback, or are interested in partnering
                  with us, we'd love to hear from you.
                </p>
              </motion.div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-start space-y-4">
                {/*<form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
                  <Input type="text" placeholder="Name" className="w-full" value={name} onChange={(e) => setName(e.target.value)}/>
                  <Input type="email" placeholder="Email" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)}/>
                  <Textarea placeholder="Message" className="w-full" value={message} onChange={(e) => setMessage(e.target.value)}/>
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </form>*/}
                <LazyMount minHeight={490} className="w-full max-w-md">
                  <FilloutStandardEmbed filloutId="nbbX3d69vzus" />
                </LazyMount>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
