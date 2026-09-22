// ======================================================
// Customer Application
// Task 2 - Multi Environment CI/CD
// ======================================================

const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

const APP_ENV = process.env.APP_ENV || "UNKNOWN";
const APP_VERSION = process.env.APP_VERSION || "UNKNOWN";

const DB_HOST = process.env.DB_HOST;
const DB_PORT = process.env.DB_PORT || 5432;
const DB_NAME = process.env.DB_NAME;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;

const pool = new Pool({
    host: DB_HOST,
    port: DB_PORT,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD
});

// ======================================================
// HOME
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
// HEALTH CHECK
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
// ENVIRONMENT
// ======================================================

app.get("/environment", (req, res) => {

    res.json({
        environment: APP_ENV
    });

});

// ======================================================
// VERSION
// ======================================================

app.get("/version", (req, res) => {

    res.json({
        version: APP_VERSION
    });

});

// ======================================================
// CUSTOMER SEARCH
// ======================================================

app.get("/customers/search", async (req, res) => {
    const name = req.query.name || "";

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
            customers: result.rows
        });
    } catch (error) {
        res.status(500).json({
            error: "Customer search failed",
            details: error.message
        });
    }
});