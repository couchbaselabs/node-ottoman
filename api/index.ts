import express from 'express';
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

ensureIndexes()
  .then(() => {
    console.log('All the indexes were registered');
    const port = 4500;
    app.listen(port, () => {
      console.log(`API started at http://localhost:${port}`);
    });
  })
  .catch((e) => console.log(e));
