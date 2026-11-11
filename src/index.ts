
import 'reflect-metadata';

import { Environment } from './environment';
import { createExpressServer } from 'routing-controllers';
import { DatabaseInstanceStrategy } from './database';

async function bootstrap() {
  if (!Environment.db_type) {
    throw new Error(
      'DB_TYPE is not defined. Allowed values: mongo, postgres'
    );
  }

  await DatabaseInstanceStrategy.setInstanceByEnv(
    Environment.db_type
  );

  const app = createExpressServer({
    routePrefix: '/api/v1',
    controllers: [`${__dirname}/controllers/*.controller.*`],
    validation: true,
    classTransformer: true,
    defaultErrorHandler: true
  });

  app.listen(Environment.port, () => {
    console.log(
      `Running at http://localhost:${Environment.port}`
    );
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
