const express = require('express');
const router = express.Router();
const redis = require('../config/redis');
const pasteService = require('../services/pasteService');

// Health Check
router.get('/healthz', async (req, res) => {
    try {
        const status = await redis.ping();
        res.json({
            ok: status === 'PONG',
            persistent: redis.isPersistent === true
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Redis connection failed' });
    }
});

// Create Paste
router.post('/pastes', async (req, res) => {
    const { content, ttl_seconds, max_views, title, image_url, starting_bid } = req.body;

    if (!content || typeof content !== 'string' || content.trim() === '') {
        return res.status(400).json({ error: 'content is required and must be a non-empty string' });
    }

    if (ttl_seconds !== undefined && (!Number.isInteger(ttl_seconds) || ttl_seconds < 1)) {
        return res.status(400).json({ error: 'ttl_seconds must be an integer >= 1' });
    }

    if (max_views !== undefined && (!Number.isInteger(max_views) || max_views < 1)) {
        return res.status(400).json({ error: 'max_views must be an integer >= 1' });
    }

    try {
        const paste = await pasteService.createPaste(content, ttl_seconds, max_views, title, image_url, starting_bid, req.now);
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const host = req.headers['x-forwarded-host'] || req.get('host');
        const baseUrl = process.env.BASE_URL || `${protocol}://${host}`;

        res.status(201).json({
            id: paste.id,
            url: `${baseUrl}/p/${paste.id}`,
            monitor_url: `${baseUrl}/p/monitor/${paste.id}`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch Paste API
router.get('/pastes/:id', async (req, res) => {
    try {
        const paste = await pasteService.getPaste(req.params.id, req.now);

        if (!paste) {
            return res.status(404).json({ error: 'Paste not found or expired' });
        }

        res.json({
            content: paste.content,
            current_bid: paste.current_bid,
            bid_history: paste.bid_history,
            remaining_views: paste.remaining_views,
            expires_at: paste.expires_at ? new Date(paste.expires_at).toISOString() : null
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Place Bid API
router.post('/pastes/:id/bids', async (req, res) => {
    const { amount, bidderName } = req.body;

    if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'amount is required and must be a positive number' });
    }

    try {
        const result = await pasteService.placeBid(req.params.id, amount, bidderName);
        res.json(result);
    } catch (err) {
        if (err.message.includes('Bid must be higher')) {
            return res.status(400).json({ error: err.message });
        }
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Monitoring API (does not increment views)
router.get('/pastes/:id/monitor', async (req, res) => {
    try {
        const paste = await pasteService.getMonitoringData(req.params.id);

        if (!paste) {
            return res.status(404).json({ error: 'Paste not found' });
        }

        res.json({
            current_views: paste.current_views,
            current_bid: paste.current_bid,
            bid_history: paste.bid_history
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
