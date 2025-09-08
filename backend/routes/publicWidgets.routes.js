// Este archivo se hizo para que cualqier usuario tenga acceso a los datos de los widgets
// No requiere autenticacion, excepto para la informacion de los usuarios(solo lo pueden ver los admin)

import express from 'express';
import db from '../db/config.db.js';

const router = express.Router();

// Get supplies summary for the widget
router.get('/widgets/supplies', async (req, res) => {
    try {
        const query = `
            SELECT 
                tipo as type,
                COUNT(*) as count,
                SUM(CASE WHEN estado = 'habilitado' THEN 1 ELSE 0 END) as enabled
            FROM insumos
            WHERE estado IS NOT NULL
            GROUP BY tipo
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching supplies data:', err);
                return res.status(500).json({ error: 'Error al obtener datos de insumos' });
            }
            res.json(results);
        });
    } catch (error) {
        console.error('Error in supplies widget route:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Get sensors summary for the widget
router.get('/widgets/sensors', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'habilitado' THEN 1 ELSE 0 END) as enabled,
                SUM(CASE WHEN estado = 'deshabilitado' THEN 1 ELSE 0 END) as disabled
            FROM sensores
            WHERE estado IS NOT NULL
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching sensors data:', err);
                return res.status(500).json({ error: 'Error al obtener datos de sensores' });
            }
            res.json(results[0] || { total: 0, enabled: 0, disabled: 0 });
        });
    } catch (error) {
        console.error('Error in sensors widget route:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Get crops summary for the widget
router.get('/widgets/crops', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN LOWER(IFNULL(estado, '')) = 'habilitado' THEN 1 ELSE 0 END) as enabled,
                SUM(CASE WHEN LOWER(IFNULL(estado, '')) = 'deshabilitado' THEN 1 ELSE 0 END) as disabled,
                SUM(CASE WHEN fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
                SUM(CASE WHEN estado IS NULL THEN 1 ELSE 0 END) as null_estado
            FROM cultivos
        `;

        db.query(query, (err, results) => {
            if (err) {
                console.error('Error fetching crops data:', err);
                return res.status(500).json({ error: 'Error al obtener datos de cultivos' });
            }
            res.json(results[0] || { total: 0, enabled: 0, disabled: 0, new_this_week: 0 });
        });
    } catch (error) {
        console.error('Error in crops widget route:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

export default router;
