# SaaS Invoice Tracker

A professional invoice management and tracking system built with Next.js, React, TypeScript, and Tailwind CSS.

## 🚀 Features

✅ **User Authentication** - Secure login and registration with NextAuth.js
✅ **Invoice Management** - Create, edit, view, and delete invoices
✅ **Client Management** - Manage client details and information
✅ **Invoice Tracking** - Track invoice status, due dates, and amounts
✅ **Payment Recording** - Record and track payments
✅ **Payment Reminders** - Automated email reminders for overdue invoices
✅ **Dashboard** - Overview of invoices, revenue, and pending amounts
✅ **Professional UI** - Modern, responsive design with Tailwind CSS
✅ **PostgreSQL Database** - Prisma ORM for data management

## 📚 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **Email**: Nodemailer
- **Form Validation**: Zod
- **UI Icons**: Lucide React

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- PostgreSQL database
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/Anchitkumarr009/Saas-Invoice-Tracker.git
cd Saas-Invoice-Tracker
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Setup Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/invoice_tracker"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"

# Email Service
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate NextAuth Secret:**
```bash
openssl rand -base64 32
```

### Step 4: Setup Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate
```

### Step 5: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Project Structure

```
.
├── app/
│   ├── api/                          # API routes
│   │   ├── auth/
│   │   │   ├── register/            # User registration
│   │   │   └── [...nextauth]/       # NextAuth handler
│   │   ├── clients/                  # Client management
│   │   ├── invoices/                 # Invoice management
│   │   └── reminders/                # Reminder system
│   ├── auth/
│   │   ├── login/                    # Login page
│   │   └── register/                 # Registration page
│   ├── dashboard/                    # Dashboard page
│   ├── invoices/
│   │   ├── page.tsx                  # Invoice list
│   │   ├── create/                   # Create invoice
│   │   └── [id]/                     # Invoice detail
│   ├── clients/                      # Client management
│   ├── reminders/                    # Reminders page
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Home page
├── components/
│   └── AuthProvider.tsx              # NextAuth provider
├── lib/
│   ├── auth.ts                       # NextAuth config
│   ├── email.ts                      # Email service
│   ├── prisma.ts                     # Prisma client
│   └── validations.ts                # Zod schemas
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── public/                           # Static assets
├── .env.example                      # Environment template
├── next.config.js                    # Next.js config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

## 🗄️ Database Schema

### User
- id (String, PK)
- email (String, unique)
- name (String)
- password (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Client
- id (String, PK)
- userId (String, FK)
- name (String)
- email (String)
- phone (String)
- address (String)
- city (String)
- country (String)
- zipCode (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### Invoice
- id (String, PK)
- userId (String, FK)
- clientId (String, FK)
- invoiceNumber (String, unique)
- description (String)
- amount (Float)
- tax (Float)
- totalAmount (Float)
- status (Enum: DRAFT, PENDING, SENT, PAID, OVERDUE, CANCELLED)
- dueDate (DateTime)
- issuedDate (DateTime)
- paidDate (DateTime)
- notes (String)
- createdAt (DateTime)
- updatedAt (DateTime)

### InvoiceItem
- id (String, PK)
- invoiceId (String, FK)
- description (String)
- quantity (Int)
- rate (Float)
- amount (Float)

### Payment
- id (String, PK)
- invoiceId (String, FK)
- amount (Float)
- paymentDate (DateTime)
- method (String)
- notes (String)
- createdAt (DateTime)

### Reminder
- id (String, PK)
- userId (String, FK)
- invoiceId (String, FK)
- status (Enum: PENDING, SENT, FAILED)
- sentAt (DateTime)
- createdAt (DateTime)

## 🔐 Authentication

This app uses NextAuth.js with Credentials provider for authentication:

1. Users can register with email and password
2. Passwords are hashed with bcryptjs
3. Sessions are managed with JWT tokens
4. Protected routes check for valid sessions

## 📧 Email Configuration

The app uses Nodemailer to send emails. Setup Gmail App Password:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password at https://myaccount.google.com/apppasswords
3. Use the generated password in `EMAIL_PASSWORD`

## 💡 Key Features Explained

### Invoice Management
- Create invoices with multiple line items
- Auto-calculate subtotal, tax, and total
- Track payment status and due dates
- Record partial and full payments

### Payment Reminders
- Automatically detect overdue invoices
- Send email reminders to clients
- Track reminder history
- One reminder per invoice per day

### Dashboard
- Overview of all invoices
- Stats: Total, Paid, Pending, Overdue amounts
- Quick access to create invoices
- Recent invoices list

## 🚀 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

### Environment Variables on Vercel

Set all environment variables in Vercel project settings.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create client
- `DELETE /api/clients/[id]` - Delete client

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create invoice
- `GET /api/invoices/[id]` - Get invoice detail
- `DELETE /api/invoices/[id]` - Delete invoice
- `POST /api/invoices/[id]/payments` - Record payment

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders/send` - Send reminders for overdue invoices

## 🐛 Troubleshooting

### Database Connection Error
- Check DATABASE_URL is correct
- Ensure PostgreSQL is running
- Run `npm run prisma:migrate` again

### Email Not Sending
- Check EMAIL_USER and EMAIL_PASSWORD are correct
- Enable "Less secure app access" for Gmail
- Check email logs in Nodemailer

### Authentication Issues
- Generate new NEXTAUTH_SECRET
- Clear browser cookies
- Check database connection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@invoicetracker.com or open an issue on GitHub.

---

**Happy invoicing! 🎉**
