export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, notes } = body;

    // Log the lead (in production, forward this to an email, Telegram bot, or Google Sheet)
    console.log("--- NEW CLIENT INQUIRY CAPTURED ---");
    console.log(`Name: ${name}`);
    console.log(`Phone: ${phone}`);
    console.log(`Context: ${notes || "General Inquiry"}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log("-----------------------------------");

    return new Response(JSON.stringify({ success: true, message: "Lead recorded" }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
