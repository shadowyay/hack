// API Configuration
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
const AI_SERVICE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:5001';

export const apiConfig = {
  baseURL: API_BASE_URL,
  aiServiceURL: AI_SERVICE_URL,
  
  // API Endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    profile: `${API_BASE_URL}/auth/profile`,
  },
  
  leaderboard: {
    get: (gameMode?: string, limit = 10) => 
      gameMode 
        ? `${API_BASE_URL}/leaderboard/${gameMode}?limit=${limit}`
        : `${API_BASE_URL}/leaderboard?limit=${limit}`,
    user: (userId: string, gameMode?: string) =>
      gameMode
        ? `${API_BASE_URL}/leaderboard/user/${userId}/${gameMode}`
        : `${API_BASE_URL}/leaderboard/user/${userId}`,
  },
  
  performance: {
    saveResult: `${API_BASE_URL}/performance/save-result`,
  },
  
  ai: {
    decision: `${AI_SERVICE_URL}/ai_decision`,
    scenario: `${AI_SERVICE_URL}/generate_scenario`,
    personality: `${AI_SERVICE_URL}/ai_personality`,
  }
};

export default apiConfig;
