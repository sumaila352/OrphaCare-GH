import './loadEnv.js';
import { validateEnv, isProduction } from './env.js';
import { createApp } from './app.js';
import { isCloudinaryConfigured } from './lib/cloudinary.js';
import { isGoogleAuthConfigured } from './lib/googleAuth.js';
import { isPaystackConfigured } from './lib/paystack.js';

validateEnv();

const port = Number(process.env.PORT ?? 4000);
const app = createApp();

app.listen(port, () => {
  console.log(`OrphaCare API listening on port ${port} (${isProduction() ? 'production' : 'development'})`);
  console.log(
    isCloudinaryConfigured()
      ? 'Cloudinary: configured'
      : 'Cloudinary: not configured (set CLOUDINARY_* in apps/api/.env)',
  );
  console.log(
    isGoogleAuthConfigured()
      ? 'Google sign-in: configured'
      : 'Google sign-in: not configured (set GOOGLE_CLIENT_ID in apps/api/.env)',
  );
  console.log(
    isPaystackConfigured()
      ? 'Paystack: configured (online donations enabled)'
      : 'Paystack: not configured (set PAYSTACK_* in apps/api/.env)',
  );
});
