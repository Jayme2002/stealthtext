import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  // Separate client-side env vars (safe to expose) from server-side ones (must be kept secret)
  const clientEnvVars = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
    VITE_STRIPE_PUBLISHABLE_KEY: env.VITE_STRIPE_PUBLISHABLE_KEY,
    VITE_APP_URL: env.VITE_APP_URL
  };

  // Add all env vars to process.env for server middleware
  Object.keys(env).forEach(key => {
    process.env[key] = env[key];
  });

  return {
    plugins: [
      react(),
      {
        name: 'api-handler-dev-only',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              try {
                const pathName = req.url.replace('/api/', '');
                // In development, we'll use the local api files
                const module = await import(`./api/${pathName}.ts`);
                const handler = module.default;
                
                // Create a Request object from the incoming request
                const request = new Request(`http://${req.headers.host}${req.url}`, {
                  method: req.method,
                  headers: req.headers as Record<string, string>,
                  body: req.method !== 'GET' && req.method !== 'HEAD' ? 
                    await new Promise((resolve) => {
                      let body = '';
                      req.on('data', chunk => body += chunk);
                      req.on('end', () => resolve(body));
                    }) : undefined,
                });

                // Handle the request
                const response = await handler(request);
                
                // Send the response
                res.statusCode = response.status;
                response.headers.forEach((value: string, key: string) => {
                  res.setHeader(key, value);
                });
                
                const responseBody = await response.text();
                res.end(responseBody);
              } catch (error) {
                console.error('API Handler Error:', error);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ 
                  error: 'Internal Server Error',
                  details: error instanceof Error ? error.message : 'Unknown error'
                }));
              }
            } else {
              next();
            }
          });
        },
      },
    ],
    define: {
      // Only expose client-safe environment variables
      'process.env.VITE_SUPABASE_URL': JSON.stringify(clientEnvVars.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(clientEnvVars.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(clientEnvVars.VITE_STRIPE_PUBLISHABLE_KEY),
      'process.env.VITE_APP_URL': JSON.stringify(clientEnvVars.VITE_APP_URL),
    },
  };
});