// ======================================================
// Customer Application
// Task 2 - Multi Environment CI/CD
// ======================================================

const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

// ======================================================
// Application Configuration
// ======================================================

const PORT = process.env.PORT || 3000;

const APP_ENV = process.env.APP_ENV || "UNKNOWN";
const APP_VERSION = process.env.APP_VERSION || "UNKNOWN";

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

// ======================================================
// PostgreSQL Connection
// ======================================================

const pool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
});

// ======================================================
// Home Endpoint
// ======================================================

app.get("/", (req, res) => {
    res.json({
        application: "customer-app",
        environment: APP_ENV,
        version: APP_VERSION,
        message: "Customer application is running"
    });
});

// ======================================================
// Health Check
// ======================================================

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");

        res.status(200).json({
            status: "UP",
            environment: APP_ENV,
            version: APP_VERSION,
            database: "CONNECTED"
        });

    } catch (error) {
        res.status(500).json({
            status: "DOWN",
            environment: APP_ENV,
            version: APP_VERSION,
            database: "NOT_CONNECTED",
            error: error.message
        });
    }
});

// ======================================================
// Environment Endpoint
// ======================================================

app.get("/environment", (req, res) => {
    res.json({
        environment: APP_ENV
    });
});

// ======================================================
// Version Endpoint
// ======================================================

app.get("/version", (req, res) => {
    res.json({
        version: APP_VERSION
    });
});

// ======================================================
// Customer Search API
// ======================================================

app.get("/customers/search", async (req, res) => {

    const name = req.query.name || "";

    // Validate search input
    if (!name.trim()) {
        return res.status(400).json({
            error: "Search name is required"
        });
    }

    try {

        const result = await pool.query(
            "SELECT id, name, email FROM customers WHERE name ILIKE $1",
            [`%${name.trim()}%`]
        );

        res.json({
            environment: APP_ENV,
            version: APP_VERSION,
            search: name.trim(),
            count: result.rows.length,
            customers: result.rows,
            timestamp: new Date().toISOString()
        });

    } catch (error) {

        res.status(500).json({
            error: "Customer search failed",
            details: error.message
        });
    }
});

// ======================================================
// Start Application
// ======================================================

app.listen(PORT, () => {

    console.log("==========================================");
    console.log("Customer Application Started");
    console.log("==========================================");
    console.log("Environment:", APP_ENV);
    console.log("Version:", APP_VERSION);
    console.log("Port:", PORT);
    console.log("Database Host:", DB_HOST);
    console.log("Database Name:", DB_NAME);
    console.log("Database User:", DB_USER);
    console.log("==========================================");

});