import { Pool, type PoolClient, type QueryResult } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable.");
}

const pool = new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") {
  // @ts-expect-error global pool for hot reload
  if (!global.__gdavs_db_pool) {
    // @ts-expect-error
    global.__gdavs_db_pool = pool;
  }
}

export const db = {
  query: (text: string, params?: unknown[]) => pool.query(text, params),
  getClient: async () => pool.connect(),
  async transaction<T>(fn: (client: PoolClient) => Promise<T>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
