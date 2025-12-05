# Team Ops API

A comprehensive task and team management REST API built with enterprise-grade architecture patterns and modern technologies. This system enables companies to efficiently manage teams, tasks, notifications, and user operations with real-time updates and robust security.

## 📋 Overview

Team Ops API is a scalable backend solution designed for multi-company environments, supporting hierarchical role-based access control (RBAC) with three levels: Admin, Manager, and Employee. The system provides complete CRUD operations for users, teams, and tasks, along with real-time notifications, activity logging, and performance metrics.

### Key Features

- **Multi-tenant Architecture**: Support for multiple companies with isolated data
- **Role-Based Access Control (RBAC)**: Admin, Manager, and Employee roles with granular permissions
- **Real-Time Communication**: WebSocket support for instant notifications
- **Task Management**: Full lifecycle management with priorities, statuses, and assignments
- **Team Collaboration**: Team creation, member management, and task coordination
- **Activity Logging**: Comprehensive audit trail of all system operations
- **Metrics & Analytics**: Performance monitoring and business insights
- **Event-Driven Architecture**: Decoupled modules using event emitters and message queues
- **API Documentation**: Auto-generated OpenAPI/Swagger documentation

## 🏗️ Architecture & Design Patterns

### Architectural Patterns

#### 1. **Modular Monolith Architecture**
- Domain-driven module structure with clear boundaries
- Each feature is organized as an independent module (users, tasks, teams, notifications)
- Modules communicate through well-defined interfaces and events

#### 2. **Vertical Slice Architecture**
- Features organized by use case rather than technical layers
- Each feature folder contains its complete implementation:
  - `user-create/`: Create user use case
  - `task-update/`: Update task use case
  - `team-list/`: List teams use case
- Promotes high cohesion and low coupling

#### 3. **Service Layer Pattern**
- Business logic encapsulated in dedicated service classes
- Each use case has its own service (e.g., `UserCreateService`, `TaskUpdateService`)
- Controllers remain thin, delegating to services

#### 4. **Repository Pattern**
- Data access abstracted through Prisma ORM
- `PrismaService` acts as the data access layer
- Database queries isolated from business logic

#### 5. **Event-Driven Architecture**
- Asynchronous communication between modules
- Events dispatched for significant operations (task created, user assigned)
- Event listeners handle side effects (notifications, logging)
- Decouples modules and enables extensibility

#### 6. **CQRS-inspired Pattern**
- Separation of read and write operations
- Distinct services for queries (list, find) and commands (create, update, delete)
- Optimized data retrieval and modification paths

### Design Patterns

#### 1. **Dependency Injection (DI)**
- NestJS's built-in DI container manages all dependencies
- Promotes testability and loose coupling
- Constructor injection throughout the application

#### 2. **Guard Pattern**
- Authentication guard (`JwtAuthGuard`) protects routes
- Authorization guard (`RolesGuard`) enforces role-based permissions
- WebSocket guard (`IoGuard`) secures real-time connections

#### 3. **Decorator Pattern**
- Custom decorators for cross-cutting concerns:
  - `@Public()`: Bypass authentication
  - `@Roles()`: Define required roles
  - `@CurrentUser()`: Extract user from request
- Enhances code readability and reusability

#### 4. **Strategy Pattern**
- Passport strategies for authentication (JWT)
- Allows multiple authentication mechanisms
- Easy to extend with new strategies

#### 5. **Observer Pattern**
- Event emitters notify listeners of domain events
- Listeners react to events asynchronously
- Enables loosely coupled reactive programming

#### 6. **Queue Pattern (Producer-Consumer)**
- Bull queues for background job processing
- Producers: Services that enqueue jobs
- Consumers: Processors that handle jobs
- Used for emails, notifications, and heavy operations

#### 7. **Factory Pattern**
- Prisma Client factory for database connections
- Configuration factories for module setup
- Dynamic module creation in NestJS

#### 8. **Gateway Pattern**
- WebSocket gateways for real-time communication
- Abstraction over Socket.IO protocol
- Handles connection lifecycle and message routing

## 🚀 Technologies

### Core Framework
- **NestJS 11**: Progressive Node.js framework with TypeScript
- **TypeScript 5.7**: Type-safe development
- **Node.js**: JavaScript runtime

### Database & ORM
- **PostgreSQL 16**: Relational database
- **Prisma 7**: Modern ORM with type-safety
- **Prisma Migrate**: Database schema migrations

### Authentication & Security
- **Passport.js**: Authentication middleware
- **JWT (JSON Web Tokens)**: Stateless authentication
- **bcrypt**: Password hashing
- **Guards & Decorators**: Custom authorization logic

### Real-Time & Messaging
- **Socket.IO**: WebSocket library for real-time communication
- **@nestjs/websockets**: WebSocket module integration
- **Bull**: Redis-based queue for background jobs
- **Redis 7**: In-memory data store for queues and caching

