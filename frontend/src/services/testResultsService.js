// src/services/testResultsService.js
import http from "./http";

export const testResultsService = {
  async list({ q, cursor, limit = 20 } = {}) {
    const params = {};
    if (q) params.q = q;
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;

    const { data } = await http.get("/test-results", { params });
    const items = data?.data?.items || [];
    return {
      items,
      nextCursor: data?.nextCursor || null,
    };
  },

  async getOne(id) {
    const { data } = await http.get(`/test-results/${id}`);
    return data?.data || null;
  },

  downloadUrl(id) {
    // Let the browser follow the redirect
    return `${http.defaults.baseURL}/test-results/${id}/download`;
  },
};
