import { createClient } from 'redis';

let redisClient: ReturnType<typeof createClient> | null = null;

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient = createClient({
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD || undefined,
    });

    redisClient.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      console.log('Redis connected');
    });

    redisClient.on('disconnect', () => {
      console.log('Redis disconnected');
    });

    await redisClient.connect();

    // Graceful shutdown
    process.on('SIGINT', async () => {
      if (redisClient) {
        await redisClient.quit();
        console.log('Redis connection closed through app termination');
      }
    });

  } catch (error) {
    console.error('Redis connection failed:', error);
    throw error;
  }
};

export const getRedisClient = () => {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
};

// Cache utility functions
export const setCache = async (key: string, value: any, ttl: number = 1800): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.setEx(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Error setting cache:', error);
    throw error;
  }
};

export const getCache = async (key: string): Promise<any | null> => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

export const deleteCache = async (key: string): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.del(key);
  } catch (error) {
    console.error('Error deleting cache:', error);
    throw error;
  }
};

export const clearAllCache = async (): Promise<void> => {
  try {
    const client = getRedisClient();
    await client.flushAll();
  } catch (error) {
    console.error('Error clearing all cache:', error);
    throw error;
  }
};
