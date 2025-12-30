const axios = require('axios');
const https = require('https');
require('dotenv').config();

// CONFIG HTTPS AGENT: LEBIH AGRESIF
const agent = new https.Agent({  
    family: 4, // Paksa IPv4
    rejectUnauthorized: false, // Abaikan SSL error
    keepAlive: false, // Matikan keep-alive untuk memastikan koneksi fresh tiap request
    servername: 'netshort.sansekai.my.id', // FIX SNI: Kasih tahu server tujuan nama domainnya manual
});

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 60000, // 60 Detik
    httpsAgent: agent,
    headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Connection': 'close' // Paksa close connection setelah selesai
    }
});

// FUNGSI WRAPPER RETRY (DICOBA 3 KALI JIKA GAGAL)
async function fetchWithRetry(endpoint, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`📡 Fetching ${endpoint} (Attempt ${i + 1}/${retries})...`);
            const res = await apiClient.get(endpoint);
            return res.data;
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            console.error(`⚠️ Error ${endpoint} (Attempt ${i + 1}): ${error.message}`);
            
            if (isLastAttempt) throw error; // Lempar error jika sudah habis limit retry
            
            // Tunggu 1 detik sebelum coba lagi
            await new Promise(r => setTimeout(r, 1000));
        }
    }
}

class NetshortService {
    async getTheaters() {
        try {
            const data = await fetchWithRetry('/netshort/theaters');
            return data || [];
        } catch (error) {
            console.error("❌ FINAL API Error [Theaters]:", error.message);
            return []; // Return kosong biar web gak crash
        }
    }

    async getForYou(page = 1) {
        try {
            const data = await fetchWithRetry(`/netshort/foryou?page=${page}`);
            return data;
        } catch (error) {
            console.error(`❌ FINAL API Error [ForYou ${page}]:`, error.message);
            return null;
        }
    }

    async search(query) {
        try {
            const data = await fetchWithRetry(`/netshort/search?query=${encodeURIComponent(query)}`);
            return data;
        } catch (error) {
            console.error(`❌ FINAL API Error [Search]:`, error.message);
            return { searchCodeSearchResult: [] };
        }
    }

    async getDetail(shortPlayId) {
        try {
            const data = await fetchWithRetry(`/netshort/allepisode?shortPlayId=${shortPlayId}`);
            return data;
        } catch (error) {
            console.error(`❌ FINAL API Error [Detail]:`, error.message);
            return null;
        }
    }
}

module.exports = new NetshortService();
