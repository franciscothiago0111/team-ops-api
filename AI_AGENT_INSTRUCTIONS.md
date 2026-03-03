# AI Agent Instructions - Module Creation

This document provides instructions for AI agents (like GitHub Copilot, Claude, ChatGPT, etc.) to autonomously create new modules in this NestJS application.

## 🤖 AI Agent Overview

When a user requests a new module, follow these instructions to create a complete, consistent implementation that matches the existing codebase patterns.

---

## 📋 Input Required from User

Before starting, gather this information from the user:

1. **Entity Name** (e.g., "Project", "Invoice", "Department")
2. **Fields/Properties** with types
3. **Relationships** (belongs to Company? Team? User?)
4. **Access Rules** (who can create/read/update/delete?)
5. **Special Features** (file uploads? status workflow? notifications?)

---

## 🎯 Execution Plan

### Phase 1: Analysis & Planning
1. Read `MODULE_STRUCTURE_GUIDE.md` for architecture patterns
2. Read `HOW_TO_CREATE_MODULES.md` for step-by-step process
3. Analyze existing modules (especially `src/tasks/`) as reference
4. Create an execution plan with checklist

### Phase 2: Database Schema
1. Read `prisma/schema.prisma` to understand existing models
2. Create new Prisma model with:
   - Standard fields (id, createdAt, updatedAt)
   - User-specified fields
   - Relations (companyId, createdById, etc.)
   - Enums if needed
