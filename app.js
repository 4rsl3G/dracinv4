require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const mainRoutes = require('./routes/index');

const app = express();

// Security & Performance
app.use(helmet({
    contentSecurityPolicy: false, // Disabled for external video/img sources
}));
app.use(compression());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Routes
app.use('/', mainRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('layouts/main', {
        title: 'Error',
        body: '<div class="error-page"><h1>500</h1><p>Something went wrong.</p><a href="/" class="btn-primary">Back Home</a></div>'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 PANSTREAM running on port ${PORT}`);
});
