// Este archivo se hizo para que cualqier usuario tenga acceso a los datos de los widgets
// No requiere autenticacion, excepto para la informacion de los usuarios(solo lo pueden ver los admin)

import express from "express";
import db from "../db/config.db.js";

const router = express.Router();

// Resumen de insumos para el widget
router.get("/widgets/supplies", async (req, res) => {
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
				console.error("Error fetching supplies data:", err);
				return res
					.status(500)
					.json({ error: "Error al obtener datos de insumos" });
			}
			res.json(results);
		});
	} catch (error) {
		console.error("Error in supplies widget route:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

// Resumen de sensores para el widget
router.get("/widgets/sensors", async (req, res) => {
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
				console.error("Error fetching sensors data:", err);
				return res
					.status(500)
					.json({ error: "Error al obtener datos de sensores" });
			}
			res.json(results[0] || { total: 0, enabled: 0, disabled: 0 });
		});
	} catch (error) {
		console.error("Error in sensors widget route:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

// Resumen de cultivos para el widget
router.get("/widgets/crops", async (req, res) => {
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
				console.error("Error fetching crops data:", err);
				return res
					.status(500)
					.json({ error: "Error al obtener datos de cultivos" });
			}
			res.json(
				results[0] || { total: 0, enabled: 0, disabled: 0, new_this_week: 0 }
			);
		});
	} catch (error) {
		console.error("Error in crops widget route:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

// Resumen de usuarios para el widget
router.get("/widgets/users", async (req, res) => {
	try {
		const query = `
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'habilitado' THEN 1 ELSE 0 END) as enabled,
                SUM(CASE WHEN estado = 'deshabilitado' THEN 1 ELSE 0 END) as disabled,
                SUM(CASE WHEN fecha_creacion >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as new_this_week,
                
                SUM(CASE WHEN LOWER(rol) IN ('administrador', 'admin') AND estado = 'habilitado' THEN 1 ELSE 0 END) as admin_count,
                SUM(CASE WHEN LOWER(rol) IN ('super administrador', 'superadmin') AND estado = 'habilitado' THEN 1 ELSE 0 END) as superadmin_count,
                SUM(CASE WHEN LOWER(rol) IN ('personal de apoyo', 'apoyo') AND estado = 'habilitado' THEN 1 ELSE 0 END) as apoyo_count,
                SUM(CASE WHEN (rol IS NULL OR rol = '' OR LOWER(rol) = 'visitante') AND estado = 'habilitado' THEN 1 ELSE 0 END) as visitante_count
            FROM usuarios
        `;

		db.query(query, (err, results) => {
			if (err) {
				console.error("Error fetching users data:", err);
				return res
					.status(500)
					.json({ error: "Error al obtener datos de usuarios" });
			}

			const data = results[0] || {
				total: 0,
				enabled: 0,
				disabled: 0,
				new_this_week: 0,
				admin_count: 0,
				superadmin_count: 0,
				apoyo_count: 0,
				visitante_count: 0,
			};

			res.json({
				total: data.total,
				enabled: data.enabled,
				disabled: data.disabled,
				new_this_week: data.new_this_week,
				roles: {
					"Super administrador": data.superadmin_count,
					Administrador: data.admin_count,
					"Personal de Apoyo": data.apoyo_count,
					Visitante: data.visitante_count,
				},
			});
		});
	} catch (error) {
		console.error("Error in users widget route:", error);
		res.status(500).json({ error: "Error interno del servidor" });
	}
});

export default router;
