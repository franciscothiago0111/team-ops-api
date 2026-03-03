# How to Create New Modules - Developer Guide

This is a practical, step-by-step guide for developers creating new modules in this NestJS application. Follow these instructions to ensure consistency with the existing codebase.

## 📚 Prerequisites

Before starting, read the [`MODULE_STRUCTURE_GUIDE.md`](./MODULE_STRUCTURE_GUIDE.md) to understand the architecture patterns used in this project.

---

## 🚀 Quick Start: 5-Step Process

1. **Define the database schema** (Prisma)
2. **Create the module structure** (folders & files)
3. **Implement CRUD operations** (one at a time)
4. **Add events** (if needed)
5. **Test and integrate**

---

## Step 1: Define Database Schema

### 1.1 Edit Prisma Schema

Open `prisma/schema.prisma` and add your model:

```prisma
model YourEntity {
  id          String   @id @default(uuid())
  name        String
  description String?
  
  // Relations
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
  
  createdById String
  createdBy   User   @relation(fields: [createdById], references: [id])
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("your_entities")  // Plural, snake_case for table name
}
```

**Key Rules**:
- Always include `id`, `createdAt`, `updatedAt`
- Include `companyId` for multi-tenancy
- Include `createdById` for audit trail
- Use `@@map()` to set table name (plural, snake_case)
- Add enums if needed (e.g., status, priority)

### 1.2 Create Migration

```powershell
npx prisma migrate dev --name add_your_entity
```

### 1.3 Generate Prisma Client

```powershell
npx prisma generate
```

---

## Step 2: Create Module Structure

### 2.1 Create Main Directory

```powershell
mkdir src/your-entities
```

### 2.2 Create Main Module File

Create `src/your-entities/your-entities.module.ts`:

```typescript
import { Module } from '@nestjs/common';

@Module({
  imports: [
    // Sub-modules will be added here as you create them
  ],
})
export class YourEntitiesModule {}
```

### 2.3 Import in AppModule

Edit `src/app.module.ts`:

```typescript
import { YourEntitiesModule } from './your-entities/your-entities.module';

@Module({
  imports: [
    // ... existing modules
    YourEntitiesModule,
  ],
})
export class AppModule {}
```

---

## Step 3: Implement CRUD Operations

Create operations **one at a time** in this order:

### Operation 1: CREATE

#### 3.1.1 Create Directory
```powershell
mkdir src/your-entities/your-entity-create
mkdir src/your-entities/your-entity-create/dto
```

#### 3.1.2 Create DTO

Create `src/your-entities/your-entity-create/dto/create-your-entity.dto.ts`:

```typescript
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateYourEntityDto {
  @ApiProperty({
    description: 'Entity name',
    example: 'My Entity',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Entity description',
    example: 'A detailed description',
  })
  @IsString()
  @IsOptional()
  description?: string;

  // Add other fields as needed
}
```

#### 3.1.3 Create Service

Create `src/your-entities/your-entity-create/your-entity-create.service.ts`:

```typescript
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PrismaService } from 'src/database/prisma.service';

import { CreateYourEntityDto } from './dto/create-your-entity.dto';

@Injectable()
export class YourEntityCreateService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateYourEntityDto, user: UserPayload) {
    // 1. Validate related entities (if any)
    
    // 2. Check permissions
    if (user.role === 'EMPLOYEE') {
      throw new ForbiddenException('Employees cannot create entities');
    }

    // 3. Create the entity
    const entity = await this.prisma.yourEntity.create({
      data: {
        name: dto.name,
        description: dto.description,
        companyId: user.companyId,
        createdById: user.id,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // 4. Emit events (optional, see Step 4)
    
    return entity;
  }
}
```

#### 3.1.4 Create Controller

Create `src/your-entities/your-entity-create/your-entity-create.controller.ts`:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';
import { Role } from 'src/database/generated/prisma/client';

import { CreateYourEntityDto } from './dto/create-your-entity.dto';
import { YourEntityCreateService } from './your-entity-create.service';

