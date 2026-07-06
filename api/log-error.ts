export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();

    console.error("[CLIENT ERROR]", {
      ...body,
      userAgent: req.headers.get("user-agent"),
      ip: req.headers.get("x-forwarded-for"),
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[LOG-ERROR ENDPOINT FAILED]", error);
    return Response.json({ error: "Logging failed" }, { status: 500 });
  }
}
