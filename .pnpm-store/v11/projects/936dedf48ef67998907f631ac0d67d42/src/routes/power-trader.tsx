import { createFileRoute } from "@tanstack/react-router";

import { PTDInfographics } from "@/components/miso/PTDInfographics";

export const Route = createFileRoute("/power-trader")({
  head: () => ({
    meta: [
      { title: "PTD Infographcs" },
      { name: "description", content: "MISO Data Exchange chart workspace for power traders." },
    ],
  }),
  component: PowerTraderRoute,
});

function PowerTraderRoute() { return <PTDInfographics />; }