@ApiTags('your-entities')
@ApiBearerAuth()
@Controller('your-entities')
export class YourEntityCreateController {
  constructor(
    private readonly service: YourEntityCreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  @ApiOperation({ summary: 'Create a new entity' })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() dto: CreateYourEntityDto,
  ) {
    const entity = await this.service.create(dto, user);
    return this.responseService.success({
      message: 'Entity created successfully',
      data: entity,
    });
  }
}
```

#### 3.1.5 Create Module

Create `src/your-entities/your-entity-create/your-entity-create.module.ts`:

```typescript
import { Module } from '@nestjs/common';

import { CommonModule } from 'src/common/common.module';
import { DatabaseModule } from 'src/database/database.module';

import { YourEntityCreateController } from './your-entity-create.controller';
import { YourEntityCreateService } from './your-entity-create.service';

@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [YourEntityCreateController],
  providers: [YourEntityCreateService],
})
export class YourEntityCreateModule {}
```

#### 3.1.6 Update Main Module

Edit `src/your-entities/your-entities.module.ts`:

```typescript
import { Module } from '@nestjs/common';

import { YourEntityCreateModule } from './your-entity-create/your-entity-create.module';

@Module({
  imports: [
    YourEntityCreateModule,
  ],
})
export class YourEntitiesModule {}
```

#### 3.1.7 Create Test Files

Create empty test files (to be implemented):
- `your-entity-create.controller.spec.ts`
- `your-entity-create.service.spec.ts`

---

### Operation 2: LIST

#### 3.2.1 Create Directory
```powershell
mkdir src/your-entities/your-entity-list
mkdir src/your-entities/your-entity-list/dto
```

#### 3.2.2 Create DTO

Create `src/your-entities/your-entity-list/dto/your-entity-list.dto.ts`:

```typescript
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { BaseQueryDto } from 'src/common/dto';

export class YourEntityListDto extends BaseQueryDto {
  // Add specific filters here
  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'ACTIVE',
  })
  @IsOptional()
  @IsString()
  status?: string;
}
```

#### 3.2.3 Create Service

Create `src/your-entities/your-entity-list/your-entity-list.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/database/prisma.service';
import { Role } from 'src/database/generated/prisma/client';

import { YourEntityListDto } from './dto/your-entity-list.dto';

@Injectable()
export class YourEntityListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: YourEntityListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get user for role-based filtering
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    // Build where clause
    const where: any = {};

    // Role-based filtering
    if (user.role === Role.ADMIN) {
      where.companyId = user.companyId;
    } else if (user.role === Role.MANAGER) {
      // Custom logic for managers
      where.companyId = user.companyId;
    } else {
      // Employees see only their own
      where.createdById = userId;
    }

    // Apply additional filters
    if (query.name) {
      where.name = {
        contains: query.name,
        mode: 'insensitive',
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    const [entities, total] = await Promise.all([
      this.prisma.yourEntity.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: { id: true, name: true },
          },
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.yourEntity.count({ where }),
    ]);

    return {
      data: entities,
      total,
      currentPage: page,
      limit,
    };
  }
}
```

#### 3.2.4 Create Controller

Create `src/your-entities/your-entity-list/your-entity-list.controller.ts`:

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import type { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { ResponseService } from 'src/common/services';

import { YourEntityListDto } from './dto/your-entity-list.dto';
import { YourEntityListService } from './your-entity-list.service';

@ApiTags('your-entities')
@ApiBearerAuth()
@Controller('your-entities')
export class YourEntityListController {
  constructor(
    private readonly service: YourEntityListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all entities' })
  async list(
    @CurrentUser() user: UserPayload,
    @Query() query: YourEntityListDto,
  ) {
    const result = await this.service.list(user.id, query);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: 'Entities retrieved successfully',
    });
  }
}
```

#### 3.2.5 Create Module and Update Main Module

Follow the same pattern as CREATE operation (steps 3.1.5 and 3.1.6).

---

### Operation 3: FIND (Get by ID)

Follow the same pattern, but:
- Use `@Get(':id')` in controller
- Use `@Param('id') id: string` to get the ID
- Service method: `async findOne(id: string, user: UserPayload)`
- Validate that user has permission to view the entity

---

### Operation 4: UPDATE

Follow the same pattern, but:
- Use `@Put(':id')` or `@Patch(':id')` in controller
- Create `UpdateYourEntityDto` (use `PartialType` or make all fields optional)
- Validate entity exists and user has permission
- Only update provided fields

---

### Operation 5: DELETE

