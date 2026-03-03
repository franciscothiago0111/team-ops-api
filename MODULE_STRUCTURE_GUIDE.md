# Module Structure Guide

This document describes the standard module structure used in this NestJS application. Use this as a reference when creating new modules to maintain consistency across the codebase.

## Overview

This application follows a **feature-based modular architecture** where each domain entity (e.g., Tasks, Teams, Users) is organized as a module containing sub-modules for each operation.

## Architecture Pattern

### Main Module Structure
```
src/
  {domain}/
    {domain}.module.ts
    {operation}-{action}/
      {operation}-{action}.module.ts
      {operation}-{action}.controller.ts
      {operation}-{action}.service.ts
      {operation}-{action}.controller.spec.ts
      {operation}-{action}.service.spec.ts
      dto/
        {action}-{domain}.dto.ts
```

## Real Example: Tasks Module

```
src/
  tasks/
    tasks.module.ts                          # Main module aggregator
    task-create/                             # Create operation
      task-create.module.ts
      task-create.controller.ts
      task-create.service.ts
      task-create.controller.spec.ts
      task-create.service.spec.ts
      dto/
        create-task.dto.ts
    task-list/                               # List/Query operation
      task-list.module.ts
      task-list.controller.ts
      task-list.service.ts
      task-list.controller.spec.ts
      task-list.service.spec.ts
      dto/
        task-list.dto.ts
    task-find/                               # Find by ID operation
      task-find.module.ts
      task-find.controller.ts
      task-find.service.ts
      task-find.controller.spec.ts
      task-find.service.spec.ts
    task-update/                             # Update operation
      task-update.module.ts
      task-update.controller.ts
      task-update.service.ts
      task-update.controller.spec.ts
      task-update.service.spec.ts
      dto/
        update-task.dto.ts
    task-delete/                             # Delete operation
      task-delete.module.ts
      task-delete.controller.ts
      task-delete.service.ts
      task-delete.controller.spec.ts
      task-delete.service.spec.ts
    task-files/                              # Related sub-feature
      task-files.module.ts
      task-file-upload/
        task-file-upload.module.ts
        task-file-upload.controller.ts
        task-file-upload.service.ts
        task-file-upload.controller.spec.ts
        task-file-upload.service.spec.ts
      task-file-list/
        ...
      task-file-delete/
        ...
```

## Component Details

### 1. Main Module (`{domain}.module.ts`)

**Purpose**: Aggregates all sub-modules for the domain

**Example**:
```typescript
import { Module } from '@nestjs/common';

import { TaskCreateModule } from './task-create/task-create.module';
import { TaskDeleteModule } from './task-delete/task-delete.module';
import { TaskFilesModule } from './task-files/task-files.module';
import { TaskFindModule } from './task-find/task-find.module';
import { TaskListModule } from './task-list/task-list.module';
import { TaskUpdateModule } from './task-update/task-update.module';

@Module({
  imports: [
    TaskCreateModule,
    TaskListModule,
    TaskFindModule,
    TaskUpdateModule,
    TaskDeleteModule,
    TaskFilesModule,
  ],
})
export class TasksModule {}
```

**Characteristics**:
- No controllers or providers
- Only imports sub-modules
- Exports nothing (sub-modules are self-contained)

---

### 2. Sub-Module (`{operation}-{action}.module.ts`)

**Purpose**: Defines dependencies and exports for a specific operation

**Example**:
```typescript
import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';
import { EventsModule } from 'src/events/events.module';

import { TaskCreateController } from './task-create.controller';
import { TaskCreateService } from './task-create.service';

@Module({
  imports: [DatabaseModule, CommonModule, EventsModule],
  controllers: [TaskCreateController],
  providers: [TaskCreateService],
})
export class TaskCreateModule {}
```

**Common Imports**:
- `DatabaseModule` - Required for Prisma database access
- `CommonModule` - Provides `ResponseService` for standardized responses
- `EventsModule` - Required when emitting domain events

---

### 3. Controller (`{operation}-{action}.controller.ts`)

**Purpose**: Handles HTTP requests and responses

**Example**:
```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { CreateTaskDto } from './dto/create-task.dto';
import { TaskCreateService } from './task-create.service';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TaskCreateController {
  constructor(
    private readonly taskCreateService: TaskCreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    const task = await this.taskCreateService.create(createTaskDto, user);
    return this.responseService.success({
      message: 'Task created successfully',
      data: task,
    });
  }
}
```

