export const config = { runtime: "edge" };

export default function handler() {
  return Response.json({ ok: true, time: new Date().toISOString() });
}
