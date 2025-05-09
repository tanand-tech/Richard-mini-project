
// import { Pool } from "pg";
import { Router } from 'express';
import * as pg from '@/services/postgres'
import * as inf from '@/services/influx'
const router = Router();

// // functions: 
// 1. real time line chart temperature & humidity
// . alerts log top 20

// Line chart for real time
router.get('/line-chart-realtime', async (req, res) => {
    console.log('inf.history:', inf.history);
    try {
        const field = req.query.field as 'temperature' | 'humidity';
        const lineChart = await inf.history.getRealtimeChartData();
        res.json(lineChart)
        
    } catch (err) {
    console.error('Failed to load duration-based alert pie data:', err.message);
    res.status(500).json({ error: err.message });
    }
});

// show 20 recent resolved alerts
router.get('/alerts-compilation', async(req, res) =>{
    const result = await pg.alert.alerts(20);
    console.log(result);
    res.json(result);
});

export default router;

