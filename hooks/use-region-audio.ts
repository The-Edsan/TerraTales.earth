"use client"

import { useCallback, useEffect, useState } from "react"

type Region = "alaska" | "manaos" | "cdmx"

export function useRegionAudio() {
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis)
    }
  }, [])

  const playRegionAudio = useCallback(
    (region: Region) => {
      if (!synth) return

      synth.cancel()

      const regionNames: Record<Region, string> = {
        alaska: "Alaska",
        manaos: "Manaus",
        cdmx: "Mexico City",
      }

      const utterance = new SpeechSynthesisUtterance(regionNames[region])

      utterance.lang = "en-US"
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      synth.speak(utterance)
    },
    [synth],
  )

  return { playRegionAudio }
}
