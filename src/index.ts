// This file serves as the entry point for local development and testing.
// It imports the Express app instance from `server.ts` and starts the server,
// making it listen for incoming requests on a specific port.

// The `server.ts` file is configured for serverless environments like Vercel,
// where it only exports the app instance without starting a listener.
// This separation allows the same codebase to run both locally and on Vercel.

import app from './server';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running for local development on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/docs`);
});