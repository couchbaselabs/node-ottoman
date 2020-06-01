import express from 'express';
import { connect } from '../src';
connect('couchbase://localhost/travel-sample@admin:password');
import { UserRoutes } from './users/users.controller';
const app = express();

app.get('/', (req, res) => {
  res.send('index');
});
app.use('/users', UserRoutes);

const port = 4500;
app.listen(port, () => {
  console.log(`server started at http://localhost:${port}`);
});
