# SwiftViewer

A modern, real-time market viewer for stocks and cryptocurrencies built with Next.js and Supabase.

## Features

- Real-time market data tracking
- User authentication
- Customizable watchlists
- Price alerts
- Dark/Light theme support
- Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Supabase (Authentication & Database)
- Tailwind CSS
- Shadcn UI
- Framer Motion

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/jafarnz/swiftviewer.git
cd swiftviewer
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Setup

Make sure to set up the following environment variables in your `.env.local` file:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Schema

The application uses the following tables in Supabase:

- `profiles`: User profile information
- `user_preferences`: User-specific settings and preferences
- `watchlist`: User's watched stocks and cryptocurrencies
- `price_alerts`: User's price alerts for specific symbols

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/) 