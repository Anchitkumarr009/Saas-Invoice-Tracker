import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceSchema } from "@/lib/validations";

function generateInvoiceNumber() {
  const date = new Date();
  const timestamp = date.getTime().toString().slice(-6);
  return `INV-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}-${timestamp}`;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      include: {
        client: true,
        items: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Fetch invoices error:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = invoiceSchema.parse(body);

    // Calculate amount
    const subtotal = data.items.reduce((acc, item) => {
      return acc + item.quantity * item.rate;
    }, 0);
    const totalAmount = subtotal + (data.tax || 0);

    // Create invoice
    const invoice = await prisma.invoice.create({
      data: {
        userId: session.user.id,
        clientId: data.clientId,
        invoiceNumber: generateInvoiceNumber(),
        description: data.description,
        amount: subtotal,
        tax: data.tax || 0,
        totalAmount,
        dueDate: new Date(data.dueDate),
        notes: data.notes,
        items: {
          create: data.items.map((item) => ({
            ...item,
            amount: item.quantity * item.rate,
          })),
        },
      },
      include: {
        client: true,
        items: true,
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Create invoice error:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
