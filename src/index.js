const app = require('./app');

const PORT = process.env.PORT || 3000;

// Only listen if run directly (e.g., node src/index.js)
if (require.main === module) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel - both as default and as handler function
module.exports = app;
module.exports.default = app;

