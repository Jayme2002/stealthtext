import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'api-handler',
        configureServer(server) {
          // Add environment variables to process.env
          Object.keys(env).forEach(key => {
            process.env[key] = env[key];
          });

          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith('/api/')) {
              try {
                const pathName = req.url.replace('/api/', '');
                const module = await import(`./api/${pathName}.ts`);
                const handler = module.default;
                
                // Create a Request object from the incoming request
                const request = new Request(`http://${req.headers.host}${req.url}`, {
                  method: req.method,
                  headers: req.headers as HeadersInit,
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
                response.headers.forEach((value, key) => {
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
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      'process.env.VITE_STRIPE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_STRIPE_PUBLISHABLE_KEY),
      'process.env.VITE_STRIPE_SECRET_KEY': JSON.stringify(env.VITE_STRIPE_SECRET_KEY),
      'process.env.VITE_APP_URL': JSON.stringify(env.VITE_APP_URL),
      'process.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY),
      'process.env.HUMANIZED_AI_API_KEY': JSON.stringify(env.HUMANIZED_AI_API_KEY),
    },
  };
});