const DEFAULT_DATABASE_URL = 'postgresql://dev:devpass@localhost:5432/devdb';

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
    servername?: string;
  };
  extra?: {
    sslmode: string;
    channel_binding: string;
    family?: number;
  };
  autoLoadEntities: boolean;
}

export const getDatabaseConfig = (configService?: any): DatabaseConfig => {
  const connectionString = configService?.get?.('DATABASE_URL') || process.env.DATABASE_URL || DEFAULT_DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is required to configure the database connection.');
  }

  const url = new URL(connectionString);
  const sslmode = (url.searchParams.get('sslmode') || 'require').toLowerCase();
  const channelBinding =
    url.searchParams.get('channel_binding') || url.searchParams.get('channelBinding') || 'require';
  
  const sslServerName = configService?.get?.('DATABASE_SSL_SERVERNAME') || process.env.DATABASE_SSL_SERVERNAME;
  const sslRequired = ['require', 'verify-ca', 'verify-full'].includes(sslmode);

  return {
    type: 'postgres',
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    username: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    ...(sslRequired
      ? {
          ssl: {
            rejectUnauthorized: false,
            ...(sslServerName ? { servername: sslServerName } : {}),
          },
        }
      : {}),
    extra: {
      sslmode,
      channel_binding: channelBinding,
      family: 4,
    },
    autoLoadEntities: true,
  };
};
