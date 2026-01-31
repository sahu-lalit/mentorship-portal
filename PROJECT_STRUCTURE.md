# Mentorship Portal

A modern web application for connecting students with mentors, built with Next.js 16 and TypeScript.

## 🚀 Features

- **Authentication System**: Separate login for Students and Mentors
- **Role-Based Access**: Automatic redirection to role-specific dashboards
- **Student Dashboard**: Access mentors, sessions, resources, and progress tracking
- **Mentor Dashboard**: Manage students, schedule sessions, and track analytics
- **Responsive Design**: Built with Tailwind CSS for all screen sizes
- **TypeScript**: Full type safety throughout the application

## 📁 Project Structure

```
mentorship/
├── app/
│   ├── (auth)/
│   │   └── login/              # Login page
│   ├── (dashboard)/
│   │   ├── student/            # Student dashboard
│   │   └── mentor/             # Mentor dashboard
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page (redirects to login)
│   └── globals.css             # Global styles
├── components/
│   ├── auth/
│   │   └── LoginForm.tsx       # Login form component
│   ├── student/
│   │   └── StudentDashboard.tsx # Student dashboard component
│   ├── mentor/
│   │   └── MentorDashboard.tsx  # Mentor dashboard component
│   └── ui/
│       ├── Button.tsx          # Reusable button component
│       └── Card.tsx            # Reusable card component
├── lib/
│   └── utils.ts                # Utility functions
└── types/
    └── index.ts                # TypeScript type definitions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Navigate to the project directory:
```bash
cd mentorship
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Install additional required dependencies:
```bash
npm install clsx tailwind-merge
# or
yarn add clsx tailwind-merge
```

### Running the Application

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

### Login

1. Navigate to `/login`
2. Select your role (Student or Mentor)
3. Enter your email and password
4. Click "Login"

You'll be automatically redirected to your role-specific dashboard.

### Student Dashboard

Students can:
- View assigned mentors
- Schedule mentorship sessions
- Access learning resources
- Track progress
- Send messages
- Update profile

### Mentor Dashboard

Mentors can:
- View and manage students
- Schedule sessions
- Review session requests
- Share resources
- Monitor student progress
- View analytics

## 🔐 Authentication

Currently using mock authentication stored in localStorage. When integrating with your backend APIs:

1. Update `lib/utils.ts` - Replace `mockLogin` function with actual API calls
2. Implement proper JWT token handling
3. Add protected route middleware
4. Set up session management

## 🎨 Styling

- Built with **Tailwind CSS 4**
- Dark mode support included
- Fully responsive design
- Custom UI components in `components/ui/`

## 📦 Next Steps

- [ ] Integrate backend APIs
- [ ] Add proper authentication (JWT/OAuth)
- [ ] Implement real-time messaging
- [ ] Add session scheduling functionality
- [ ] Create profile management pages
- [ ] Build resource library
- [ ] Add progress tracking features
- [ ] Implement analytics dashboard

## 🤝 Contributing

When adding new features:

1. Create new pages in appropriate `app/` directory
2. Add reusable components in `components/`
3. Define types in `types/index.ts`
4. Add utility functions in `lib/utils.ts`

## 📄 License

This project is private and proprietary.
