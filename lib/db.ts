import { Pool, type PoolClient, type QueryResult } from "pg";

let pool: Pool | null = null;

const getPool = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error("Missing DATABASE_URL environment variable.");
  }

  if (!pool) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });

    if (process.env.NODE_ENV !== "production") {
      // @ts-expect-error global pool for hot reload
      if (!global.__gdavs_db_pool) {
        // @ts-expect-error
        global.__gdavs_db_pool = pool;
      }
    }
  }

  return pool;
};

export const db = {
  query: (text: string, params?: unknown[]) => getPool().query(text, params),
  getClient: async () => getPool().connect(),
  async transaction<T>(fn: (client: PoolClient) => Promise<T>) {
    const client = await getPool().connect();
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
