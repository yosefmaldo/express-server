import cors from 'cors';
import express from 'express';

import { initDB } from './services/database.js';
import todoRoutes from './routes/todo.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(todoRoutes);

try {
  await initDB();
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