Follow the same pattern, but:
- Use `@Delete(':id')` in controller
- Usually restricted to ADMIN/MANAGER roles with `@Roles()`
- Validate entity exists and user has permission
- Consider soft delete vs hard delete

---

## Step 4: Add Events (Optional)

If your entity needs to trigger events (notifications, logs, etc.):

### 4.1 Define Event Class

Create `src/events/events/your-entity-created.event.ts`:

```typescript
export class YourEntityCreatedEvent {
  constructor(
    public readonly entityId: string,
    public readonly entityName: string,
    public readonly createdById: string,
    public readonly companyId: string,
  ) {}
}
```

### 4.2 Add Event Name

Edit `src/events/constants/event-names.ts`:

```typescript
export const EVENT_NAMES = {
  // ... existing events
  YOUR_ENTITY_CREATED: 'your-entity.created',
  YOUR_ENTITY_UPDATED: 'your-entity.updated',
  YOUR_ENTITY_DELETED: 'your-entity.deleted',
};
```

### 4.3 Create Event Listener

Create `src/events/listeners/your-entity-created.listener.ts`:

```typescript
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EVENT_NAMES } from '../constants/event-names';
import { YourEntityCreatedEvent } from '../events/your-entity-created.event';

@Injectable()
export class YourEntityCreatedListener {
  constructor(
    // Inject services you need (e.g., NotificationService)
  ) {}

  @OnEvent(EVENT_NAMES.YOUR_ENTITY_CREATED)
  async handle(event: YourEntityCreatedEvent) {
    // Handle the event
    console.log('Entity created:', event.entityId);
    
    // Send notifications, create logs, etc.
  }
}
```

### 4.4 Register Listener

Edit `src/events/events.module.ts` to include your listener in providers.

### 4.5 Emit Event in Service

Edit your create service to emit the event:

```typescript
import { EventDispatcherService } from 'src/events';
import { EVENT_NAMES } from 'src/events/constants/event-names';
import { YourEntityCreatedEvent } from 'src/events/events/your-entity-created.event';

@Injectable()
export class YourEntityCreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService, // Add this
  ) {}

  async create(dto: CreateYourEntityDto, user: UserPayload) {
    // ... create entity

    // Emit event
    this.eventDispatcher.dispatch(
      EVENT_NAMES.YOUR_ENTITY_CREATED,
      new YourEntityCreatedEvent(
        entity.id,
        entity.name,
        user.id,
        user.companyId,
      ),
    );

    return entity;
  }
}
```

### 4.6 Import EventsModule

Edit your operation module:

```typescript
import { EventsModule } from 'src/events/events.module';

@Module({
  imports: [DatabaseModule, CommonModule, EventsModule], // Add EventsModule
  // ...
})
export class YourEntityCreateModule {}
```

---

## Step 5: Test and Integrate

### 5.1 Start Development Server

```powershell
npm run start:dev
```

### 5.2 Test with Swagger

1. Open `http://localhost:3000/api`
2. Authenticate (get JWT token)
3. Test each endpoint:
   - POST `/your-entities` (create)
   - GET `/your-entities` (list)
   - GET `/your-entities/:id` (find)
   - PUT `/your-entities/:id` (update)
   - DELETE `/your-entities/:id` (delete)

### 5.3 Test with HTTP Client

You can use the `api-tests.http` file or create a new one:

```http
### Create Entity
POST http://localhost:3000/your-entities
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Test Entity",
  "description": "Test description"
}

### List Entities
GET http://localhost:3000/your-entities?page=1&limit=10
Authorization: Bearer {{token}}

### Get Entity by ID
GET http://localhost:3000/your-entities/{{entityId}}
Authorization: Bearer {{token}}
```

### 5.4 Verify

- ✅ All endpoints work correctly
- ✅ Authentication is required
- ✅ Authorization rules are enforced
- ✅ Company boundaries are respected
- ✅ Events are emitted (if implemented)
- ✅ Swagger documentation is complete

---

## 📋 Checklist Template

Use this checklist when creating a new module:

