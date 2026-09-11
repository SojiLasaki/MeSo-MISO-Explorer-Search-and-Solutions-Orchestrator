import { describe, expect, it } from "vitest";

import { buildAccessRequest, classifyAccessPolicy } from "./access-policy";

describe("MISO access policy", () => {
  it("routes real-time congestion and generator clearing to DART or PI MISO", () => {
    const decision = classifyAccessPolicy("Show real-time grid congestion and clearing information for generators");
    expect(decision.category).toBe("portal");
    expect(buildAccessRequest("Show real-time grid congestion", decision).body).toContain("DART database or PI MISO");
  });

  it("routes privileged internal system questions to the help desk", () => {
    const decision = classifyAccessPolicy("How are MISO's internal systems connected?");
    expect(decision.category).toBe("internal");
    expect(buildAccessRequest("How are MISO's internal systems connected?", decision).body).toContain("MISO Help Desk");
  });

  it("refuses personal salary requests", () => {
    const decision = classifyAccessPolicy("What is a person's salary at MISO?");
    expect(decision.category).toBe("personal");
    expect(decision.requestable).toBe(false);
  });

  it("routes business decisions to the MISO help email", () => {
    const decision = classifyAccessPolicy("Use this data to make a business decision for me");
    expect(decision.category).toBe("business");
    const request = buildAccessRequest("Use this data to make a business decision for me", decision);
    expect(request.recipient).toBe("support@askmiso.com");
    expect(request.body).toContain("business decision");
  });

  it("leaves ordinary public data requests available", () => {
    expect(classifyAccessPolicy("What was the actual load yesterday?").category).toBe("public");
  });
});
