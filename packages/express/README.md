# Express Server

This is an Express server built with TypeScript for the SST application.

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Build the project
npm run build

# Start the server
npm start

# For development with hot reload
npm run dev
```

## API Endpoints

- `GET /` - Welcome endpoint
- `GET /api` - API information
- `GET /health` - Health check endpoint

## Project Structure

```
src/
├── index.ts         # Main application entry point
├── routes/          # Route definitions
│   └── index.ts     # Main router
└── ...
```

## Development

This project uses TypeScript for type safety. To run the development server with hot reloading:

```bash
npm run dev
```

## Building for Production

```bash
npm run build
npm start
```
