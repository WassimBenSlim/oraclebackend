const express = require('express');
const router = express.Router();
const isAdmin = require('../middlewares/isAdmin');

// Use isAdmin middleware for all admin routes below
router.use(isAdmin);

router.get('/dashboard', (req, res) => {
  res.json({ message: 'Welcome to admin dashboard', user: req.user });
});


module.exports = router;