**Standard Patterns**:
- **Decorators**:
  - `@ApiTags('domain')` - Groups endpoints in Swagger
  - `@ApiBearerAuth()` - Requires JWT authentication
  - `@ApiOperation()` - Documents endpoint purpose
  - `@Roles()` - Restricts access by user role (when needed)

- **Dependency Injection**:
  - Always inject the corresponding service
  - Always inject `ResponseService` for consistent responses

- **Authentication**:
  - Use `@CurrentUser()` decorator to get authenticated user
  - Type as `UserPayload` interface

- **Response Format**:
  - Use `responseService.success()` for single items
  - Use `responseService.pagination()` for lists

---

### 4. Service (`{operation}-{action}.service.ts`)

**Purpose**: Contains business logic and database operations

**Example**:
```typescript
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';
import {
  EventDispatcherService,
  EVENT_NAMES,
  TaskCreatedEvent,
} from 'src/events';

import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: UserPayload) {
    // 1. Validate related entities
    const team = await this.prisma.team.findUnique({
      where: { id: createTaskDto.teamId },
      include: { company: true },
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // 2. Check permissions
    if (user.role === 'MANAGER' && team.managerId !== user.id) {
      throw new ForbiddenException(
        'You must belong to the team to create tasks',
      );
    }

    // 3. Check company boundary
    if (user.companyId && team.companyId !== user.companyId) {
      throw new ForbiddenException('Team must belong to your company');
    }

    // 4. Perform database operation
    const task = await this.prisma.task.create({
      data: {
        name: createTaskDto.name,
        description: createTaskDto.description,
        status: createTaskDto.status || 'PENDING',
        priority: createTaskDto.priority || 'MEDIUM',
        dueDate: createTaskDto.dueDate ? new Date(createTaskDto.dueDate) : null,
        assignedToId: createTaskDto.assignedToId,
        createdById: user.id,
        teamId: team.id,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 5. Emit domain events
    this.eventDispatcher.dispatch(
      EVENT_NAMES.TASK_CREATED,
      new TaskCreatedEvent(
        task.id,
        task.name,
        task.description || '',
        task.status,
        task.priority,
        user.id,
        team.companyId,
        team.id,
      ),
    );

    return task;
  }
}
```

**Standard Patterns**:
- **Dependency Injection**:
  - `PrismaService` - For database access
  - `EventDispatcherService` - For emitting domain events (when needed)

- **Validation Flow**:
  1. Validate related entities exist
  2. Check user permissions (role-based)
  3. Verify company/team boundaries
  4. Perform operation
  5. Emit events (if applicable)

- **Error Handling**:
  - `NotFoundException` - Entity not found
  - `ForbiddenException` - Permission denied
  - `BadRequestException` - Invalid input/state

- **Include Relations**:
  - Always include commonly needed relations
  - Use `select` to limit fields (avoid exposing passwords, etc.)

---

### 5. DTOs (`dto/*.dto.ts`)

**Purpose**: Define and validate request/response data structures

#### Create DTO Example:
```typescript
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Priority, TaskStatus } from 'src/database/generated/prisma/client';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Task name',
    example: 'Complete project documentation',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Write comprehensive documentation for the API',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: Priority,
    example: Priority.MEDIUM,
  })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @ApiPropertyOptional({
    description: 'Task due date',
    example: '2025-12-31T23:59:59.000Z',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiProperty({
    description: 'ID of the team this task belongs to',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsNotEmpty()
  teamId: string;

  @ApiPropertyOptional({
    description: 'ID of the user assigned to this task',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  assignedToId?: string;
}
```

#### List/Query DTO Example:
```typescript
import { IsEnum, IsOptional } from 'class-validator';

import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseQueryDto } from 'src/common/dto';
import { TaskStatus, Priority } from 'src/database/generated/prisma/client';

export class TaskListDto extends BaseQueryDto {
  @ApiPropertyOptional({
    description: 'Filter tasks by status',
    enum: TaskStatus,
    example: TaskStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Filter tasks by priority',
    enum: Priority,
    example: Priority.HIGH,
  })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
}
```

**DTO Patterns**:
- **Swagger Documentation**:
  - `@ApiProperty()` - Required fields
  - `@ApiPropertyOptional()` - Optional fields
  - Always include `description` and `example`
  - Use `enum` for enums

