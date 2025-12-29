const DEFAULT_DATABASE_URL = 'postgresql://neondb_owner:npg_zTGZnwE5qDQ6@ep-lingering-rain-ahbp23u9-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

export interface DatabaseConfig {
  type: 'postgres';
  url?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  ssl?: {
    rejectUnauthorized: boolean;
  };
  extra?: {
    sslmode: string;
    channel_binding: string;
  };
  autoLoadEntities: boolean;
}

export const getDatabaseConfig = (configService?: any): DatabaseConfig => {
  const connectionString = configService?.get?.('DATABASE_URL') || DEFAULT_DATABASE_URL;
  
  const url = new URL(connectionString);
  
  return {
    type: 'postgres',
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ssl: {
      rejectUnauthorized: false,
    },
    extra: {
      sslmode: 'require',
      channel_binding: 'require',
    },
    autoLoadEntities: true,
  };
};

