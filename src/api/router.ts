import express from 'express';
import historicalRoutes from './historical'
import alertRoutes from './alert'
import * as middleware from './middleware';

const router = express.Router();

router.get('/', (_, response) => response.status(200).send('ok'));
router.get('/health', (_, response) => response.status(200).send('ok'));

router.use(middleware.logRequest);
router.use('/historical', historicalRoutes);
router.use('/alert', alertRoutes);
export default router;
