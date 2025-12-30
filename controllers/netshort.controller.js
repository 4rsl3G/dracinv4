const service = require('../services/netshort.service');

exports.home = async (req, res) => {
    const theaters = await service.getTheaters();
    
    // Safety check jika API down/kosong
    const validTheaters = Array.isArray(theaters) ? theaters.filter(group => group.contentInfos && group.contentInfos.length > 0) : [];
    
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
    const data = await service.getForYou(1);
    const initial = data ? data.contentInfos : [];
    
    res.render('browse', { 
        title: 'Browse - PanStream', 
        initialData: initial,
        page: 'browse' 
    });
};

exports.apiBrowse = async (req, res) => {
    const page = req.query.page || 1;
    const data = await service.getForYou(page);
    res.json(data || { contentInfos: [] });
};

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
        return res.status(404).render('partials/header', { 
            title: 'Not Found', 
            page: 'error' 
        }, (err, html) => res.send(html + '<h1 style="color:white;text-align:center;margin-top:100px;">Content Not Found</h1></body></html>'));
    }

    if(detail.shortPlayEpisodeInfos) {
        detail.shortPlayEpisodeInfos.sort((a, b) => a.episodeNo - b.episodeNo);
    }

    res.render('player', { 
        title: `Watching: ${detail.shortPlayName}`, 
        detail: detail,
        page: 'player' 
    });
};
