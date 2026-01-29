// app/api/contact/route.ts
import type { NextRequest } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = String(formData.get("name") || "");
    const email = String(formData.get("email") || "");
    const business = String(formData.get("business") || "");
    const message = String(formData.get("message") || "");

    // Basic validation
    if (!name || !email || !message) {
      return new Response("Missing required fields", { status: 400 });
    }

    // Configure Nodemailer transporter (SMTP)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const htmlBody = `
      <p>New Haki Tools contact form submission:</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Business:</strong> ${business}</p>
      <p><strong>Message:</strong><br/>${message.replace(/\n/g, "<br/>")}</p>
    `;

    await transporter.sendMail({
      from: `"Haki Tools Contact" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: "robbie.robinson@akoben.ai",
      subject: `New inquiry from ${name}`,
      replyTo: email,
      html: htmlBody,
    });

    return new Response("OK", { status: 200 });
  } catch (err) {
    console.error("Contact form error", err);
    return new Response("Server error", { status: 500 });
  }
}
