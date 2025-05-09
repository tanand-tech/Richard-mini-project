
// import { Pool } from "pg";
import { Router } from 'express';
import * as pg from '@/services/postgres'
import * as inf from '@/services/influx'
const router = Router();

// // functions: 
// 1. historical line chart (hourly daily weekly etc and custom)
// 2. pie chart for percentage based on the duration temperature and humidity


// Line chart for historical 
router.get('/historical-line-chart', async(req,res) =>{
    try {
        const {range, start, end} = req.query;
        const historicalChart = await inf.history.getHistoricalChartData(range as string, start as string, end as string);
        res.json(historicalChart);
    } catch (err) {
    console.error('Failed to load duration-based alert pie data:', err.message);
    res.status(500).json({ error: err.message });
    }
});

// pie chart percentage based on the duration (temperature)
router.get('/alert-pie-chart-temperature', async (req, res) => {

    try {
        const range = (req.query.range as string) || '30d';
        const piechart = await pg.alert.alertDurationsBySensor('temperature', range);
        res.json(piechart)

    } catch (err) {
      console.error('Failed to load duration-based alert pie data:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

// pie chart percentage based on the duration (humidity)
router.get('/alert-pie-chart-humidity', async (req, res) => {
    try {
        const range = (req.query.range as string) || '30d';
        const piechart = await pg.alert.alertDurationsBySensor('humidity', range);
        res.json(piechart)

    } catch (err) {
        console.error('Failed to load duration-based alert pie data:', err.message);
        res.status(500).json({ error: err.message });
    }
});
export default router;

// run: curl "http://localhost:8080/historical/historical-line-chart?range=7d"
