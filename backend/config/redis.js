import redis from 'redis';
import dotenv from 'dotenv';

dotenv.config();

class RedisClient {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }

    getRedisConfig() {
        // Check for Heroku Redis URLs
        const redisUrl = process.env.REDIS_URL || process.env.REDISCLOUD_URL || process.env.REDISTOGO_URL;
        
        if (redisUrl) {
            try {
                // Parse Heroku Redis URL
                const url = new URL(redisUrl);
                return {
                    socket: {
                        host: url.hostname,
                        port: parseInt(url.port) || 6379,
                        tls: url.protocol === 'rediss:' ? {} : undefined
                    },
                    password: url.password || undefined,
                    database: 0
                };
            } catch (error) {
                console.error('Failed to parse Redis URL:', error);
                return this.getLocalConfig();
            }
        }
        
        return this.getLocalConfig();
    }

    getLocalConfig() {
        return {
            url: 'redis://localhost:6379',
            socket: {
                reconnectStrategy: this.getRetryStrategy()
            }
        };
    }

    getRetryStrategy() {
        return (retries) => {
            if (retries > 10) {
                console.warn('Redis max retry attempts reached');
                return undefined;
            }
            return Math.min(retries * 100, 3000);
        };
    }

    async connect() {
        try {
            const config = this.getRedisConfig();
            this.client = redis.createClient(config);

            this.client.on('error', (err) => {
                console.error('Redis Client Error:', err);
                this.isConnected = false;
            });

            this.client.on('connect', () => {
                console.log('Redis Client Connected');
                this.isConnected = true;
            });

            this.client.on('ready', () => {
                console.log('Redis Client Ready');
            });

            this.client.on('end', () => {
                console.log('Redis Client Disconnected');
                this.isConnected = false;
            });

            await this.client.connect();
            return this.client;
        } catch (error) {
            console.error('Failed to connect to Redis:', error);
            this.isConnected = false;
            return null;
        }
    }

    async get(key) {
        if (!this.isConnected || !this.client) {
            return null;
        }
        try {
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            console.error('Redis GET error:', error);
            return null;
        }
    }

    async set(key, value, ttl = 3600) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            await this.client.setEx(key, ttl, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Redis SET error:', error);
            return false;
        }
    }

    async del(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            console.error('Redis DEL error:', error);
            return false;
        }
    }

    async exists(key) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis EXISTS error:', error);
            return false;
        }
    }

    async flushPattern(pattern) {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            const keys = await this.client.keys(pattern);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
            return true;
        } catch (error) {
            console.error('Redis FLUSH PATTERN error:', error);
            return false;
        }
    }

    async disconnect() {
        if (this.client) {
            await this.client.quit();
            this.isConnected = false;
        }
    }

    // Health check for monitoring
    async healthCheck() {
        if (!this.isConnected || !this.client) {
            return false;
        }
        try {
            await this.client.ping();
            return true;
        } catch (error) {
            console.error('Redis health check failed:', error);
            return false;
        }
    }
}

// Create singleton instance
const redisClient = new RedisClient();

export default redisClient;
