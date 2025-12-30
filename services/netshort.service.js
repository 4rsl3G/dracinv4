const axios = require('axios');
const https = require('https');
require('dotenv').config();

// CONFIG HTTPS AGENT
// Kita sesuaikan dengan header server: Keep-Alive NYALA.
const agent = new https.Agent({  
    keepAlive: true,        // Sesuai header 'connection: keep-alive'
    keepAliveMsecs: 10000,  // Tahan koneksi 10 detik
    maxSockets: 100,
    maxFreeSockets: 10,
    timeout: 60000,
    family: 4,              // WAJIB: Paksa IPv4 untuk VPS
    rejectUnauthorized: false, 
    servername: 'netshort.sansekai.my.id' // Fix SNI handshake
});

const apiClient = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 30000, 
    httpsAgent: agent,
    headers: { 
        // Header ini MENIRU BROWSER agar tidak diblokir Nginx
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive', // Sesuai header server
        'Referer': 'https://netshort.sansekai.my.id/',
        'Origin': 'https://netshort.sansekai.my.id'
    }
});

// Interceptor untuk memantau Rate Limit
apiClient.interceptors.response.use(response => {
    // Cek sisa limit dari header
    const remaining = response.headers['ratelimit-remaining'];
    if (remaining && parseInt(remaining) < 5) {
        console.warn(`⚠️ WARNING: API Rate Limit sekarat! Sisa: ${remaining} request.`);
    }
    return response;
}, error => {
    return Promise.reject(error);
});

async function fetchWithRetry(endpoint, retries = 2) {
    for (let i = 0; i < retries; i++) {
        try {
            // console.log(`📡 GET ${endpoint}`); // Uncomment untuk debug
            const res = await apiClient.get(endpoint);
            return res.data;
        } catch (error) {
            const isLastAttempt = i === retries - 1;
            
            // Deteksi spesifik jika socket diputus
            if (error.code === 'ECONNRESET' || error.message.includes('socket disconnected')) {
                console.warn(`⚠️ Socket putus di ${endpoint}. Mencoba ulang (Attempt ${i+1})...`);
            } else {
                console.error(`❌ API Error ${endpoint}: ${error.message}`);
            }

            if (isLastAttempt) {
                // Return null/empty biar web gak crash total
                if(endpoint.includes('search')) return { searchCodeSearchResult: [] };
                if(endpoint.includes('theaters')) return [];
                return null;
            }
            
            // Tunggu 1.5 detik sebelum retry (menghindari spamming server yang lagi sensitif)
            await new Promise(r => setTimeout(r, 1500));
        }
    }
}

class NetshortService {
    // TANPA CACHE (REALTIME)
    
    async getTheaters() {
        // Return array kosong jika gagal, biar halaman home tetap loading
        const data = await fetchWithRetry('/netshort/theaters');
        return data || [];
    }

    async getForYou(page = 1) {
        const data = await fetchWithRetry(`/netshort/foryou?page=${page}`);
        return data;
    }

    async search(query) {
        const data = await fetchWithRetry(`/netshort/search?query=${encodeURIComponent(query)}`);
        return data || { searchCodeSearchResult: [] };
    }

    async getDetail(shortPlayId) {
        const data = await fetchWithRetry(`/netshort/allepisode?shortPlayId=${shortPlayId}`);
        return data;
    }
}

module.exports = new NetshortService();
