import mongoose from 'mongoose';

beforeAll(async () => {
  // Connect to test database
  await mongoose.connect(process.env.MONGODB_URI!);
});

beforeEach(async () => {
  // Clean up database before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
});
