import { createApp } from './app.js';
import { getEnv } from './env.js';

const env = getEnv();
const app = createApp();

app.listen(env.PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`[backend] listening on :${env.PORT} (${env.NODE_ENV})`);
});


