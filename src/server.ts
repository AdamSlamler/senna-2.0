import { createApp } from './server/app.js';

const port = Number(process.env.PORT ?? 3000);
const app = createApp();

app.listen(port, () => {
  console.log(`[senna] listening on :${port}`);
});
