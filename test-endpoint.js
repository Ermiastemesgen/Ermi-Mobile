
// Add this to your server.js for testing
app.get('/test-images', (req, res) => {
    const uploadsPath = process.env.UPLOADS_PATH || path.join(__dirname, 'uploads');
    
    try {
        const files = fs.readdirSync(uploadsPath);
        res.json({
            uploadsPath: uploadsPath,
            filesCount: files.length,
            files: files.slice(0, 5),
            environment: {
                NODE_ENV: process.env.NODE_ENV,
                RENDER: process.env.RENDER,
                USE_PERSISTENT_STORAGE: process.env.USE_PERSISTENT_STORAGE,
                UPLOADS_PATH: process.env.UPLOADS_PATH
            }
        });
    } catch (error) {
        res.status(500).json({
            error: error.message,
            uploadsPath: uploadsPath
        });
    }
});
