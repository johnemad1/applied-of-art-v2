const express = require('express');
const router = express.Router();

const {
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/authControllers');

const { authenticateUser } = require('../middleware/authenticatin');
router.post('/login', login);
router.delete('/logout', authenticateUser, logout);
router.post('/forget-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
