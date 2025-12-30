const axios = require('axios');
const https = require('https');
require('dotenv').config();

// HAPUS NODE-CACHE
// const NodeCache = require('node-cache'); 
// const apiCache = new NodeCache({ stdTTL: 300 }); 

// KONFIGURASI HTTPS AGENT (TETAP WAJIB ADA UNTUK VPS)
// Ini agar tidak error "socket disconnected"
const agent = new https.Agent({  
    keepAlive: true,
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000,
    family: 4, // WAJIB: Paksa IPv4
    rejectUnauthorized: false 
});

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 30000, // 30 Detik timeout
    httpsAgent: agent,
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
    }
});

class NetshortService {
    async getTheaters() {
        // LANGSUNG HIT API (NO CACHE CHECK)
        try {
            console.log("Fetching Theaters (Realtime)...");
            const res = await apiClient.get('/netshort/theaters');
            return res.data || [];
        } catch (error) {
            console.error("❌ API Error [Theaters]:", error.message);
            return []; 
        }
    }

    async getForYou(page = 1) {
        // LANGSUNG HIT API
        try {
            console.log(`Fetching ForYou Page ${page} (Realtime)...`);
            const res = await apiClient.get(`/netshort/foryou?page=${page}`);
            return res.data;
        } catch (error) {
            console.error(`❌ API Error [ForYou Page ${page}]:`, error.message);
            return null;
        }
    }

    async search(query) {
        // SEARCH MEMANG TIDAK PERNAH DI-CACHE
        try {
            const res = await apiClient.get(`/netshort/search?query=${encodeURIComponent(query)}`);
            return res.data;
        } catch (error) {
            console.error(`❌ API Error [Search]:`, error.message);
            return { searchCodeSearchResult: [] };
        }
    }

    async getDetail(shortPlayId) {
        // LANGSUNG HIT API
        try {
            console.log(`Fetching Detail ${shortPlayId} (Realtime)...`);
            const res = await apiClient.get(`/netshort/allepisode?shortPlayId=${shortPlayId}`);
            return res.data;
        } catch (error) {
            console.error(`❌ API Error [Detail]:`, error.message);
            return null;
        }
    }
}

module.exports = new NetshortService();