### Event-Driven
- **@nestjs/event-emitter**: Event emitter module
- **Event listeners**: Async event handlers
- **Queue processors**: Background job handlers

### API Documentation
- **Swagger/OpenAPI**: Auto-generated API documentation
- **@nestjs/swagger**: Swagger integration for NestJS

### Validation & Transformation
- **class-validator**: DTO validation decorators
- **class-transformer**: Object transformation and serialization

### Development Tools
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Docker & Docker Compose**: Containerization

### Infrastructure
- **pgAdmin 4**: PostgreSQL administration tool
- **Docker**: Container runtime

## 📦 Project Structure

```
src/
├── auth/                    # Authentication & authorization
│   ├── guards/             # JWT and role-based guards
│   ├── strategies/         # Passport strategies
│   ├── decorators/         # Custom auth decorators
│   └── dto/                # Login DTOs
├── users/                   # User management
│   ├── user-create/        # Create user use case
│   ├── user-update/        # Update user use case
│   ├── user-delete/        # Delete user use case
│   ├── user-find/          # Find user use case
│   └── user-list/          # List users use case
├── teams/                   # Team management
│   ├── team-create/
│   ├── team-update/
│   ├── team-find/
│   └── team-list/
├── tasks/                   # Task management
│   ├── task-create/
│   ├── task-update/
│   ├── task-delete/
│   ├── task-find/
│   └── task-list/
├── notifications/           # Notification system
│   ├── notification-list/
│   ├── notification-mark-as-read/
│   └── notification-unred-count/
├── events/                  # Event-driven module
│   ├── events/             # Event definitions
│   ├── listeners/          # Event listeners
│   └── services/           # Event dispatcher
├── queue/                   # Background jobs
│   ├── processors/         # Job processors
│   ├── services/           # Queue service
│   └── constants/          # Queue names
├── websocket/              # Real-time communication
│   ├── gateways/           # WebSocket gateways
│   └── interfaces/         # WebSocket types
├── metrics/                # System metrics
├── logs/                   # Activity logging
├── integrations/           # External integrations
│   └── email/              # Email service
├── database/               # Database layer
│   ├── prisma.service.ts   # Prisma service
│   └── generated/          # Generated Prisma client
└── common/                 # Shared utilities
    ├── dto/                # Common DTOs
    └── services/           # Shared services
```

## 🗄️ Database Schema

The system uses a relational database with the following main entities:

- **User**: System users with roles (Admin, Manager, Employee)
- **Company**: Multi-tenant support for multiple organizations
- **Team**: Groups of users within a company
- **Task**: Work items assigned to teams and users
- **Notification**: Real-time notifications for users
- **Log**: Audit trail of system operations

### Key Relationships
- Companies have many Users and Teams
- Teams belong to Companies and have many Users
- Tasks belong to Teams and can be assigned to Users
- Users can create and be assigned to Tasks
- Notifications belong to Users

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization (RBAC)
- Guards protecting sensitive routes
- WebSocket authentication
- Input validation and sanitization
- CORS configuration
- Multi-tenant data isolation

## 🛠️ Setup & Installation

### Prerequisites

- Node.js 18+ and Yarn
- Docker and Docker Compose
- PostgreSQL 16 (via Docker)
- Redis 7 (via Docker)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd team-ops-api
```

2. **Install dependencies**
```bash
yarn install
```

3. **Start infrastructure services**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5433
- Redis on port 6379
- pgAdmin on port 8080

4. **Configure environment variables**
Create a `.env` file with:
```env
DATABASE_URL="postgresql://nestuser:nestpass@localhost:5433/nestdb"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-secret-key
PORT=3001
```

5. **Run database migrations**
```bash
npx prisma migrate dev
```

6. **Generate Prisma Client**
```bash
npx prisma generate
```

7. **Start the application**
```bash
# Development mode with hot reload
yarn start:dev

# Production mode
yarn build
yarn start:prod
```

## 📚 API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3001/api-docs

The documentation includes:
- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality

## 🧪 Testing

```bash
# Unit tests
yarn test

# E2E tests
yarn test:e2e

# Test coverage
yarn test:cov

# Watch mode
yarn test:watch
```

## 🔄 Development Workflow

1. **Database Changes**: Modify `prisma/schema.prisma` and run migrations
2. **New Features**: Create new modules with NestJS CLI
3. **API Testing**: Use the provided `api-tests.http` file
4. **Code Quality**: Run ESLint and Prettier before commits

## 📊 Monitoring & Metrics

The `/metrics` endpoint provides system insights:
- Task statistics by status and priority
- User distribution by role
- Team performance metrics
- System health indicators

## 🌐 Real-Time Features

WebSocket namespace `/notifications` provides:
- Instant task updates
- Real-time notification delivery
- User presence tracking
- Event broadcasting to teams

## 📝 License

This project is licensed under the UNLICENSED license.
