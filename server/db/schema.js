const { pgTable, serial, varchar, text, timestamp, json, foreignKey, pgEnum,integer } = require('drizzle-orm/pg-core');

// Enums
const priorityEnum = pgEnum('priority', ['Low', 'Medium', 'High']);
const statusEnum = pgEnum('status', ['To Do', 'In Progress', 'Done']);

// Users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tasks table
const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  priority: priorityEnum('priority').notNull().default('Medium'),
  status: statusEnum('status').notNull().default('To Do'),
  dueDate: timestamp('due_date'),
  createdBy: serial('created_by').references(() => users.id, { onDelete: 'set null' }),
  assignedTo: serial('assigned_to').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Task History table
const taskHistory = pgTable('task_history', {
  id: serial('id').primaryKey(),
  taskId: integer('task_id').references(() => tasks.id, { onDelete: 'set null' }),  // Changed from serial to integer
  changeType: varchar('change_type', { length: 50 }).notNull(),
  previousValue: json('previous_value'),
  newValue: json('new_value'),
  timestamp: timestamp('timestamp').defaultNow(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'set null' }),  // Changed from serial to integer
});

module.exports = {
  users,
  tasks,
  taskHistory,
  priorityEnum,
  statusEnum,
};
