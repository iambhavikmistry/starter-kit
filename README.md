# Laravel + React + Inertia.js Starter Kit

A modern, production-ready full-stack starter kit featuring Laravel 12, React 19, Inertia.js v2, and TypeScript. Perfect for building admin dashboards, SaaS applications, and business management systems.

## 🚀 Features

### Backend (Laravel 12)
- **Authentication**: Laravel Fortify with email verification, password reset, and OAuth (GitHub, Google)
- **Two-Factor Authentication**: Complete 2FA implementation with QR codes and recovery codes
- **Authorization**: Role-based access control (RBAC) using Spatie Permissions
- **Pre-built Roles**: SuperAdmin, Admin, Manager, Member with enum-driven permissions
- **Admin Panel**: User management, role management, and system settings
- **Modern Stack**: PHP 8.2+, SQLite/MySQL/PostgreSQL support

### Frontend (React 19 + TypeScript)
- **Inertia.js v2**: Server-side routing with SPA experience, SSR-ready
- **Type-Safe Routes**: Laravel Wayfinder for automatic TypeScript route generation
- **UI Library**: Radix UI primitives with 70+ custom shadcn-style components
- **Styling**: Tailwind CSS v4 with dark mode support
- **Forms**: React Hook Form + Zod validation
- **Data Tables**: TanStack React Table with sorting, filtering, CSV/XLSX export
- **Professional Components**: Responsive layouts, data tables, forms, modals, and more

### Developer Experience
- **Hot Module Replacement**: Vite with instant updates
- **Testing**: Pest (PHP) with comprehensive test coverage
- **Code Quality**: ESLint, Prettier, Laravel Pint
- **Type Safety**: Full TypeScript support with strict mode
- **Development Tools**: Laravel Telescope (debugging), Pail (logs)

## 📋 Requirements

- **PHP**: 8.2 or higher
- **Node.js**: 18 or higher
- **Composer**: 2.x
- **Database**: SQLite (default), MySQL, or PostgreSQL

## 🛠️ Installation

### Quick Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd starter-kit

# Install dependencies and setup
composer setup
```

This single command will:
1. Install PHP dependencies
2. Copy `.env.example` to `.env`
3. Generate application key
4. Run database migrations
5. Install Node.js dependencies
6. Build frontend assets

### Manual Setup

```bash
# 1. Install PHP dependencies
composer install

# 2. Setup environment
cp .env.example .env
php artisan key:generate

# 3. Setup database
touch database/database.sqlite  # If using SQLite
php artisan migrate

# 4. Install and build frontend
npm install
npm run build
```

## 🎯 Development

### Start Development Server

```bash
# Start all development services (recommended)
composer dev
```

This starts:
- Laravel development server (http://localhost:8000)
- Vite dev server with HMR
- Queue worker
- Log viewer (Laravel Pail)

### Individual Commands

```bash
# Start Laravel server only
php artisan serve

# Start Vite dev server
npm run dev

# Run queue worker
php artisan queue:listen

# View logs
php artisan pail
```

### With Server-Side Rendering (SSR)

```bash
composer dev:ssr
```

## 🧪 Testing

```bash
# Run all tests (PHP linting + PHPUnit)
composer test

# Run PHP tests only
php artisan test

# Run specific test
php artisan test --filter=UserManagementTest

# Run with coverage
php artisan test --coverage
```

## 📝 Code Quality

### Linting & Formatting

```bash
# PHP linting (Laravel Pint)
composer lint

# Check PHP code style
composer test:lint

# TypeScript type checking
npm run types

# ESLint
npm run lint

