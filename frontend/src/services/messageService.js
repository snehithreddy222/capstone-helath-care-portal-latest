// src/services/messageService.js
import http from "./http";

export const messageService = {
  async getUnreadCount() {
    const { data } = await http.get("/messages/unread-count");
    return data?.data?.count ?? data?.count ?? 0;
  },

  // includeParticipants is a hint; backend may ignore it. We still enrich on the client.
  async listThreads({ cursor, limit = 20, includeParticipants = false } = {}) {
    const { data } = await http.get("/messages/threads", {
      params: { cursor, limit, include: includeParticipants ? "participants" : undefined },
    });
    const payload = data?.data || data;
    return {
      items: payload?.items || payload?.threads || payload || [],
      nextCursor: payload?.nextCursor ?? null,
    };
  },

  async getThread(threadId, { limit = 20, cursor } = {}) {
    const { data } = await http.get(`/messages/threads/${threadId}`, {
      params: { limit, cursor },
    });
    return data?.data || data;
  },

  async listMessages(threadId, { limit = 20, cursor } = {}) {
    const { data } = await http.get(`/messages/threads/${threadId}/messages`, {
      params: { limit, cursor },
    });
    const payload = data?.data || data;
    return {
      items: payload?.items || payload || [],
      nextCursor: payload?.nextCursor ?? null,
    };
  },

  async postMessage(threadId, body) {
    const { data } = await http.post(`/messages/threads/${threadId}/messages`, { body });
    return data?.data || data;
  },

  async markRead(threadId) {
    try {
      await http.post(`/messages/threads/${threadId}/read`, {});
    } catch {}
  },

  async listDoctors() {
    const { data } = await http.get("/doctors", { params: { limit: 100 } });
    const list = data?.data || data;
    return (Array.isArray(list) ? list : list?.items || []).map((d) => ({
      id: d.id,
      userId: d.userId || d.user?.id || d.user_id,
      firstName: d.firstName || d.first_name,
      lastName: d.lastName || d.last_name,
      specialization: d.specialization,
    }));
  },

  // Backend contract: POST /messages/threads { doctorUserId, subject, body }
  async createThread({ doctorUserId, subject, body }) {
    const { data } = await http.post("/messages/threads", { doctorUserId, subject, body });
    return data?.data || data;
  },
};
