const API_BASE_URL = "http://localhost:8000/api/v1";

export const api = {
  async getVideos() {
    const response = await fetch(`${API_BASE_URL}/videos`);
    if (!response.ok) {
      throw new Error("Failed to fetch videos");
    }
    return response.json();
  },

  async getVideoById(id: string) {
    const response = await fetch(`${API_BASE_URL}/videos/${id}`);
    if (!response.ok) {
      throw new Error("Failed to fetch video");
    }
    return response.json();
  },
};
