import { Pool } from '@neondatabase/serverless';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'test@example.com';
process.env.GOOGLE_SERVICE_ACCOUNT_KEY = 'test-key';
process.env.GOOGLE_DRIVE_FOLDER_ID = 'test-folder-id';

// Global test setup
beforeAll(async () => {
  // Set up test database or any global mocks here
  console.log('Setting up test environment...');
});

afterAll(async () => {
  // Clean up after all tests
  console.log('Cleaning up test environment...');
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

// Mock fetch for API calls
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};