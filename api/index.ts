import express, { Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { UserRoutes, AuthRoutes } from './users/users.controller';
import { ensureIndexes } from '../lib/model/index/ensure-indexes';
import { jwtMiddleware } from './shared/protected.router';
import { AirportRoutes } from './airports/airports.controller';
import { HotelRoutes } from './hotels/hotels.controller';
import { RouteRoutes } from './routes/routes.controller';

const app = express();

app.use(express.json());
app.get('/', (req, res) => {
  res.send('index');
});
app.use('/users', jwtMiddleware, UserRoutes);
app.use('/user', AuthRoutes);
app.use('/airports', jwtMiddleware, AirportRoutes);
app.use('/hotels', jwtMiddleware, HotelRoutes);
app.use('/flightPaths', jwtMiddleware, RouteRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(YAML.load('./api/swagger.yaml')));

// Handle not found and catch exception layer
app.use((req: Request, res: Response) =>
  res.status(404).json({ error: 'The incoming request did not match any route' }),
);
app.use((err: Error, req: Request, res: Response) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token...' });
  }
  return res.status(500).json({ error: err.toString() });
});

ensureIndexes()
  .then(() => {
    console.log('All the indexes were registered');
    const port = 4500;
    app.listen(port, () => {
      console.log(`API started at http://localhost:${port}`);
    });
  })
  .catch((e) => console.log(e));
