"use node";

import { ConvexError, v } from "convex/values";
import nodemailer from "nodemailer";
import { action } from "./_generated/server";

export const CONTACT_EMAIL = process.env.CONTACT_EMAIL_ADDRESS;

if (!CONTACT_EMAIL) {
  throw new Error("CONTACT_EMAIL_ADDRESS is not set");
}

export const sendContactEmail = action({
  args: {
    reason: v.string(),
    message: v.string(),
  },
  handler: async (ctx, { reason, message }) => {
    try {
      // Get current user from Clerk
      const identity = await ctx.auth.getUserIdentity();
      if (!identity) {
        throw new Error("User not authenticated");
      }

      // Extract user info from Clerk identity
      const userName = identity.name || "Unknown User";
      const userEmail = identity.email;

      if (!userEmail) {
        throw new ConvexError("User email not found");
      }

      // Create transporter
      const transporter = nodemailer.createTransport({
        port: 465,
        secure: true,
        host: "smtp.hostinger.com",
        auth: {
          user: process.env.HOSTINGER_CONTACT_EMAIL,
          pass: process.env.HOSTINGER_CONTACT_PASSWORD,
        },
      });

      // Email content
      const emailContent = {
        from: `Kitchen Sync App <${process.env.HOSTINGER_CONTACT_EMAIL}>`,
        to: CONTACT_EMAIL,
        subject: `Contact Form: ${reason}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>From:</strong> ${userName} (${userEmail})</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Message:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
          <hr>
          <p><em>Sent at: ${new Date().toISOString()}</em></p>
        `,
        text: `
New Contact Form Submission

From: ${userName} (${userEmail})
Reason: ${reason}
Message: ${message}

Sent at: ${new Date().toISOString()}
        `,
      };

      // Send email
      const info = await transporter.sendMail(emailContent);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("Error sending contact email:", error);
      throw new Error("Failed to send contact email");
    }
  },
});
