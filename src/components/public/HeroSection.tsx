"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { buttonClassName } from "@/components/ui/Button";
import { gameOptions } from "@/lib/utils";

export default function HeroSection() {
  return (
    <section
      className="relative isolate left-1/2 flex -translate-x-1/2 items-center overflow-hidden"
      style={{ width: "100vw", minHeight: "100svh" }}
    >
      <Image
        src="/images/hero-gaming-lounge.png"
        alt="Gamers playing together in a premium gaming lounge"
        fill
        priority
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,20,44,0.28)_0%,rgba(6,20,44,0.46)_38%,rgba(6,20,44,0.72)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,87,255,0.26),transparent_44%)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-20 pt-32 sm:px-6 lg:px-8 lg:pb-28 lg:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mx-auto max-w-4xl space-y-8 text-center"
        >
          <div className="space-y-5">
            <h1 className="mx-auto max-w-4xl font-heading text-5xl font-semibold leading-[1.02] tracking-tight text-white drop-shadow-[0_18px_50px_rgba(2,10,24,0.45)] sm:text-6xl lg:text-[5.4rem]">
              Buy and sell verified gaming accounts safely.
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-8 text-blue-50/92">
              Gaming Index helps gamers list, discover, and trade accounts with a
              cleaner account flow, seller KYC checks, and admin review.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/marketplace" className={buttonClassName({ size: "lg" })}>
              Explore Marketplace
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/auth/register"
              className={buttonClassName({ variant: "secondary", size: "lg" })}
            >
              Become a Seller
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {gameOptions.map((game) => (
              <span
                key={game}
                className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_30px_-20px_rgba(2,10,24,0.8)] backdrop-blur-md"
              >
                {game}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
