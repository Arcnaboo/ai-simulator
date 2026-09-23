"use client";

import dynamic from "next/dynamic";

const GameApp = dynamic(() => import("@/components/game/GameApp").then((mod) => mod.GameApp), {
  ssr: false,
  loading: () => (
    <p className="boot">
      {typeof window === "undefined" || window.localStorage.getItem("ai-sim-lang") !== "en"
        ? "Model ısınıyor."
        : "Warming up the model."}
    </p>
  ),
});

export default function Home() {
  return <GameApp />;
}
