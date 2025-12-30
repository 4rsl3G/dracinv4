const service = require('../services/netshort.service');

exports.home = async (req, res) => {
    const theaters = await service.getTheaters();
    // Filter empty rows strict rule
    const validTheaters = theaters.filter(group => group.contentInfos && group.contentInfos.length > 0);
    
    // Get Hero Content (Random item from first group)
    const heroContent = validTheaters.length > 0 && validTheaters[0].contentInfos.length > 0 
        ? validTheaters[0].contentInfos[0] 
        : null;

    res.render('home', { 
        title: 'Home - PanStream', 
        theaters: validTheaters,
        hero: heroContent,
        page: 'home'
    });
};

exports.browse = async (req, res) => {
    // Initial SSR load page 1
    const data = await service.getForYou(1);
    res.render('browse', { 
        title: 'Browse - PanStream', 
        initialData: data ? data.contentInfos : [],
        page: 'browse'
    });
};

// API Proxy for Infinite Scroll
exports.apiBrowse = async (req, res) => {
    const page = req.query.page || 1;
    const data = await service.getForYou(page);
    res.json(data);
};

// API Proxy for Search
exports.apiSearch = async (req, res) => {
    const query = req.query.q;
    if(!query) return res.json({ searchCodeSearchResult: [] });
    const data = await service.search(query);
    res.json(data);
};

exports.player = async (req, res) => {
    const { id } = req.params;
    const detail = await service.getDetail(id);

    if (!detail) {
        return res.status(404).render('layouts/main', { title: 'Not Found', body: '<h1>Content Not Found</h1>' });
    }

    // Sort episodes ensuring order
    if(detail.shortPlayEpisodeInfos) {
        detail.shortPlayEpisodeInfos.sort((a, b) => a.episodeNo - b.episodeNo);
    }

    res.render('player', { 
        title: `Watching: ${detail.shortPlayName}`, 
        detail: detail,
        page: 'player'
    });
};
