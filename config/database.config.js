module.exports = {
  development: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: ['dist/models/.js'],
    synchronize: true,
    logging: false,
  },
  production: {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: ['dist/models/.js'],
    synchronize: false,
    logging: false,
  },
};