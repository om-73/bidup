const redis = require('../config/redis');
const { v4: uuidv4 } = require('uuid');

class PasteService {
    async createPaste(content, ttl_seconds, max_views, title = null, imageUrl = null, startingBid = 0, nowOverride = null) {
        const id = uuidv4();
        const now = nowOverride || Date.now();

        const pasteData = {
            id,
            content,
            title,
            image_url: imageUrl,
            starting_bid: startingBid || 0,
            created_at: now,
            expires_at: ttl_seconds ? now + (ttl_seconds * 1000) : null,
            max_views: max_views || null
        };

        // Store main data
        await redis.set(`paste:${id}:data`, JSON.stringify(pasteData));

        // Store view counter
        await redis.set(`paste:${id}:views`, 0);

        // Set Redis expiry if TTL is provided (as a cleanup mechanism)
        if (ttl_seconds && typeof redis.expire === 'function') {
            await redis.expire(`paste:${id}:data`, ttl_seconds + 3600);
            await redis.expire(`paste:${id}:views`, ttl_seconds + 3600);
        }

        return pasteData;
    }

    async getPaste(id, nowOverride = null) {
        const now = nowOverride || Date.now();

        const dataStr = await redis.get(`paste:${id}:data`);
        if (!dataStr) return null;

        const data = JSON.parse(dataStr);

        // Check Expiry Logic
        if (data.expires_at && now >= data.expires_at) {
            return null;
        }

        // Check View Limit Logic
        const currentViews = await redis.incr(`paste:${id}:views`);

        if (data.max_views && currentViews > data.max_views) {
            return null;
        }

        // Get Latest Bid
        const currentBid = await redis.get(`paste:${id}:current_bid`);

        return {
            ...data,
            current_bid: currentBid ? parseFloat(currentBid) : null,
            remaining_views: data.max_views ? Math.max(0, data.max_views - currentViews) : null
        };
    }

    async placeBid(id, amount) {
        const dataStr = await redis.get(`paste:${id}:data`);
        if (!dataStr) throw new Error('Auction not found');
        const data = JSON.parse(dataStr);

        const currentBid = await redis.get(`paste:${id}:current_bid`);
        const minimumRequired = currentBid ? parseFloat(currentBid) : (data.starting_bid || 0);

        if (amount <= minimumRequired) {
            const errorMsg = currentBid
                ? `Bid must be higher than current bid ($${minimumRequired})`
                : `First bid must be higher than starting bid ($${minimumRequired})`;
            throw new Error(errorMsg);
        }

        await redis.set(`paste:${id}:current_bid`, amount);
        await redis.zadd(`paste:${id}:bid_history`, Date.now(), amount);

        return { success: true, new_bid: amount };
    }
}

module.exports = new PasteService();
