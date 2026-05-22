import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoicePaidNotification } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { amount, method, notes } = body;

    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: { client: true, payments: true },
    });

    if (!invoice || invoice.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Create payment
    const payment = await prisma.payment.create({
      data: {
        invoiceId: params.id,
        amount,
        method,
        notes,
      },
    });

    // Calculate total paid
    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + amount;

    // Update invoice status
    let newStatus = "PAID";
    if (totalPaid < invoice.totalAmount) {
      newStatus = "PENDING";
    }

    await prisma.invoice.update({
      where: { id: params.id },
      data: {
        status: newStatus,
        paidDate: totalPaid >= invoice.totalAmount ? new Date() : null,
      },
    });

    // Send notification email
    if (totalPaid >= invoice.totalAmount) {
      await sendInvoicePaidNotification(
        invoice.client.email,
        invoice.client.name,
        invoice.invoiceNumber,
        amount
      );
    }

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Record payment error:", error);
    return NextResponse.json(
      { error: "Failed to record payment" },
      { status: 500 }
    );
  }
}
