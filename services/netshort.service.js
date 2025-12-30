const axios = require('axios');
const NodeCache = require('node-cache');
const https = require('https'); // Required for VPS Fix
require('dotenv').config();

const apiCache = new NodeCache({ stdTTL: 300 }); 

// FIX: Paksa IPv4 untuk menghindari masalah jaringan VPS
const agent = new https.Agent({  
    family: 4, 
    rejectUnauthorized: false
});

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 15000, 
    httpsAgent: agent, // Apply fix
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
    }
});

class NetshortService {
    async getTheaters() {
        const cacheKey = 'home_theaters';
        if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

        try {
            const res = await apiClient.get('/netshort/theaters');
            const data = res.data;
            if(Array.isArray(data)) {
                apiCache.set(cacheKey, data);
                return data;
            }
            return [];
        } catch (error) {
            console.error("API Error [Theaters]:", error.message);
            return []; 
        }
    }

    async getForYou(page = 1) {
        const cacheKey = `foryou_${page}`;
        if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

        try {
            const res = await apiClient.get(`/netshort/foryou?page=${page}`);
            apiCache.set(cacheKey, res.data, 300);
            return res.data;
        } catch (error) {
            console.error(`API Error [ForYou Page ${page}]:`, error.message);
            return null;
        }
    }

    async search(query) {
        try {
            const res = await apiClient.get(`/netshort/search?query=${encodeURIComponent(query)}`);
            return res.data;
        } catch (error) {
            console.error(`API Error [Search]:`, error.message);
            return { searchCodeSearchResult: [] };
        }
    }

    async getDetail(shortPlayId) {
        const cacheKey = `detail_${shortPlayId}`;
        if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

        try {
            const res = await apiClient.get(`/netshort/allepisode?shortPlayId=${shortPlayId}`);
            apiCache.set(cacheKey, res.data, 600);
            return res.data;
        } catch (error) {
            console.error(`API Error [Detail]:`, error.message);
            return null;
        }
    }
}

module.exports = new NetshortService();
