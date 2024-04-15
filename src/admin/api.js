const HOST = window.location.origin;

const request = {
  async handler(method, path, options) {
    const {
      params = {},
      headers = new Headers(),
      body = null,
      credentials = "include",
    } = options || {};
    const url = new URL(`/api/${path ? path + "/" : ""}`, HOST);
    url.search = new URLSearchParams(params);
    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers.append("Content-Type", "application/json");
    }
    const response = await fetch(url, {
      method,
      params,
      headers,
      body,
      credentials,
    });

    let result = await response.text();
    result = result ? JSON.parse(result) : {};

    if (response.status >= 400) {
      const error = new Error();
      error.message = result;
      error.code = response.status;
      throw error;
    }

    return result;
  },
  async get(path, options) {
    return await this.handler("GET", path, options);
  },
  async post(path, options) {
    return await this.handler("POST", path, options);
  },
  async delete(path, options) {
    return await this.handler("DELETE", path, options);
  },
};

export default {
  auth: {
    async login(user) {
      return await request.post("auth/login", {
        body: JSON.stringify(user),
      });
    },
    async logout() {
      return await request.post("auth/logout");
    },
    async status() {
      return await request.get("auth/status");
    },
  },
  users: {
    async list() {
      const { results } = await request.get("users/list");
      return results;
    },
    async info(id) {
      return await request.get(`users/${id}`);
    },
    async delete(id) {
      return await request.delete(`users/${id}`);
    },
  },
  scenario: {
    async get() {
      return await request.get("settings/scenario");
    },
    async set(data) {
      return await request.post("settings/scenario", {
        body: JSON.stringify(data),
      });
    },
    async delete() {
      return await request.delete("settings/scenario");
    },
  },
  aliases: {
    async list() {
      return await request.get("settings/aliases");
    },
    async create(actions) {
      return await request.post("settings/aliases", {
        body: JSON.stringify(actions),
      });
    },
    async delete() {
      return await request.delete("settings/aliases");
    },
  },
  reminders: {
    async list(params = {}) {
      return await request.get("settings/reminders", { params });
    },
    async create(reminders) {
      return await request.post("settings/reminders", {
        body: JSON.stringify(reminders),
      });
    },
    async delete() {
      return await request.delete("settings/reminders");
    },
  },
  files: {
    async upload(file) {
      return await request.post("files/upload", {
        body: file,
      });
    },
    async delete(filename) {
      return await request.delete(`files/${filename}`);
    },
  },
};
