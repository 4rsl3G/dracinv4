const axios = require('axios');
const dns = require('dns');
require('dotenv').config();

// --- SOLUSI TANPA HTTPS AGENT ---
// Kita suruh Node.js pilih IPv4 dulu secara global.
// Ini fitur bawaan Node.js v17+ yang mengatasi error "socket disconnected" di VPS.
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 30000, // 30 Detik
    headers: { 
        // User Agent wajib agar tidak dianggap bot
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    }
});

// Interceptor sederhana
apiClient.interceptors.response.use(
    response => response,
    error => Promise.reject(error)
);

// Fungsi Retry Standar
async function fetchWithRetry(endpoint, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            const res = await apiClient.get(endpoint);
            return res.data;
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            
            // Log error yang lebih jelas
            console.warn(`⚠️ Error ${endpoint} (Attempt ${i+1}): ${error.message}`);

            if (isLastAttempt) {
                // Return fallback kosong agar web tidak crash
                if(endpoint.includes('search')) return { searchCodeSearchResult: [] };
                if(endpoint.includes('theaters')) return [];
                return null;
            }
            
            // Tunggu 1.5 detik sebelum coba lagi
            await new Promise(r => setTimeout(r, 1500));
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
