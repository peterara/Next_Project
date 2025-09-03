# System Performance Monitor Dashboard

A real-time system performance monitoring dashboard built with Next.js, TailwindCSS, and Chart.js. Monitor CPU, Memory, and Disk usage with beautiful charts and real-time updates.

## 🚀 Features

- **Real-time System Metrics**: Live monitoring of CPU, Memory, and Disk usage
- **Interactive Charts**: Beautiful Chart.js visualizations with real-time data
- **Responsive Design**: Modern, responsive UI built with TailwindCSS
- **Dark/Light Mode**: Theme switching with persistent preferences
- **Customizable Polling**: Configurable update intervals (1s to 30s)
- **Database Persistence**: Store settings and metrics history in PostgreSQL
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Comprehensive Testing**: Full test coverage for frontend and backend

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS with dark/light mode support
- **Charts**: Chart.js with react-chartjs-2
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Drizzle ORM
- **Testing**: Jest, React Testing Library, Supertest
- **Icons**: Lucide React
- **Theme**: next-themes

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd system-performance-monitor-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and configure your database:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/system_monitor
```

### 4. Database Setup

Create a PostgreSQL database and run migrations:

```bash
# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open Drizzle Studio to view data
npm run db:studio
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Project Structure

```
├── app/                          # Next.js App Router
│   ├── api/                     # API routes
│   │   ├── metrics/            # System metrics endpoint
│   │   └── settings/           # User settings endpoint
│   ├── dashboard/              # Main dashboard page
│   ├── settings/               # Settings page
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page (redirects to dashboard)
├── components/                  # React components
│   ├── metric-chart.tsx        # Chart.js wrapper component
│   ├── navigation.tsx          # Navigation bar
│   ├── theme-provider.tsx      # Theme context provider
│   └── theme-toggle.tsx        # Theme toggle button
├── lib/                        # Utility libraries
│   ├── db/                     # Database configuration
│   │   ├── index.ts            # Database connection
│   │   └── schema.ts           # Database schema
│   └── system-metrics.ts       # System metrics utilities
├── tests/                      # Test files
│   ├── api/                    # API endpoint tests
│   ├── app/                    # Page component tests
│   └── components/             # Component tests
├── drizzle.config.ts           # Drizzle ORM configuration
├── jest.config.js              # Jest configuration
├── next.config.js              # Next.js configuration
├── tailwind.config.js          # TailwindCSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test Structure

- **API Tests**: Test API endpoints with mocked database
- **Component Tests**: Test React components with mocked dependencies
- **Utility Tests**: Test system metrics functions with mocked OS calls

## 🎨 Customization

### Themes

The dashboard supports three theme modes:
- **Light**: Clean, bright interface
- **Dark**: Easy on the eyes for low-light environments
- **System**: Automatically follows OS preference

### Polling Intervals

Configure how often metrics are updated:
- 1 second: Most responsive, higher system load
- 2 seconds: Default, balanced performance
- 5-30 seconds: More efficient, less responsive

### Chart Colors

Customize chart colors by modifying the `color` prop in the `MetricChart` component:

```tsx
<MetricChart
  title="CPU Usage"
  data={cpuData}
  labels={timeLabels}
  color="#3B82F6"  // Customize this color
  unit="%"
/>
```

## 🔧 Configuration

### Database Configuration

The application uses Drizzle ORM with PostgreSQL. Key configuration files:

- `lib/db/schema.ts`: Database schema definitions
- `lib/db/index.ts`: Database connection setup
- `drizzle.config.ts`: Drizzle CLI configuration

### API Configuration

API routes are configured in the `app/api/` directory:

- `/api/metrics`: GET for current metrics, POST for historical data
- `/api/settings`: GET/POST for user preferences

### System Metrics

System metrics are collected using native OS commands:

- **Windows**: Uses `wmic` commands
- **Unix/Linux**: Uses `/proc` filesystem and `df` command

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure these environment variables are set in production:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
```

### Database Migrations

Run migrations in production:

```bash
npm run db:migrate
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify PostgreSQL is running
   - Check `DATABASE_URL` in `.env.local`
   - Ensure database exists and is accessible

2. **Metrics Not Loading**
   - Check system permissions for OS commands
   - Verify API endpoints are accessible
   - Check browser console for errors

3. **Charts Not Rendering**
   - Ensure Chart.js dependencies are installed
   - Check for JavaScript errors in console
   - Verify data is being passed correctly

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [TailwindCSS](https://tailwindcss.com/) for utility-first CSS
- [Chart.js](https://www.chartjs.org/) for beautiful charts
- [Drizzle ORM](https://orm.drizzle.team/) for type-safe database operations

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your OS, Node.js version, and error logs

---

**Happy Monitoring! 🚀**
