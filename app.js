require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const mainRoutes = require('./routes/index');

const app = express();

// Security & Performance
app.use(helmet({
    contentSecurityPolicy: false, 
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

// Error Handler (FIXED: Aman dari ReferenceError page)
app.use((err, req, res, next) => {
    console.error("SERVER ERROR:", err.message);
    
    // Render tampilan error manual tanpa dependencies header yang kompleks
    res.status(500).send(`
        <html>
        <body style="background:#0b0b0b; color:white; font-family:sans-serif; text-align:center; padding-top:100px;">
            <h1 style="color:#e50914; font-size:4rem;">500</h1>
            <h2>Internal Server Error</h2>
            <p>${process.env.NODE_ENV === 'production' ? 'Something went wrong.' : err.message}</p>
            <br>
            <a href="/" style="color:white; border:1px solid white; padding:10px 20px; text-decoration:none;">Refresh / Back Home</a>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 PANSTREAM running on port ${PORT}`);
});
