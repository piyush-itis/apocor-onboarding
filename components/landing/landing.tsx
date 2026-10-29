"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

const journey = [
  {
    number: "01",
    title: "Welcome to Apocor",
    owner: "Founder or BD lead",
    provide: "Discovery answers",
    detail: "What you are building, where, and how fast.",
  },
  {
    number: "02",
    title: "Trust & Compliance",
    owner: "Compliance / MLRO",
    provide: "Company documents and policies",
    detail: "Verification, financial crime controls, and customer protection.",
  },
  {
    number: "03",
    title: "Experience & Brand",
    owner: "Product and design",
    provide: "Configuration and brand assets",
    detail: "Runs beside compliance, so the brand work does not wait.",
  },
  {
    number: "04",
    title: "Build & Launch",
    owner: "Engineering and operations",
    provide: "Integration, screens, and sign-off",
    detail: "Sandbox, a pilot, then the first live payment.",
  },
]

const facts = [
  { value: "175M+", label: "Merchants your users can pay" },
  { value: "1", label: "Integration for every major network" },
  { value: "4", label: "Stablecoins: USDC, USDG, EURC, PYUSD" },
]

export function Landing() {
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const scope = root.current
    if (!scope) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduce) return
    const context = gsap.context(() => {
      gsap.from("[data-reveal]", {
        y: 28,
        autoAlpha: 0,
        duration: 1.05,
        stagger: 0.08,
        ease: "power3.out",
      })
    }, scope)
    return () => context.revert()
  }, [])

  return (
    <main ref={root} className="bg-ink text-ivory">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-2xl tracking-tight">
          Apocor
        </Link>
        <Button asChild variant="outline" className="h-10">
          <a href="https://cal.com/rishabjain/synergy-meet">Book a call</a>
        </Button>
      </header>

      <section className="relative overflow-hidden">
        <div className="hero-dots pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <p data-reveal className="text-xs tracking-[0.22em] text-champagne uppercase">
            01 / 04 · Onboarding
          </p>
          <div className="flex max-w-3xl flex-col gap-6">
            <h1 data-reveal className="font-display text-6xl leading-[0.92] text-balance md:text-8xl">
              Launching
              <span className="italic"> with Apocor.</span>
            </h1>
            <p data-reveal className="max-w-xl text-lg leading-relaxed text-ivory/80">
              Tap, scan, and online payments at 175M+ merchants, from a single integration. This is where your launch begins.
            </p>
          </div>
          <div data-reveal className="flex flex-wrap items-center gap-3">
            <Button asChild className="h-11 px-5">
              <Link href="/start">
                Begin onboarding
                <ArrowRightIcon data-icon="inline-end" />
              </Link>
            </Button>
            <a
              className="inline-flex h-11 items-center px-2 text-sm text-ivory/80 underline-offset-4 hover:text-ivory hover:underline"
              href="mailto:rishab@apocor.ai"
            >
              rishab@apocor.ai
            </a>
          </div>
        </div>
      </section>

      <section className="border-t border-ivory/10">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.label} data-reveal className="flex flex-col gap-2">
              <p className="font-display text-4xl text-champagne">{fact.value}</p>
              <p className="max-w-xs text-sm leading-relaxed text-ivory/70">{fact.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-ivory/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-16 md:py-24">
          <div data-reveal className="flex max-w-2xl flex-col gap-3">
            <p className="text-xs tracking-[0.22em] text-champagne uppercase">Your journey</p>
            <h2 className="font-display text-4xl leading-tight md:text-5xl">Four steps to live.</h2>
            <p className="text-ivory/75">
              Trust and Experience run side by side. This form collects every answer, so nothing waits on a PDF in an inbox.
            </p>
          </div>
          <ol className="flex flex-col">
            {journey.map((step) => (
              <li
                key={step.number}
                data-reveal
                className="grid gap-3 border-t border-ivory/10 py-6 md:grid-cols-[5rem_1.4fr_1fr] md:items-baseline md:gap-8"
              >
                <p className="font-display text-2xl text-champagne">{step.number}</p>
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg">{step.title}</h3>
                  <p className="text-sm text-ivory/65">{step.detail}</p>
                </div>
                <p className="text-sm text-ivory/80">
                  <span className="block text-ivory/50">{step.owner}</span>
                  {step.provide}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-ivory/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-16 md:flex-row md:items-end md:justify-between">
          <div data-reveal className="flex max-w-xl flex-col gap-3">
            <h2 className="font-display text-4xl md:text-5xl">Let&apos;s get you live.</h2>
            <p className="text-ivory/75">
              Send your answers here. We walk through the plan, confirm scope, and agree timelines on the launch call.
            </p>
          </div>
          <Button asChild className="h-11 px-5">
            <Link href="/start">
              Begin onboarding
              <ArrowRightIcon data-icon="inline-end" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-ivory/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-ivory/55 md:flex-row md:items-center md:justify-between">
          <p>Powering the next generation of global payments. © 2026 Apocor, Inc.</p>
          <div className="flex flex-wrap gap-4">
            <a className="underline-offset-4 hover:text-ivory hover:underline" href="mailto:rishab@apocor.ai">
              rishab@apocor.ai
            </a>
            <a className="underline-offset-4 hover:text-ivory hover:underline" href="https://apocor.ai">
              apocor.ai
            </a>
            <Link className="underline-offset-4 hover:text-ivory hover:underline" href="/inbox">
              Team inbox
            </Link>
          </div>
        </div>
      </footer>
    </main>
  )
}
