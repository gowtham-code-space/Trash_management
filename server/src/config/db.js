import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

// SSL configuration
let sslOptions = null;

if (process.env.DB_SSL_CA_PATH) {
    try {
    sslOptions = {
        ca: fs.readFileSync(path.resolve(process.env.DB_SSL_CA_PATH))
    };
    
    
    console.log('SSL enabled for TiDB connection');
        } catch (error) {
        console.error('Failed to load SSL certificates:', error.message);
        throw error;
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 4000,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    // SSL configuration
    ssl: sslOptions,
    
  // Connection pool settings
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    waitForConnections: true,
    
    // Compatibility settings
    charset: 'utf8mb4',
    timezone: 'Z', // UTC timezone (was '+05:30' IST - changed to store all times in UTC)
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    decimalNumbers: true,
    
    // Timeout
    connectTimeout: 10000,
});

// Test connection
export const testConnection = async () => {
    try {
        await pool.query('SELECT 1');
        console.log('TiDB connection test successful');
        return true;
    } catch (error) {
        console.error('TiDB connection test failed:', error.message);
        return false;
    }
};

// Execute query helper
export const executeQuery = async (sql, params = []) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('Query execution failed:', error.message);
        throw error;
    }
};

export default pool;