3. Generate migration command (show to user, don't execute)
4. Generate Prisma client command (show to user, don't execute)

### Phase 3: Module Structure
1. Create main module directory
2. Create main module file
3. Update `app.module.ts` to import new module

### Phase 4: CRUD Operations
**For each operation (CREATE, LIST, FIND, UPDATE, DELETE):**

1. Create operation directory structure
2. Create DTO with:
   - Validation decorators
   - Swagger documentation
   - Type safety
3. Create Service with:
   - Business logic
   - Permission validation
   - Company boundary checks
   - Event emission (if needed)
4. Create Controller with:
   - HTTP method decorator
   - Swagger decorators
   - Role-based guards
   - Response formatting
5. Create Module file
6. Update main module imports
7. Create placeholder test files

### Phase 5: Events (if needed)
1. Create event classes
2. Add event names to constants
3. Create listeners
4. Register listeners in EventsModule
5. Update services to emit events

### Phase 6: Documentation & Verification
1. Create HTTP test file examples
2. Provide testing instructions
3. List all created files
4. Provide checklist for user verification

---

## 🔧 Implementation Guidelines

### Naming Conventions
- **Directories**: `kebab-case` (e.g., `your-entity-create`)
- **Classes**: `PascalCase` (e.g., `YourEntityCreateService`)
- **Files**: `kebab-case.type.ts` (e.g., `your-entity-create.service.ts`)
- **Database tables**: `snake_case`, plural (e.g., `your_entities`)
- **Prisma models**: `PascalCase`, singular (e.g., `YourEntity`)

### Standard Imports
Always include these imports in services:
```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
```

Always include these imports in controllers:
```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ResponseService } from 'src/common/services';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
```

### Prisma Model Template
```typescript
model YourEntity {
  id          String   @id @default(uuid())
  name        String
  description String?
  
  // Always include company relation for multi-tenancy
  companyId String
  company   Company @relation(fields: [companyId], references: [id])
  
  // Always include creator for audit trail
  createdById String
  createdBy   User   @relation(fields: [createdById], references: [id])
  
  // Always include timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("your_entities")
}
```

### DTO Validation Template
```typescript
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateYourEntityDto {
  @ApiProperty({ description: '...', example: '...' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '...', example: '...' })
  @IsString()
  @IsOptional()
  description?: string;
}
```

### Service Permission Check Template
```typescript
// 1. Check role
if (user.role === 'EMPLOYEE') {
  throw new ForbiddenException('Employees cannot perform this action');
}

// 2. Check company boundary
if (user.companyId && entity.companyId !== user.companyId) {
  throw new ForbiddenException('Entity must belong to your company');
}

// 3. Check ownership (for updates/deletes)
if (entity.createdById !== user.id && user.role !== 'ADMIN') {
  throw new ForbiddenException('You do not have permission to modify this entity');
}
```

### Controller Response Template
```typescript
// Single item response
return this.responseService.success({
  message: 'Entity created successfully',
  data: entity,
});

// Paginated list response
return this.responseService.pagination({
  data: result.data,
  total: result.total,
  currentPage: result.currentPage,
  limit: result.limit,
  message: 'Entities retrieved successfully',
});
```

### Role-Based Access Pattern
```typescript
// In LIST service
if (user.role === Role.ADMIN) {
  // Admin sees all in company
  where.companyId = user.companyId;
} else if (user.role === Role.MANAGER) {
  // Manager sees specific subset
  where.companyId = user.companyId;
  // Add manager-specific filters
} else {
  // Employee sees only their own
  where.createdById = user.id;
}
```

---

## 📝 Step-by-Step Workflow

### Step 1: Gather Requirements
```
User Request Example:
"Create a Projects module with name, description, status (ACTIVE/COMPLETED/ARCHIVED), 
due date, and it should belong to a company. Only managers and admins can create projects."

AI Agent Analysis:
- Entity: Project
- Fields: name (string, required), description (string, optional), 
  status (enum, default ACTIVE), dueDate (DateTime, optional)
- Relations: companyId, createdById
- Access: ADMIN/MANAGER can create, EMPLOYEE can view
- Events: Emit PROJECT_CREATED
```

### Step 2: Create Execution Checklist
Use the `manage_todo_list` tool to create a checklist:

```typescript
manage_todo_list({
  todoList: [
    {
      id: 1,
      title: "Create Prisma model and show migration commands",
      description: "Add Project model to schema.prisma with all fields and relations",
      status: "not-started"
    },
    {
      id: 2,
      title: "Create main module structure",
      description: "Create projects/ directory, projects.module.ts, update app.module.ts",
      status: "not-started"
    },
    {
      id: 3,
      title: "Implement CREATE operation",
      description: "Create project-create/ with service, controller, DTO, module",
      status: "not-started"
    },
    {
      id: 4,
      title: "Implement LIST operation",
      description: "Create project-list/ with service, controller, DTO, module",
      status: "not-started"
    },
    {
      id: 5,
      title: "Implement FIND operation",
      description: "Create project-find/ with service, controller, module",
      status: "not-started"
    },
    {
      id: 6,
      title: "Implement UPDATE operation",
      description: "Create project-update/ with service, controller, DTO, module",
      status: "not-started"
    },
    {
      id: 7,
      title: "Implement DELETE operation",
      description: "Create project-delete/ with service, controller, module",
      status: "not-started"
    },
    {
      id: 8,
      title: "Add events (if needed)",
      description: "Create event classes, listeners, update EventsModule",
      status: "not-started"
    },
    {
      id: 9,
      title: "Create test file and documentation",
      description: "Create HTTP test examples, provide testing instructions",
      status: "not-started"
    }
  ]
})
```

### Step 3: Execute Each Todo
For each todo item:
1. Mark as `in-progress` using `manage_todo_list`
2. Use appropriate tools (`create_file`, `replace_string_in_file`)
3. Mark as `completed` immediately after finishing
4. Move to next todo

### Step 4: Create Files in Order

#### 4.1 Prisma Model
```typescript
// Read existing schema first
read_file({
  filePath: "c:/projetos/team-ops-api/prisma/schema.prisma",
  startLine: 1,
  endLine: 50
})

// Add model at the end
replace_string_in_file({
  filePath: "c:/projetos/team-ops-api/prisma/schema.prisma",
  oldString: "// Last line of existing models...",
  newString: `// Last line of existing models...

model Project {
  id          String   @id @default(uuid())
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  dueDate     DateTime?
  
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
}`
})

// Also update User and Company models to add the relation
```

**Important**: Tell the user to run:
```powershell
npx prisma migrate dev --name add_projects
npx prisma generate
```

#### 4.2 Main Module Structure
```typescript
// Create main directory (implicit via create_file)
// Create main module
create_file({
  filePath: "c:/projetos/team-ops-api/src/projects/projects.module.ts",
  content: `import { Module } from '@nestjs/common';

@Module({
  imports: [
    // Sub-modules will be added here
  ],
})
export class ProjectsModule {}`
})

// Update AppModule
read_file({
  filePath: "c:/projetos/team-ops-api/src/app.module.ts",
  startLine: 1,
  endLine: 50
})

replace_string_in_file({
  filePath: "c:/projetos/team-ops-api/src/app.module.ts",
  oldString: `import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [`,
  newString: `import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [`
})

// Add ProjectsModule to imports array
replace_string_in_file({
  filePath: "c:/projetos/team-ops-api/src/app.module.ts",
  oldString: `    TasksModule,
  ],`,
  newString: `    TasksModule,
    ProjectsModule,
  ],`
})
```

#### 4.3 CREATE Operation
Use `multi_replace_string_in_file` or multiple `create_file` calls to create:

1. **DTO**: `src/projects/project-create/dto/create-project.dto.ts`
2. **Service**: `src/projects/project-create/project-create.service.ts`
3. **Controller**: `src/projects/project-create/project-create.controller.ts`
4. **Module**: `src/projects/project-create/project-create.module.ts`
5. **Tests**: Empty spec files

Then update main module to import the sub-module.

#### 4.4 LIST Operation
Same pattern as CREATE, but:
- DTO extends `BaseQueryDto`
- Service implements role-based filtering
- Controller uses `@Get()` and returns pagination response

#### 4.5 FIND, UPDATE, DELETE
Follow the same pattern for remaining operations.

#### 4.6 Events (if needed)
1. Create event class in `src/events/events/`
2. Update `src/events/constants/event-names.ts`
3. Create listener in `src/events/listeners/`
4. Update `src/events/events.module.ts` to register listener
5. Update CREATE/UPDATE/DELETE services to emit events

#### 4.7 Documentation
Create HTTP test file with examples for all endpoints.

---

## 🎨 Code Generation Templates

### Full CREATE Operation Template

When generating a CREATE operation, use this structure:

```typescript
// DTO
export class Create{Entity}Dto {
  @ApiProperty({ description: '{field} description', example: 'example' })
  @IsString()
  @IsNotEmpty()
  {field}: string;
  
  // Repeat for each field with appropriate decorators
}

// Service
@Injectable()
export class {Entity}CreateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventDispatcher: EventDispatcherService, // if events needed
  ) {}

  async create(dto: Create{Entity}Dto, user: UserPayload) {
    // 1. Validate
    // 2. Check permissions
    // 3. Create entity
    const entity = await this.prisma.{entity}.create({
      data: {
        ...dto,
        companyId: user.companyId,
        createdById: user.id,
      },
      include: {
        company: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
    
    // 4. Emit events (if needed)
    this.eventDispatcher.dispatch(
      EVENT_NAMES.{ENTITY}_CREATED,
      new {Entity}CreatedEvent(entity.id, entity.name, user.id, user.companyId),
    );
    
    return entity;
  }
}

// Controller
@ApiTags('{entities}')
@ApiBearerAuth()
@Controller('{entities}')
export class {Entity}CreateController {
  constructor(
    private readonly service: {Entity}CreateService,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER) // Adjust based on requirements
  @ApiOperation({ summary: 'Create a new {entity}' })
  async create(
    @CurrentUser() user: UserPayload,
    @Body() dto: Create{Entity}Dto,
  ) {
    const entity = await this.service.create(dto, user);
    return this.responseService.success({
      message: '{Entity} created successfully',
      data: entity,
    });
  }
}

// Module
@Module({
  imports: [DatabaseModule, CommonModule, EventsModule], // EventsModule only if needed
  controllers: [{Entity}CreateController],
  providers: [{Entity}CreateService],
})
export class {Entity}CreateModule {}
```

### Full LIST Operation Template

```typescript
// DTO
export class {Entity}ListDto extends BaseQueryDto {
  @ApiPropertyOptional({ description: 'Filter by {field}', example: 'value' })
  @IsOptional()
  @IsString()
  {field}?: string;
  
  // Add specific filters
}

// Service
@Injectable()
export class {Entity}ListService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: {Entity}ListDto) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, companyId: true },
    });

    const where: any = {};

    // Role-based filtering
    if (user.role === Role.ADMIN) {
      where.companyId = user.companyId;
    } else if (user.role === Role.MANAGER) {
      where.companyId = user.companyId;
    } else {
      where.createdById = userId;
    }

    // Apply filters
    if (query.name) {
      where.name = { contains: query.name, mode: 'insensitive' };
    }

    const [entities, total] = await Promise.all([
      this.prisma.{entity}.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.{entity}.count({ where }),
    ]);

    return { data: entities, total, currentPage: page, limit };
  }
}

// Controller
@ApiTags('{entities}')
@ApiBearerAuth()
@Controller('{entities}')
export class {Entity}ListController {
  constructor(
    private readonly service: {Entity}ListService,
    private readonly responseService: ResponseService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all {entities}' })
  async list(
    @CurrentUser() user: UserPayload,
    @Query() query: {Entity}ListDto,
  ) {
    const result = await this.service.list(user.id, query);
    return this.responseService.pagination({
      data: result.data,
      total: result.total,
      currentPage: result.currentPage,
      limit: result.limit,
      message: '{Entities} retrieved successfully',
    });
  }
}

// Module
@Module({
  imports: [DatabaseModule, CommonModule],
  controllers: [{Entity}ListController],
  providers: [{Entity}ListService],
})
export class {Entity}ListModule {}
```

---

## ✅ Verification Checklist

After generating all files, provide this checklist to the user:

```markdown
## Module Creation Complete! ✅

### Files Created:
- [ ] Prisma model added to `schema.prisma`
- [ ] Main module: `src/{entities}/{entities}.module.ts`
- [ ] CREATE operation (4 files)
- [ ] LIST operation (4 files)
- [ ] FIND operation (3 files)
- [ ] UPDATE operation (4 files)
- [ ] DELETE operation (3 files)
- [ ] Events (if implemented)
- [ ] HTTP test file

### Next Steps:
1. Run migrations:
   ```powershell
   npx prisma migrate dev --name add_{entities}
   npx prisma generate
   ```

2. Start development server:
   ```powershell
   npm run start:dev
   ```

3. Test in Swagger:
   - Open http://localhost:3000/api
   - Authenticate
   - Test all endpoints

### Verification:
- [ ] All endpoints appear in Swagger
- [ ] Authentication required
- [ ] Authorization rules enforced
- [ ] Company boundaries respected
- [ ] Events emitted (if implemented)
- [ ] No TypeScript errors
```

---

## 🚨 Common Pitfalls to Avoid

1. **Don't hardcode values** - Always use user context (user.id, user.companyId)
2. **Don't skip permission checks** - Always validate access
3. **Don't forget company boundaries** - Multi-tenancy is critical
4. **Don't use console.log** - Use NestJS Logger instead
5. **Don't forget Swagger docs** - Every endpoint needs documentation
6. **Don't skip test files** - Create placeholder spec files
7. **Don't forget to update imports** - Main module and AppModule
8. **Don't mix patterns** - Follow existing codebase style exactly
9. **Don't skip relations** - Always include necessary Prisma relations
10. **Don't forget error handling** - Use appropriate NestJS exceptions

---

## 📊 Success Metrics

A successful module generation includes:

- ✅ Zero TypeScript compilation errors
- ✅ All files follow naming conventions
- ✅ All imports resolve correctly
- ✅ Swagger documentation is complete
- ✅ Permission checks are in place
- ✅ Company boundaries are validated
- ✅ Role-based access is implemented
- ✅ Events are emitted (if required)
- ✅ Code matches existing patterns exactly
- ✅ User can test immediately after running migrations

---

## 🎯 Example AI Agent Conversation Flow

**User**: "Create a Departments module. Each department has a name, description, and belongs to a company. Only admins can create/delete departments. Everyone can view departments in their company."

**AI Agent Response**:

> I'll create a complete Departments module following the established patterns. Let me break this down:
>
> **Entity**: Department
> **Fields**: name (required), description (optional)
> **Relations**: companyId, createdById
> **Access Rules**:
> - ADMIN: can create, update, delete
> - MANAGER/EMPLOYEE: can view (company-scoped)
>
> I'll create:
> 1. Prisma model with migration
> 2. Main module structure
> 3. CRUD operations (create, list, find, update, delete)
> 4. Department created event
> 
> Starting implementation...

[AI Agent then executes the plan using the workflow defined above]

---

## 🔍 Reference Implementation

**Always refer to these files as the source of truth:**

- `src/tasks/` - Complete reference implementation
- `MODULE_STRUCTURE_GUIDE.md` - Architecture patterns
- `HOW_TO_CREATE_MODULES.md` - Step-by-step process
- `prisma/schema.prisma` - Database patterns

---

## 💡 Tips for AI Agents

1. **Read before writing** - Always check existing files first
2. **Use tools efficiently** - Batch operations when possible
3. **Be consistent** - Copy patterns exactly from Tasks module
4. **Communicate clearly** - Explain what you're creating before creating it
5. **Verify imports** - Double-check all import paths
6. **Follow todos** - Use manage_todo_list to track progress
7. **Test as you go** - Suggest testing after each major step
8. **Handle errors gracefully** - If a tool fails, explain and retry
9. **Ask when unsure** - If requirements are unclear, ask for clarification
10. **Provide next steps** - Always tell user what to do next

---

## 🎓 Learning from Mistakes

If the generated code has issues:

1. **TypeScript Errors**: Check import paths and type definitions
2. **Swagger Not Showing**: Verify @ApiTags() and module imports
3. **Auth Not Working**: Check @ApiBearerAuth() and guards
4. **Permissions Wrong**: Review role-based logic in services
5. **Events Not Firing**: Verify EventsModule import and event names

Use errors as learning opportunities to improve future generations.

---

This guide should enable any AI agent to autonomously create complete, consistent, production-ready modules that follow all established patterns in this codebase. 🤖✨
