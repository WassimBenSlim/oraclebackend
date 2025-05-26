const express = require('express');
const runMigrations = require('./migrations');
const userRoutes = require('./routes/user.routes');
const profileRoutes = require('./routes/profile.routes');
const adminRoutes = require('./routes/admin.routes');
const gradesRoutes = require('./routes/grades.routes');
const metierRoutes = require('./routes/metier.routes');
const posteRoutes = require('./routes/poste.routes');
const competenceRoutes = require('./routes/competence.routes')
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser());
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:3001', // frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true // cookies
}));

// Middleware for migrations
(async () => {
  try {
    await runMigrations();
    app.use('/api', userRoutes);
    app.use('/api', profileRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api', gradesRoutes);
    app.use('/api', metierRoutes);
    app.use('/api', posteRoutes);
    app.use('/api', competenceRoutes)

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error during app initialization:', err.message);
    process.exit(1);
  }
})();
