"use client";
import { useState, useEffect } from 'react'
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import Spline from '@splinetool/react-spline';
import { motion } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';
import Header from "@/components/Header";
import Footer from '@/components/Footer';
import { FilloutStandardEmbed } from "@fillout/react";

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

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [shuffledCards, setShuffledCards] = useState<CardInfo[]>(cards);

  useEffect(() => {
    setShuffledCards(shuffleArray(cards));
  }, []);

  const handleClickAppStore = () => {
    toast.error("Wheeloh is currently unavailable on App Store")
  };
  const handleClickPlayStore = () => {
    toast.error("Wheeloh is currently unavailable on Play Store")
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
  
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  
  return (
    <div className="flex flex-col min-h-[100dvh]">
      <Toaster/>
      <Header showNavLinks={true} />
      <main className="flex-1">
        <section id="home" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 ">
              <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:ml-14 flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Discover the Cars Around You
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Wheeloh is the ultimate mobile app for car enthusiasts. Identify makes, track rare
                    cars, and share your sightings with passionate friends.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>Download App</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Beta of Wheeloh</DialogTitle>
                        <DialogDescription>
                          {/*This is the beta version of the application, available only on Play Store, so please bear with us.*/}
                          Wheeloh is still in development, so please be patient.
                        </DialogDescription>
                        <div className="flex gap-4">
                          {/*<Link href="https://play.google.com/store/apps" target="_blank" className="inline-flex h-10 items-center justify-center rounded-md  border-input bg-background text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" prefetch={false}>
                            <img src="playstore.svg" alt="Play Store" />
                          </Link>
                          <img onClick={handleClickAppStore} src="applestore.svg" alt="App Store" />*/}

                        </div>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                  <Link
                    href="#features"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                    prefetch={false}
                  >
                    Learn More
                  </Link>
                </div>
              </motion.div>
              <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}>
                {isMobile ? (
                  <img src="/app-screenshot.png"width="346"height="715"alt="App Screenshot"className="mx-auto aspect-[346/715] overflow-hidden rounded-xl object-cover sm:w-full lg:order-last max-h-[552px] max-w-[267px]"/>
                ) : (
                  <Spline className="mx-auto aspect-[346/720] rounded-xl object-cover sm:w-full lg:order-last max-h-[552px] max-w-[300px]" scene="https://prod.spline.design/0UPCp4GVK8DoDLkA/scene.splinecode" />
                )}
              </motion.div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Unlock the Power of Wheeloh</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Wheeloh is packed with features to help you identify, track, and share your car sightings.
                </p>
              </div>
            </motion.div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Identify Makes</h3>
                      <p className="text-muted-foreground">
                        Use the app's image recognition to instantly and locally identify the make of any car you spot.
                        {/*Use the app's advanced image recognition to instantly identify the make and model of any car you spot.*/}
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Earn points</h3>
                      <p className="text-muted-foreground">
                        Invite your friends to take part in the competition between your collections.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="grid gap-1">
                      <h3 className="text-xl font-bold">Share with your friends</h3>
                      <p className="text-muted-foreground">
                        Connect with other car enthusiasts and share your sightings, photos in the app's
                        social feed.
                      </p>
                    </div>
                  </li>
                </ul>
              </motion.div>
              <motion.img
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                src="features.png"
                width="150.79"
                height="310"
                alt="Features"
                className="mx-auto  overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last max-h-[434px] max-w-[211px]"
              />
            </div>
          </div>
        </section>
        <motion.section id="team"
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
                {/* <AvatarImage src="/placeholder-user.jpg" /> */}
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
        </motion.section>
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
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
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start space-y-4">
              {/*<form className="w-full max-w-md space-y-4" onSubmit={handleSubmit}>
                  <Input type="text" placeholder="Name" className="w-full" value={name} onChange={(e) => setName(e.target.value)}/>
                  <Input type="email" placeholder="Email" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)}/>
                  <Textarea placeholder="Message" className="w-full" value={message} onChange={(e) => setMessage(e.target.value)}/>
                  <Button type="submit" className="w-full">
                    Submit
                  </Button>
                </form>*/}
                <div
                  style={{
                    height: 490,
                  }}
                  className="w-full max-w-md"
                >
                  <FilloutStandardEmbed filloutId="nbbX3d69vzus" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
