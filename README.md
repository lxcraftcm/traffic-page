# Traffic Page

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | [한국어](README.ko.md)

A modern, customizable navigation hub built with Next.js 16 and React 19.

## Features

- **Unified Navigation Hub** - Organize and access all your websites in one place
- **Internal/External Network Switch** - Toggle between internal and external URLs
- **Customizable Categories** - Create and manage your own website categories
- **Rich Icon Support** - Font Awesome icons with custom colors
- **Multi-theme Support** - Light and dark mode
- **Internationalization** - Multi-language support via i18next
- **User Authentication** - Secure JWT-based authentication system
- **SQLite Database** - Local data storage with better-sqlite3
- **Responsive Design** - Beautiful UI with Tailwind CSS 4

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Font Awesome 7
- **Database**: better-sqlite3
- **Authentication**: JWT (jsonwebtoken)
- **Internationalization**: i18next, react-i18next
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 22+
- npm or yarn or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd traffic-page

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

## Docker Deployment

### Option 1: Pull from Docker Hub

```bash
# Pull the image
docker pull lxcraftcm/traffic-page

# Run the container
docker run -d \
  --name traffic-page \
  -p 3000:3000 \
  -v /path/to/data:/app/data \
  -e JWT_SECRET=your-secret-key \
  lxcraftcm/traffic-page
```

### Option 2: Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  traffic-page:
    image: lxcraftcm/traffic-page
    container_name: traffic-page
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    environment:
      - JWT_SECRET=your-secret-key
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

### Configuration

- **Default Port**: `3000`
- **Data Directory**: `/app/data` (mount this volume for data persistence)
- **Environment Variables**:
  - `JWT_SECRET`: Secret key for JWT token signing (optional, auto-generated if not set)
    - ⚠️ **Important**: If not set, a random key will be auto-generated, but **all tokens will become invalid after container restart**
  - `PORT`: Application port (default: 3000)
  - `NODE_ENV`: Environment mode (production/development)

### Build from Source

```bash
# Build the Docker image
docker build -t traffic-page .

# Run the container
docker run -d \
  --name traffic-page \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  traffic-page
```

## Project Structure

```
traffic-page/
├── src/
│   ├── app/              # Next.js App Router pages and API routes
│   ├── components/       # React components
│   ├── lib/              # Utility libraries (auth, db, logger, i18n)
│   ├── providers/        # React context providers
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── public/               # Static assets
└── package.json
```

## API Routes

- `POST /api/user/register` - User registration
- `POST /api/user/login` - User login
- `GET /api/user/userinfo` - Get user information
- `GET /api/user/page` - Get user navigation page
- `POST /api/user/page` - Save user navigation page
- `GET /api/user/checkSystemInit` - Check system initialization
- `GET/POST /api/systemSetting/generalSetting` - System settings

## Default Categories

The application comes with pre-configured categories:

- Quick Access
- Common Tools
- Development
- Entertainment
- Operating Systems
- Shopping
- Knowledge
- Games

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_PATH=./data/traffic.db

# JWT Secret (generate your own)
JWT_SECRET=your-secret-key

# Application
NODE_ENV=production
PORT=3000
```

### Database Initialization

The database is automatically initialized on first run with the following tables:

- `t_user` - User accounts
- `t_user_page` - User navigation pages
- `t_system_setting` - System settings

## License

This project is licensed under the MIT License.
