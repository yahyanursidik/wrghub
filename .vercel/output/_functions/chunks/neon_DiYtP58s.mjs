import postgres from "postgres";
import "dotenv/config";
//#region src/db/neon.ts
var connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_O4jVKCzUWex8@ep-damp-queen-azh98l8v-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
var neonSql = postgres(connectionString, {
	ssl: "require",
	max: 10,
	idle_timeout: 20,
	connect_timeout: 10
});
//#endregion
export { neonSql as t };
