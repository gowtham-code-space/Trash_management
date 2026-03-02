import dotenv from 'dotenv';
import app from './src/app.js';
import { testConnection } from './src/config/db.js';


dotenv.config();

const PORT = process.env.PORT;

app.listen(PORT, async () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    // Test TiDB connection
    const isConnected = await testConnection();
    if (isConnected) {
        console.log('✅ TiDB Database: Connected');
    } else {
        console.log('❌ TiDB Database: Connection Failed');
    }
});