```
Module: ___________________

[ ] Step 1: Database Schema
  [ ] Created Prisma model
  [ ] Created migration
  [ ] Generated Prisma client
  [ ] Updated related models if needed

[ ] Step 2: Module Structure
  [ ] Created main directory
  [ ] Created main module file
  [ ] Imported in AppModule

[ ] Step 3: CRUD Operations
  [ ] CREATE
    [ ] Created directory and DTO
    [ ] Implemented service with validation
    [ ] Implemented controller
    [ ] Created module file
    [ ] Updated main module
    [ ] Created test files
  
  [ ] LIST
    [ ] Created directory and DTO (extends BaseQueryDto)
    [ ] Implemented service with role-based filtering
    [ ] Implemented controller
    [ ] Created module file
    [ ] Updated main module
    [ ] Created test files
  
  [ ] FIND
    [ ] Implemented with permission validation
  
  [ ] UPDATE
    [ ] Implemented with permission validation
  
  [ ] DELETE
    [ ] Implemented with role restriction

[ ] Step 4: Events (if needed)
  [ ] Defined event classes
  [ ] Added event names to constants
  [ ] Created listeners
  [ ] Registered listeners
  [ ] Emitting events in services
  [ ] Imported EventsModule

[ ] Step 5: Testing
  [ ] Tested all endpoints in Swagger
  [ ] Verified authentication
  [ ] Verified authorization
  [ ] Verified company boundaries
  [ ] Verified events are working
  [ ] Created HTTP test file
```

---

## 🔧 Common Issues and Solutions

### Issue: "Cannot find module 'src/database/generated/prisma/client'"

**Solution**: Run `npx prisma generate` to regenerate the Prisma client.

### Issue: Module not found in Swagger

**Solution**: 
1. Check that module is imported in `AppModule`
2. Restart the development server
3. Verify `@ApiTags()` decorator is present

### Issue: 403 Forbidden on all requests

**Solution**: 
1. Check JWT token is valid
2. Verify `@ApiBearerAuth()` is on controller
3. Check role-based restrictions with `@Roles()`

### Issue: Events not being triggered

**Solution**:
1. Verify `EventsModule` is imported in operation module
2. Check event name matches exactly in constants
3. Verify listener is registered in `EventsModule`
4. Check `EventDispatcherService` is injected

### Issue: Company boundary not working

**Solution**: Always validate `companyId` in services:
```typescript
if (user.companyId && entity.companyId !== user.companyId) {
  throw new ForbiddenException('Access denied');
}
```

---

## 🎯 Tips for Success

1. **Start Small**: Implement CREATE first, test it, then move to LIST, etc.
2. **Follow Naming Conventions**: Use kebab-case for directories, PascalCase for classes
3. **Copy & Adapt**: Use Tasks module as reference, copy files and adapt them
4. **Test Frequently**: Test each operation before moving to the next
5. **Check Permissions**: Always validate user permissions and company boundaries
6. **Document**: Add clear Swagger descriptions and examples
7. **Use TypeScript**: Let the compiler help you catch errors early
8. **Keep It Consistent**: Follow the same patterns across all modules
9. **Read Error Messages**: NestJS errors are usually clear about what's wrong
10. **Ask for Review**: Have another developer review your module structure

---

## 📖 Reference Files

When in doubt, check these files for examples:

- **Complete Module**: `src/tasks/` - Full CRUD implementation
- **Base DTOs**: `src/common/dto/base-query.dto.ts`
- **Auth Decorators**: `src/auth/decorators/`
- **Response Service**: `src/common/services/response.service.ts`
- **Prisma Service**: `src/database/prisma.service.ts`
- **Events**: `src/events/`

---

## 🤖 Using AI to Generate Modules

If you're using an AI assistant to generate modules:

**Prompt Template**:
```
Create a new module for [ENTITY_NAME] in this NestJS application following the MODULE_STRUCTURE_GUIDE.md.

The entity should have these fields:
- [field1]: [type]
- [field2]: [type]

Access rules:
- [ROLE] can [actions]
- [ROLE] can [actions]

Please:
1. Create the Prisma model
2. Create all CRUD operations (create, list, find, update, delete)
3. Add proper validation and authorization
4. Include Swagger documentation
5. Follow the exact structure from the guide
```

---

## Need Help?

- Review the [`MODULE_STRUCTURE_GUIDE.md`](./MODULE_STRUCTURE_GUIDE.md)
- Check the Tasks module implementation
- Ask your team for code review
- Test each operation thoroughly before moving on

Happy coding! 🚀
