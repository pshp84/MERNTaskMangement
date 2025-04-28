import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./db/schema.js",
  out: "./drizzle",
  driver: 'pg',
  dbCredentials: {
    user: "postgres",
    password: "Admin123",
    host: "127.0.0.1",
    port: 5432,
    database: "taskmanagement2",
  }
});