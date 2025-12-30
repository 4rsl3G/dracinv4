const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();

// Cache Strategy: 
// Theaters/Home: 5 min TTL
// Detail: 10 min TTL
// Search: 0 TTL
const apiCache = new NodeCache({ stdTTL: 300 }); 

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 10000,
    headers: { 'User-Agent': 'PanStream/1.0' }
});

class NetshortService {
    async getTheaters() {
        const cacheKey = 'home_theaters';
        if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

        try {
            const res = await apiClient.get('/netshort/theaters');
            const data = res.data;
            // Filter empty contentInfos logic handled here or in controller
            apiCache.set(cacheKey, data);
            return data;
        } catch (error) {
            console.error("API Error [Theaters]:", error.message);
            return []; // Fail gracefully
        }
    }

    async getForYou(page = 1) {
        const cacheKey = `foryou_${page}`;
        if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

        try {
            const res = await apiClient.get(`/netshort/foryou?page=${page}`);
            const data = res.data;
            apiCache.set(cacheKey, data, 300); // 5 min
            return data;
        } catch (error) {
            console.error(`API Error [ForYou Page ${page}]:`, error.message);
            return null;
        }
    }

    async search(query) {
        // NO CACHE for Realtime Search
        try {
            const res = await apiClient.get(`/netshort/search?query=${encodeURIComponent(query)}`);
            return res.data;
        } catch (error) {
            console.error(`API Error [Search ${query}]:`, error.message);
            return { searchCodeSearchResult: [] };
        }
    }

    async getDetail(shortPlayId) {
        const cacheKey = `detail_${shortPlayId}`;
        if (apiCache.has(cacheKey)) return apiCache.get(cacheKey);

        try {
            const res = await apiClient.get(`/netshort/allepisode?shortPlayId=${shortPlayId}`);
            const data = res.data;
            apiCache.set(cacheKey, data, 600); // Cache detail longer
            return data;
        } catch (error) {
            console.error(`API Error [Detail ${shortPlayId}]:`, error.message);
            return null;
        }
    }
}

module.exports = new NetshortService();
