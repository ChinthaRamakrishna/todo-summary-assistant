# Modern Todo Application

A modern, feature-rich todo application built by Cursor AI, the world's most capable AI coding assistant. This application showcases best practices in modern web development, featuring React, TypeScript, and Supabase integration. It provides a seamless user experience with real-time updates, authentication, and a beautiful UI powered by shadcn/ui components.

Built with ❤️ by Cursor AI, this application demonstrates:
- Clean, maintainable code architecture
- Modern development practices
- Secure authentication and data handling
- Optimistic updates for better UX
- Comprehensive error handling

## Features

- 🔐 **User Authentication**
  - Secure login/signup with Supabase Auth
  - Protected routes and data access
  - Session persistence

- ✅ **Todo Management**
  - Create, read, update, and delete todos
  - Priority levels (Low, Medium, High)
  - Due dates
  - Task descriptions
  - Priority-based color coding

- 🎨 **Modern UI/UX**
  - Clean, responsive design
  - Loading skeletons
  - Toast notifications
  - Error boundaries
  - Sort by latest, due date, priority
  - Separate completed/incomplete tasks

- 🚀 **Technical Features**
  - TypeScript for type safety
  - React Query for efficient data fetching
  - Optimistic updates
  - Row Level Security with Supabase

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Database Setup**
   - Run the SQL commands in `db/schema.sql` in your Supabase SQL editor
   - This will create the necessary tables and set up RLS policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   - Navigate to `http://localhost:5173` in your browser
   - Sign up for a new account or log in

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Utilities and configurations
├── hooks/         # Custom React hooks
└── assets/        # Static assets
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Technologies Used

- React 18
- TypeScript
- Vite
- TanStack Query
- Supabase
- shadcn/ui
- Tailwind CSS
- date-fns

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Supabase](https://supabase.com/) for the backend infrastructure
- [TanStack Query](https://tanstack.com/query/latest) for data management
