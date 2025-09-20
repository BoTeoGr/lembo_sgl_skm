import express from 'express';
import db from './db/config.db.js'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dataRoutes from './routes/routes.js'
import publicWidgetsRoutes from './routes/publicWidgets.routes.js'
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Error: The following required environment variables are missing:');
    missingVars.forEach(varName => console.error(`- ${varName}`));
    console.error('Please create a .env file in the backend directory with these variables.');
    process.exit(1);
}

const app = express();

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
    origin: ['http://127.0.0.1:5000', 'http://127.0.0.1:5500', 'http://127.0.0.1:5501', 'http://localhost:3000', 'http://localhost:5000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use('/', dataRoutes);
app.use('/api', publicWidgetsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos: ', err);
        return;
    }
    console.log('Conectando a la BD - Full');
});

app.listen(5000, () => {
    console.log('Servidor escuchando en http://localhost:5000');
});

//Ejecutar el servidor con nodemon (automatizar el reinicio del servidor cuando detecta cambios en los archivos de tu proyecto): npm run dev