# Format code with Prettier
npm run format
```

## 🔐 Default Credentials

After running migrations and seeders, you can use:

```
Email: admin@example.com
Password: password
```

## 📁 Project Structure

```
├── app/
│   ├── Http/Controllers/      # Laravel controllers
│   ├── Models/                # Eloquent models
│   ├── Enums/                 # PHP enums (Roles, Permissions)
│   └── Middleware/            # Custom middleware
├── resources/
│   ├── js/
│   │   ├── pages/            # Inertia pages
│   │   ├── components/       # React components
│   │   ├── layouts/          # Layout components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── routes/           # Generated TypeScript routes
│   │   └── actions/          # Generated controller actions
│   └── css/                  # Tailwind CSS
├── routes/
│   ├── web.php              # Public routes
│   ├── settings.php         # User settings routes
│   └── admin.php            # Admin routes (optional)
├── tests/
│   ├── Feature/             # Feature tests
│   └── Unit/                # Unit tests
└── database/
    ├── migrations/          # Database migrations
    ├── seeders/            # Database seeders
    └── factories/          # Model factories
```

## 🎨 Key Pages

### Public Routes
- `/` - Welcome page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Password reset request
- `/reset-password/{token}` - Password reset form

### User Routes (Authenticated)
- `/dashboard` - User dashboard
- `/settings/profile` - Profile settings
- `/settings/password` - Change password
- `/settings/two-factor` - 2FA setup
- `/settings/appearance` - Theme preferences

### Admin Routes (Admin Role Required)
- `/admin/dashboard` - Admin dashboard
- `/admin/users` - User management
- `/admin/roles` - Role and permission management
- `/admin/system-settings` - System configuration

## 🔧 Configuration

### Environment Variables

Key variables in `.env`:

```env
APP_ENV=local              # Environment: local, production
APP_DEBUG=false            # IMPORTANT: Set to false in production
APP_URL=http://localhost   # Your application URL

DB_CONNECTION=sqlite       # Database type
QUEUE_CONNECTION=database  # Queue driver
SESSION_DRIVER=database    # Session driver

# OAuth Providers (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URI=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

### OAuth Setup

1. Create OAuth apps on [GitHub](https://github.com/settings/developers) and/or [Google Cloud Console](https://console.cloud.google.com/)
2. Set callback URL to: `{APP_URL}/oauth/{provider}/callback`
3. Add credentials to `.env`
4. Configure in Admin > System Settings

## 🚢 Deployment

### Build for Production

```bash
# Build frontend assets
npm run build

# Optimize Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Important Security Checklist

- [ ] Set `APP_ENV=production` in `.env`
- [ ] Set `APP_DEBUG=false` in `.env`
- [ ] Use strong `APP_KEY` (generated by `php artisan key:generate`)
- [ ] Configure proper database credentials
- [ ] Set up queue workers with supervisor/systemd
- [ ] Enable HTTPS in production
- [ ] Set appropriate file permissions (storage, bootstrap/cache)
- [ ] Review and configure CORS if building an API

## 📦 Technology Stack

### Backend
- **Framework**: Laravel 12
- **Authentication**: Laravel Fortify
- **Permissions**: Spatie Laravel Permission
- **OAuth**: Laravel Socialite
- **Testing**: Pest (PHPUnit)
- **Code Style**: Laravel Pint

### Frontend
- **Framework**: React 19
- **TypeScript**: v5.7
- **Routing**: Inertia.js v2
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod
- **Tables**: TanStack React Table
- **Icons**: Lucide React

## 🐛 Known Issues & Notes

### xlsx Library
The project uses `xlsx` (SheetJS) for exporting data tables to Excel format. While this library has known vulnerabilities (CVE-2023-XXXXX), they **only affect parsing of untrusted files**. This project uses xlsx exclusively for **generating/exporting** files, not parsing user uploads, so the vulnerabilities do not apply.

If you need to parse uploaded Excel files, consider using a server-side solution or an alternative library.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open-sourced software licensed under the [MIT license](LICENSE).

## 🙏 Acknowledgments

- [Laravel](https://laravel.com)
- [React](https://react.dev)
- [Inertia.js](https://inertiajs.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) for component inspiration
- All the amazing open-source contributors

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review Laravel and Inertia.js documentation

---

**Happy coding!** 🎉
