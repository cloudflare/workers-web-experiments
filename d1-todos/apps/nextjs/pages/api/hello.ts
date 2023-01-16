// Next.js Edge API Routes: https://nextjs.org/docs/api-routes/edge-api-routes

import type { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextRequest) {
  return (Response as any).json({ name: "John Doe" });
}
