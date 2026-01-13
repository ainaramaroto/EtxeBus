const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const config = require('./config');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const swaggerSpec = require('./swagger');

const app = express();

const corsOptions = {
  origin: (origin, callback) => {
    const isNullOrigin = origin === 'null';
    if (!origin || isNullOrigin) return callback(null, true); // file:// o iframes sin origen
    if (!config.allowedOrigins.length) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origen no permitido: ${origin}`));
  },
  credentials: true,
};

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.env === 'production' ? 'combined' : 'dev'));

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.get('/api/openapi.json', (req, res) => res.json(swaggerSpec));

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

function startServer(port = config.port) {
  const server = app.listen(port, () => {
    console.log(
      `[api-gateway] escuchando en puerto ${port} (env: ${config.env})`
    );
  });

  const shutdown = () => {
    server.close(() => {
      console.log('\n[api-gateway] servidor detenido');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return server;
}

module.exports = {
  app,
  startServer,
};

if (require.main === module) {
  startServer();
}