- **Validation Decorators**:
  - `@IsNotEmpty()` - Required fields
  - `@IsOptional()` - Optional fields
  - `@IsString()`, `@IsUUID()`, `@IsEnum()`, etc. - Type validation
  - `@IsDateString()` - Date validation

- **Base Classes**:
  - Extend `BaseQueryDto` for list endpoints (includes pagination)
  - Use `PartialType()` for update DTOs when appropriate

---

## Operation Types

### Standard CRUD Operations

1. **Create** (`{domain}-create`)
   - **HTTP**: `POST /{domain}`
   - **Purpose**: Create new entity
   - **Response**: Created entity with relations

2. **List** (`{domain}-list`)
   - **HTTP**: `GET /{domain}`
   - **Purpose**: Query entities with filters and pagination
   - **Response**: Paginated list
   - **DTO**: Extends `BaseQueryDto`

3. **Find** (`{domain}-find`)
   - **HTTP**: `GET /{domain}/:id`
   - **Purpose**: Get single entity by ID
   - **Response**: Single entity with relations

4. **Update** (`{domain}-update`)
   - **HTTP**: `PUT /{domain}/:id` or `PATCH /{domain}/:id`
   - **Purpose**: Update existing entity
   - **Response**: Updated entity with relations

5. **Delete** (`{domain}-delete`)
   - **HTTP**: `DELETE /{domain}/:id`
   - **Purpose**: Delete entity
   - **Response**: Success confirmation or deleted entity

### Custom Operations

For domain-specific operations, follow the same pattern:
- `{domain}-{custom-action}/` directory
- Example: `task-files/`, `notification-mark-as-read/`

---

## Common Module Dependencies

### Required Modules

1. **DatabaseModule**
   - Provides `PrismaService`
   - Required by all operations that access database

2. **CommonModule**
   - Provides `ResponseService`
   - Required by all controllers

3. **EventsModule** (conditional)
   - Provides `EventDispatcherService`
   - Required when emitting domain events

### Common Services

#### ResponseService
Used for standardized API responses:

```typescript
// Success response (single item)
this.responseService.success({
  message: 'Task created successfully',
  data: task,
});

// Pagination response (list)
this.responseService.pagination({
  data: tasks,
  total: totalCount,
  currentPage: page,
  limit: limit,
  message: 'Tasks retrieved successfully',
});
```

#### EventDispatcherService
Used for emitting domain events:

```typescript
this.eventDispatcher.dispatch(
  EVENT_NAMES.TASK_CREATED,
  new TaskCreatedEvent(
    task.id,
    task.name,
    task.description || '',
    task.status,
    task.priority,
    user.id,
    team.companyId,
    team.id,
  ),
);
```

---

## Security & Authorization

### Authentication
All protected endpoints use:
```typescript
@ApiBearerAuth()
@Controller('domain')
```

Access current user via:
```typescript
async method(@CurrentUser() user: UserPayload) {
  // user.id, user.role, user.companyId available
}
```

### Role-Based Access Control
Use `@Roles()` decorator when needed:
```typescript
@Roles(Role.ADMIN, Role.MANAGER)
@Delete(':id')
async delete(@Param('id') id: string) {
  // Only ADMIN and MANAGER can access
}
```

### Permission Validation Patterns

1. **Company Boundary Check**:
```typescript
if (user.companyId && entity.companyId !== user.companyId) {
  throw new ForbiddenException('Entity must belong to your company');
}
```

2. **Role-Based Logic**:
```typescript
if (user.role === Role.EMPLOYEE) {
  // Employees can only see their own tasks
  where.assignedToId = user.id;
} else if (user.role === Role.MANAGER) {
  // Managers see tasks from their teams
  where.team = { managerId: user.id };
} else if (user.role === Role.ADMIN) {
  // Admins see all company tasks
  where.team = { companyId: user.companyId };
}
```

---

## Testing Structure

Each module should have corresponding test files:

```
{operation}-{action}.controller.spec.ts
{operation}-{action}.service.spec.ts
```

Follow NestJS testing patterns with mocking for dependencies.

---

## Checklist for Creating a New Module

### 1. Database Schema
- [ ] Add Prisma model to `schema.prisma`
- [ ] Create migration: `npx prisma migrate dev --name add_{feature}`
- [ ] Generate Prisma client: `npx prisma generate`

