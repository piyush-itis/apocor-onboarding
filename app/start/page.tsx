import type { Metadata } from "next"

import { Wizard } from "@/components/wizard/wizard"

export const metadata: Metadata = {
  title: "Begin onboarding",
}

export default function Page() {
  return <Wizard />
}
