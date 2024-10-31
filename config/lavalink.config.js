module.exports = {
  /
    Lavalink Node Configuration
   
    This configuration object is used to define the Lavalink node settings for the bot.
   /
  lavalink: {
    /
      Lavalink Node ID
     
      This ID is used to identify the Lavalink node in the bot.
     /
    id: process.env.LAVALINK_ID || 'main',
    /
      Lavalink Node Host
     
      This is the hostname or IP address of the Lavalink server.
     /
    host: process.env.LAVALINK_HOST || 'localhost',
    /
      Lavalink Node Port
     
      This is the port number that the Lavalink server is listening on.
     /
    port: process.env.LAVALINK_PORT || 2333,
    /
      Lavalink Node Password
     
      This is the password that is used to authenticate with the Lavalink server.
     /
    password: process.env.LAVALINK_PASSWORD || 'youshallnotpass',
    /
      Lavalink Node Secure Connection
     
      This flag indicates whether to use a secure connection (HTTPS) to the Lavalink server.
     /
    secure: process.env.LAVALINK_SECURE || false,
    /
      Lavalink Node Retry Interval
     
      This setting defines the interval in milliseconds for retrying a connection to the Lavalink node if it fails.
     /
    retryInterval: process.env.LAVALINK_RETRY_INTERVAL || 10000,
    /
      Lavalink Node Retry Attempts
     
      This setting defines the maximum number of attempts to retry connecting to the Lavalink node.
     /
    retryAttempts: process.env.LAVALINK_RETRY_ATTEMPTS || 5,
    /
      Lavalink Node Shards
     
      This setting defines the number of shards that the Lavalink node should use.
     /
    shards: process.env.LAVALINK_SHARDS || 1,
    /
      Lavalink Node RestTimeout
     
      This setting defines the timeout in milliseconds for the REST API requests to the Lavalink node.
     /
    restTimeout: process.env.LAVALINK_REST_TIMEOUT || 5000,
  },
};