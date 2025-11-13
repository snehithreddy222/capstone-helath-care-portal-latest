// backend/routes/messageRoutes.js
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const controller = require('../controllers/messagesController');

const router = express.Router();

router.use(authenticateToken);

router.get('/unread-count', controller.unreadCount);
router.get('/threads', controller.listThreads);
router.get('/threads/:id', controller.getThread);
router.get('/threads/:id/messages', controller.listMessages);
router.post('/threads', controller.createThread);
router.post('/threads/:id/messages', controller.postMessage);
router.post('/threads/:id/read', controller.markRead);

module.exports = router; // <- IMPORTANT
