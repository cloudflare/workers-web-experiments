export function createResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
  });
}

export type HandlerResult = { success: boolean; errorMessage?: string };
