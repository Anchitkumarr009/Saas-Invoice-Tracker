import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendInvoiceReminder(
  to: string,
  clientName: string,
  invoiceNumber: string,
  amount: number,
  dueDate: string
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Invoice ${invoiceNumber} Payment Reminder`,
      html: `
        <h2>Payment Reminder</h2>
        <p>Dear ${clientName},</p>
        <p>This is a friendly reminder that invoice <strong>${invoiceNumber}</strong> is due on <strong>${dueDate}</strong>.</p>
        <p><strong>Amount Due:</strong> $${amount.toFixed(2)}</p>
        <p>Please make the payment at your earliest convenience.</p>
        <p>Thank you for your business!</p>
      `,
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}

export async function sendInvoicePaidNotification(
  to: string,
  clientName: string,
  invoiceNumber: string,
  amount: number
) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: `Invoice ${invoiceNumber} - Payment Received`,
      html: `
        <h2>Payment Received</h2>
        <p>Dear ${clientName},</p>
        <p>Thank you! We have received your payment for invoice <strong>${invoiceNumber}</strong>.</p>
        <p><strong>Amount Paid:</strong> $${amount.toFixed(2)}</p>
        <p>Thank you for your business!</p>
      `,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    return false;
  }
}
