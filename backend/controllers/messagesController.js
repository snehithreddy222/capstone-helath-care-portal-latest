// backend/controllers/messagesController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/*
Helpers
*/
function safeLimit(v, def = 20, max = 100) {
  const n = Number(v ?? def);
  return Number.isFinite(n) ? Math.min(Math.max(1, n), max) : def;
}

/*
GET /api/messages/unread-count
Total unread across all threads for current user
*/
exports.unreadCount = async (req, res) => {
  const userId = req.user.userId;

  try {
    // all threads I participate in
    const parts = await prisma.threadParticipant.findMany({
      where: { userId },
      select: { threadId: true, lastReadAt: true },
    });

    if (parts.length === 0) {
      return res.json({ success: true, data: { unread: 0 } });
    }

    const perThreadCounts = await Promise.all(
      parts.map(async p => {
        const c = await prisma.message.count({
          where: {
            threadId: p.threadId,
            createdAt: { gt: p.lastReadAt ?? new Date(0) },
            senderUserId: { not: userId },
          },
        });
        return c;
      })
    );

    const total = perThreadCounts.reduce((a, b) => a + b, 0);
    res.json({ success: true, data: { unread: total } });
  } catch (err) {
    console.error('unreadCount error', err);
    res.status(500).json({ success: false, message: 'Failed to compute unread count' });
  }
};

/*
GET /api/messages/threads
Query: cursor, limit, q
*/
exports.listThreads = async (req, res) => {
  const userId = req.user.userId;
  const { cursor, q } = req.query;
  const limit = safeLimit(req.query.limit, 20, 50);

  try {
    const where = {
      participants: { some: { userId } },
      ...(q
        ? {
            OR: [
              { subject: { contains: q, mode: 'insensitive' } },
              { messages: { some: { body: { contains: q, mode: 'insensitive' } } } },
            ],
          }
        : {}),
    };

    const threads = await prisma.messageThread.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        participants: true,
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    const data = await Promise.all(
      threads.map(async t => {
        const lastMessage = t.messages[0] || null;
        const me = t.participants.find(p => p.userId === userId);
        const lastReadAt = me?.lastReadAt ?? new Date(0);

        const unread = await prisma.message.count({
          where: {
            threadId: t.id,
            createdAt: { gt: lastReadAt },
            senderUserId: { not: userId },
          },
        });

        return {
          id: t.id,
          subject: t.subject || null,
          lastActivity: lastMessage?.createdAt || t.updatedAt,
          unreadCount: unread,
          lastMessage: lastMessage
            ? { id: lastMessage.id, body: lastMessage.body, createdAt: lastMessage.createdAt }
            : null,
        };
      })
    );

    const nextCursor = threads.length === limit ? threads[threads.length - 1].id : null;
    res.json({ success: true, data, nextCursor });
  } catch (err) {
    console.error('listThreads error', err);
    res.status(500).json({ success: false, message: 'Failed to load threads' });
  }
};

/*
GET /api/messages/threads/:id
*/
exports.getThread = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const limit = safeLimit(req.query.limit, 20, 100);
  const { cursor } = req.query;

  try {
    const participant = await prisma.threadParticipant.findFirst({
      where: { threadId: id, userId },
    });
    if (!participant) return res.status(403).json({ success: false, message: 'Forbidden' });

    const thread = await prisma.messageThread.findUnique({
      where: { id },
      include: {
        participants: {
          include: { user: { select: { id: true, username: true, email: true, role: true } } },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: limit,
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          include: {
            sender: { select: { id: true, username: true, role: true } },
          },
        },
      },
    });

    if (!thread) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({
      success: true,
      data: {
        id: thread.id,
        subject: thread.subject,
        participants: thread.participants.map(p => ({
          userId: p.userId,
          role: p.role,
          lastReadAt: p.lastReadAt,
          user: p.user,
        })),
        messages: thread.messages.reverse(),
      },
    });
  } catch (err) {
    console.error('getThread error', err);
    res.status(500).json({ success: false, message: 'Failed to load thread' });
  }
};

/*
POST /api/messages/threads
Body: { doctorUserId, subject?, body }
*/
exports.createThread = async (req, res) => {
  const userId = req.user.userId;
  const { doctorUserId, subject, body } = req.body;

  if (!doctorUserId || !body) {
    return res.status(400).json({ success: false, message: 'doctorUserId and body are required' });
  }

  try {
    const created = await prisma.messageThread.create({
      data: {
        subject: subject || null,
        participants: {
          create: [
            { userId, role: 'PATIENT', lastReadAt: new Date() },
            { userId: doctorUserId, role: 'DOCTOR', lastReadAt: null },
          ],
        },
        messages: { create: [{ senderUserId: userId, body }] },
      },
    });

    res.status(201).json({ success: true, data: { id: created.id } });
  } catch (err) {
    console.error('createThread error', err);
    res.status(500).json({ success: false, message: 'Failed to create thread' });
  }
};

/*
POST /api/messages/threads/:id/messages
Body: { body }
*/
exports.postMessage = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { body } = req.body;

  if (!body || typeof body !== 'string') {
    return res.status(400).json({ success: false, message: 'body is required' });
  }

  try {
    const participant = await prisma.threadParticipant.findFirst({
      where: { threadId: id, userId },
    });
    if (!participant) return res.status(403).json({ success: false, message: 'Forbidden' });

    const msg = await prisma.message.create({
      data: { threadId: id, senderUserId: userId, body },
    });

    await prisma.messageThread.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({ success: true, data: msg });
  } catch (err) {
    console.error('postMessage error', err);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
};

/*
POST /api/messages/threads/:id/read
*/
exports.markRead = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const updated = await prisma.threadParticipant.updateMany({
      where: { threadId: id, userId },
      data: { lastReadAt: new Date() },
    });

    if (!updated.count) return res.status(404).json({ success: false, message: 'Not a participant' });
    res.json({ success: true });
  } catch (err) {
    console.error('markRead error', err);
    res.status(500).json({ success: false, message: 'Failed to mark read' });
  }
};

/*
GET /api/messages/threads/:id/messages
Cursor pagination newest to older using id cursor
*/
exports.listMessages = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const { cursor } = req.query;
  const limit = safeLimit(req.query.limit, 20, 100);

  try {
    const participant = await prisma.threadParticipant.findFirst({
      where: { threadId: id, userId },
    });
    if (!participant) return res.status(403).json({ success: false, message: 'Forbidden' });

    const msgs = await prisma.message.findMany({
      where: { threadId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: { sender: { select: { id: true, username: true, role: true } } },
    });

    const nextCursor = msgs.length === limit ? msgs[msgs.length - 1].id : null;
    res.json({ success: true, data: msgs.reverse(), nextCursor });
  } catch (err) {
    console.error('listMessages error', err);
    res.status(500).json({ success: false, message: 'Failed to load messages' });
  }
};
