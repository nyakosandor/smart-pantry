import 'dotenv/config';

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express';
import cors from 'cors';

import { connectDB } from './config/db.js';

// Models must be imported before any route handler runs so that Mongoose
// registers their schemas and builds indexes against the live connection.
import './models/User.js';
import './models/Ingredient.js';

import authRoutes from './routes/auth.routes.js';
import ingredientsRoutes from './routes/ingredients.routes.js';
import shoppingListRoutes from './routes/shopping-list.routes.js';
import recipesRoutes from './routes/recipes.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/ingredients', ingredientsRoutes);
app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/recipes', recipesRoutes);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 3000;

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(
      `[Server] Listening on http://localhost:${PORT} (${process.env.NODE_ENV ?? 'development'})`,
    );
  });
};

void start();
