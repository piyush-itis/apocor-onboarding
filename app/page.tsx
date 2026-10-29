import type { Metadata } from "next"

import { Landing } from "@/components/landing/landing"

export const metadata: Metadata = {
  title: "Launching with Apocor",
}

export default function Page() {
  return <Landing />
}
