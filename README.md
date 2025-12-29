# APIForge Headless CMS - NestJS

A modern, scalable headless CMS built with NestJS, featuring a microservices architecture with dynamic content types, authentication, media management, and permission systems.

## 🚀 Features

- **Microservices Architecture**: Modular design with separate services for different functionalities
- **Dynamic Content Types**: Create and manage custom content types with flexible field definitions
- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Media Management**: Upload and manage media files with automatic storage
- **Permission System**: Fine-grained API and content-level permissions
- **API Gateway**: Single entry point for all microservices
- **PostgreSQL Database**: Shared database configuration across all services
- **TypeORM**: Type-safe database operations with automatic migrations

## 🏗️ Architecture

The project follows a microservices architecture with the following services:

- **Gateway** (Port 8080): API Gateway that routes requests to appropriate microservices
- **Auth Service** (Port 8081): User authentication and authorization
- **Content-Type Service** (Port 8082): Dynamic content type definitions and management
- **Content Service** (Port 8083): Dynamic content CRUD operations
- **Media Service** (Port 8084): File upload and media management
- **Permission Service** (Port 8085): API and content-level permissions

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (or use the configured Neon PostgreSQL)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/tonmoy-dhroubo/apiforge-headless-cms-nestjs.git
cd apiforge-headless-cms-nestjs
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (optional):
Create a `.env` file in the root directory if you want to override the default database configuration:
```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1h
```

## ⚙️ Configuration

### Database Configuration

The project uses a shared PostgreSQL database configuration. The default connection string is configured in `libs/common/src/database/database.config.ts`. All services connect to the same database (`neondb`).

To use a different database, set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

## 🚀 Running the Application

### Development Mode

Run each service individually in separate terminals:

```bash
# Terminal 1 - Gateway
npm run start:gateway

# Terminal 2 - Auth Service
npm run start:auth

# Terminal 3 - Content-Type Service
npm run start:content-type

# Terminal 4 - Content Service
npm run start:content

# Terminal 5 - Media Service
npm run start:media

# Terminal 6 - Permission Service
npm run start:permission
```

### Build

Build all services:
```bash
npm run build
```

## 📡 API Endpoints

All endpoints are accessible through the Gateway at `http://localhost:8080` or directly through individual services.

### Authentication Service (`/api/auth`)

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/users` - Get all users

### Content-Type Service (`/api/content-types`)

- `POST /api/content-types` - Create a new content type
- `GET /api/content-types` - Get all content types
- `GET /api/content-types/api-id/:apiId` - Get content type by API ID

### Content Service (`/api/content/:apiId`)

- `POST /api/content/:apiId` - Create new content entry
- `GET /api/content/:apiId` - Get all content entries for a type
- `POST /api/content/:apiId/search` - Search content with filters
- `GET /api/content/:apiId/:id` - Get a specific content entry
- `PUT /api/content/:apiId/:id` - Update a content entry
- `DELETE /api/content/:apiId/:id` - Delete a content entry

### Media Service (`/api/media`)

- `POST /api/media/upload` - Upload a media file
- `GET /api/media` - Get all media files
- `GET /api/media/files/:filename` - Serve a media file

### Permission Service (`/api/permissions`)

- `POST /api/permissions/api` - Create API permission
- `POST /api/permissions/content` - Create content permission
- `POST /api/permissions/api/check` - Check API permission

## 📁 Project Structure

```
apiforge-cms/
├── apps/
│   ├── auth/              # Authentication service
│   ├── content/            # Dynamic content service
│   ├── content-type/       # Content type definitions service
│   ├── gateway/            # API Gateway
│   ├── media/              # Media management service
│   └── permission/          # Permission management service
├── libs/
│   └── common/             # Shared libraries
│       ├── auth/           # Authentication guards and modules
│       ├── database/       # Database configuration
│       ├── dto/            # Data transfer objects
│       └── filters/        # Exception filters
└── uploads/                # Media upload directory
```

## 🗄️ Database

The project uses PostgreSQL with TypeORM. All services share the same database instance. The database configuration is centralized in `libs/common/src/database/`.

### Entities

- **User & Role** (Auth Service): User authentication and roles
- **ContentType & Field** (Content-Type Service): Dynamic content type definitions
- **Media** (Media Service): Media file metadata
- **ApiPermission & ContentPermission** (Permission Service): Permission definitions

## 🔐 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- API-level and content-level permissions
- CORS enabled on Gateway

## 🧪 Development

### Code Style

The project uses TypeScript with strict type checking. Follow NestJS best practices and conventions.

### Adding a New Service

1. Create a new app in the `apps/` directory
2. Configure the service in `nest-cli.json`
3. Add a start script in `package.json`
4. Update the Gateway routing in `apps/gateway/src/app.module.ts`

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ using NestJS

