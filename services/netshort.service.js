const axios = require('axios');
require('dotenv').config();

// KITA HAPUS HTTPS AGENT
// const https = require('https'); 
// const agent = ...

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 30000, // 30 Detik
    // HAPUS httpsAgent: agent,
    headers: { 
        // Tetap gunakan header browser agar tidak dianggap bot
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        // 'Connection': 'close' // Opsional: Bisa dipakai jika sering timeout
    }
});

// Interceptor Rate Limit (Tetap berguna)
apiClient.interceptors.response.use(response => {
    return response;
}, error => {
    return Promise.reject(error);
});

// Fungsi Retry Standar (Tanpa Agent)
async function fetchWithRetry(endpoint, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await apiClient.get(endpoint);
            return res.data;
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            
            console.warn(`⚠️ Error ${endpoint} (Attempt ${i+1}): ${error.message}`);

            if (isLastAttempt) {
                // Return fallback kosong
                if(endpoint.includes('search')) return { searchCodeSearchResult: [] };
                if(endpoint.includes('theaters')) return [];
                return null;
            }
            
            // Tunggu 1 detik sebelum coba lagi
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

class NetshortService {
    async getTheaters() {
        return await fetchWithRetry('/netshort/theaters') || [];
    }

    async getForYou(page = 1) {
        return await fetchWithRetry(`/netshort/foryou?page=${page}`);
    }

    async search(query) {
        return await fetchWithRetry(`/netshort/search?query=${encodeURIComponent(query)}`) || { searchCodeSearchResult: [] };
    }

    async getDetail(shortPlayId) {
        return await fetchWithRetry(`/netshort/allepisode?shortPlayId=${shortPlayId}`);
    }
}

module.exports = new NetshortService();
