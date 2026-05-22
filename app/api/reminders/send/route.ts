import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoiceReminder } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        userId: session.user.id,
        status: { in: ["PENDING", "SENT", "OVERDUE"] },
        dueDate: { lt: new Date() },
      },
      include: {
        client: true,
        reminders: true,
      },
    });

    let sentCount = 0;

    for (const invoice of overdueInvoices) {
      // Check if reminder already sent today
      const reminderToday = invoice.reminders.find((r) => {
        const sentDate = r.sentAt ? new Date(r.sentAt) : null;
        if (!sentDate) return false;
        return (
          sentDate.toDateString() === new Date().toDateString() &&
          r.status === "SENT"
        );
      });

      if (reminderToday) continue;

      // Send email
      const emailSent = await sendInvoiceReminder(
        invoice.client.email,
        invoice.client.name,
        invoice.invoiceNumber,
        invoice.totalAmount,
        invoice.dueDate.toLocaleDateString()
      );

      if (emailSent) {
        // Create reminder record
        await prisma.reminder.create({
          data: {
            userId: session.user.id,
            invoiceId: invoice.id,
            status: "SENT",
            sentAt: new Date(),
          },
        });

        // Update invoice status to OVERDUE if not already
        if (invoice.status !== "OVERDUE") {
          await prisma.invoice.update({
            where: { id: invoice.id },
            data: { status: "OVERDUE" },
          });
        }

        sentCount++;
      }
    }

    return NextResponse.json({
      message: `Sent ${sentCount} reminders`,
      count: sentCount,
    });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json(
      { error: "Failed to send reminders" },
      { status: 500 }
    );
  }
}
