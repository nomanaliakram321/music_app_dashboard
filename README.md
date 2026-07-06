# Hip Hop Calendar - Admin Dashboard

A modern web-based admin dashboard for managing hip-hop album releases, events, and push notifications.

## Features

- 📅 **Calendar Management** - Organize and track album release dates
- 💿 **Album Database** - Comprehensive album and artist information
- 🎪 **Event Management** - Create and manage hip-hop events
- 📱 **Push Notifications** - Send real-time notifications to mobile app users
- 🔐 **Role-Based Access** - Admin and editor roles with permissions
- 📊 **Analytics Dashboard** - Monitor notification delivery and user metrics
- 📤 **CSV Upload** - Bulk import album data
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui (Radix UI)
- **Routing:** React Router v6
- **State Management:** TanStack Query
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **API:** Vercel Serverless Functions
- **Push Notifications:** Firebase Cloud Messaging
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Firebase project (for push notifications)
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/hip-hop-calender-web.git
cd hip-hop-calender-web
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (server-side only)
- `FIREBASE_PROJECT_ID` - Your Firebase project ID (server-side only)
- `FIREBASE_PRIVATE_KEY` - Your Firebase private key (server-side only)
- `FIREBASE_CLIENT_EMAIL` - Your Firebase client email (server-side only)

4. Run the development server:
```bash
npm run dev
# or
bun run dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
hip-hop-calender-web/
├── api/                    # Vercel serverless functions
│   └── notifications/      # Push notification endpoints
├── public/                 # Static assets
├── src/
│   ├── api/               # API client functions
│   ├── components/        # React components
│   │   ├── layout/       # Layout components (sidebar, protected routes)
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions
│   ├── pages/            # Page components
│   └── types/            # TypeScript type definitions
└── tests/                # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Authentication

The app uses Supabase Auth with email/password authentication. Protected routes require:
- Valid user session
- Active profile (not blocked)
- Appropriate role (admin or editor)

## Roles & Permissions

- **Admin:** Full access to all features including user management
- **Editor:** Can manage albums, events, and send notifications
- **Blocked Users:** Cannot access the dashboard

## Push Notifications

The notification system supports:
- Album release notifications (new/updated)
- Custom event notifications
- Device token management (iOS/Android)
- Notification preferences per device
- Delivery tracking and analytics

## Database Schema

The app uses Supabase (PostgreSQL) with the following main tables:
- `profiles` - User profiles with roles
- `albums` - Album information
- `events` - Event data
- `device_tokens` - FCM tokens for push notifications
- `notification_logs` - Notification delivery tracking

## Security

- Environment variables are properly configured (never commit `.env`)
- Row Level Security (RLS) enabled on Supabase tables
- Role-based access control
- API endpoints protected with authentication
- Firebase Admin SDK used server-side only

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy

### Environment Variables (Vercel)

Set these in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.

## Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for the hip-hop community