### 2. Main Module
- [ ] Create `src/{domain}/` directory
- [ ] Create `{domain}.module.ts` to aggregate sub-modules

### 3. For Each Operation
- [ ] Create `{domain}-{operation}/` directory
- [ ] Create `{operation}-{domain}.module.ts`
- [ ] Create `{operation}-{domain}.controller.ts`
  - [ ] Add `@ApiTags()`, `@ApiBearerAuth()`
  - [ ] Add `@ApiOperation()` for each endpoint
  - [ ] Inject service and `ResponseService`
  - [ ] Use `@CurrentUser()` for auth
  - [ ] Add `@Roles()` if needed
- [ ] Create `{operation}-{domain}.service.ts`
  - [ ] Inject `PrismaService`
  - [ ] Inject `EventDispatcherService` if events needed
  - [ ] Implement validation logic
  - [ ] Implement business logic
  - [ ] Emit events if needed
- [ ] Create `dto/` directory
  - [ ] Create DTOs with validation decorators
  - [ ] Add Swagger documentation
  - [ ] Extend `BaseQueryDto` for list operations
- [ ] Create test files (`.spec.ts`)

### 4. Events (if needed)
- [ ] Define event class in `src/events/events/`
- [ ] Add event name to `src/events/constants/event-names.ts`
- [ ] Create listener in `src/events/listeners/`
- [ ] Register listener in `EventsModule`

### 5. Integration
- [ ] Import domain module in `AppModule`
- [ ] Test endpoints via Swagger or HTTP client
- [ ] Verify authorization rules
- [ ] Verify events are emitted and handled

---

## Example: Creating a "Projects" Module

Let's say you need to create a Projects module:

### 1. Prisma Model
```prisma
model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
  
  createdById String
  createdBy   User   @relation(fields: [createdById], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("projects")
}

enum ProjectStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}
```

### 2. Directory Structure
```
src/
  projects/
    projects.module.ts
    project-create/
      project-create.module.ts
      project-create.controller.ts
      project-create.service.ts
      project-create.controller.spec.ts
      project-create.service.spec.ts
      dto/
        create-project.dto.ts
    project-list/
      project-list.module.ts
      project-list.controller.ts
      project-list.service.ts
      project-list.controller.spec.ts
      project-list.service.spec.ts
      dto/
        project-list.dto.ts
    project-find/
      ...
    project-update/
      ...
    project-delete/
      ...
```

### 3. Main Module
```typescript
// projects.module.ts
import { Module } from '@nestjs/common';

import { ProjectCreateModule } from './project-create/project-create.module';
import { ProjectDeleteModule } from './project-delete/project-delete.module';
import { ProjectFindModule } from './project-find/project-find.module';
import { ProjectListModule } from './project-list/project-list.module';
import { ProjectUpdateModule } from './project-update/project-update.module';

@Module({
  imports: [
    ProjectCreateModule,
    ProjectListModule,
    ProjectFindModule,
    ProjectUpdateModule,
    ProjectDeleteModule,
  ],
})
export class ProjectsModule {}
```

### 4. Import in AppModule
```typescript
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    // ... other modules
    ProjectsModule,
  ],
})
export class AppModule {}
```

---

## Best Practices

1. **Single Responsibility**: Each sub-module handles only one operation
2. **Consistent Naming**: Follow `{domain}-{action}` pattern
3. **Separation of Concerns**: 
   - Controllers handle HTTP
   - Services handle business logic
   - DTOs handle validation
4. **Error Handling**: Use appropriate NestJS exceptions
5. **Documentation**: Always add Swagger decorators
6. **Security**: Always validate company/team boundaries
7. **Events**: Emit events for important domain actions
8. **Testing**: Write unit tests for services and controllers
9. **Type Safety**: Use generated Prisma types
10. **Code Reuse**: Extend base DTOs when possible

---

## Related Documentation

- **Prisma Schema**: `prisma/schema.prisma`
- **Common DTOs**: `src/common/dto/`
- **Auth Decorators**: `src/auth/decorators/`
- **Events System**: `src/events/`
- **Response Service**: `src/common/services/response.service.ts`

---

## Questions or Issues?

When creating a new module, refer back to the Tasks module as the reference implementation. It demonstrates all patterns and best practices used in this codebase.
