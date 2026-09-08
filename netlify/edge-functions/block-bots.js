export default async (request, context) => {
  const ua = (request.headers.get("user-agent") || "").toLowerCase();
  const blockedPatterns = ["ahrefsbot", "semrushbot", "mj12bot", "dotbot", "petalbot", "bytespider", "gptbot"];
  if (blockedPatterns.some((p) => ua.includes(p))) {
    return new Response("Access denied", { status: 403 });
  }
  return context.next();
};

export const config = { path: "/*" };
