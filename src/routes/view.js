const express = require('express');
const router = express.Router();
const pasteService = require('../services/pasteService');

router.get('/monitor/:id', async (req, res) => {
  try {
    const paste = await pasteService.getMonitoringData(req.params.id);

    if (!paste) {
      return res.status(404).send('404 - Item Not Found');
    }

    const escapeHTML = (str) => {
      return str ? str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]) : '';
    };

    const productTitle = paste.title || 'Exclusive Auction Item';
    const bidHistoryRows = paste.bid_history.map(bid => `
        <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <span style="color: #fff;">₹${bid.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span style="color: #94a3b8; font-size: 0.8rem;">${new Date(bid.timestamp).toLocaleString()}</span>
        </div>
    `).join('');

    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Monitor: ${escapeHTML(productTitle)}</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #6366f1;
            --bg: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --border: rgba(255, 255, 255, 0.1);
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --accent: #f43f5e; 
          }

          body { 
            font-family: 'Outfit', sans-serif; 
            background: var(--bg);
            color: var(--text); 
            line-height: 1.6; 
            margin: 0;
            padding: 20px;
            min-height: 100vh;
          }

          .container { 
            max-width: 1000px; 
            margin: 0 auto; 
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
          }

          @media (max-width: 800px) {
            .container { grid-template-columns: 1fr; }
          }

          .card {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
          }

          h1 { margin-top: 0; font-size: 1.5rem; }
          h2 { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }

          .stat-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .stat-box {
            background: rgba(0,0,0,0.2);
            padding: 12px;
            border-radius: 8px;
          }

          .stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; }
          .stat-value { font-size: 1.25rem; font-weight: 700; color: #fff; }

          .bid-list {
            max-height: 300px;
            overflow-y: auto;
            background: rgba(0,0,0,0.2);
            border-radius: 8px;
          }

          .header-badge {
            background: var(--accent);
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            display: inline-block;
            margin-bottom: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
            <div class="column">
                <div class="card">
                    <div class="header-badge">Owner Dashboard</div>
                    <h1>${escapeHTML(productTitle)}</h1>
                    <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 20px;">
                        ID: ${req.params.id}
                    </div>
                    
                    <h2>Lifecycle Stats</h2>
                    <div class="stat-grid">
                        <div class="stat-box">
                            <div class="stat-label">Total Views</div>
                            <div class="stat-value">${paste.current_views} <span style="font-size: 0.8rem; color: var(--text-muted);">/ ${paste.max_views || '∞'}</span></div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Expires At</div>
                            <div class="stat-value" style="font-size: 0.9rem;">${paste.expires_at ? new Date(paste.expires_at).toLocaleString() : 'Never'}</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-label">Starting Bid</div>
                            <div class="stat-value">₹${paste.starting_bid.toLocaleString('en-IN')}</div>
                        </div>
                         <div class="stat-box">
                            <div class="stat-label">Current Highest</div>
                            <div class="stat-value" style="color: var(--success);">₹${(paste.current_bid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="column">
                <div class="card">
                    <h2>Bid History (${paste.bid_history.length})</h2>
                    <div class="bid-list">
                        ${bidHistoryRows.length > 0 ? bidHistoryRows : '<div style="padding: 12px; color: var(--text-muted); text-align: center;">No bids yet</div>'}
                    </div>
                </div>

                <div class="card">
                     <a href="/" style="color: var(--primary-light); text-decoration: none;">&larr; Back to Home</a> | 
                     <a href="/p/${req.params.id}" target="_blank" style="color: var(--primary-light); text-decoration: none;">View Public Page &nearr;</a>
                </div>
            </div>
        </div>
      </body>
      </html>
    `);

  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paste = await pasteService.getPaste(req.params.id, req.now);

    if (!paste) {
      const isMock = process.env.USE_REDIS_MOCK === 'true' || !process.env.REDIS_URL;
      let errorHtml = '<h1 style="color: #f1f5f9; font-family: sans-serif;">404 Auction Item Not Found</h1><p style="color: #94a3b8; font-family: sans-serif;">The item may have expired or reached its view limit.</p>';

      if (isMock) {
        errorHtml += `
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 8px; font-size: 0.9em; font-family: sans-serif; text-align: left;">
                        <strong>⚠️ Vercel/Render Storage Notice:</strong> 
                        This app is currently using <em>Transient Storage</em>. Links work for a few minutes but are then deleted.
                        <br><br>
                        <strong>Fixed Connection Needed:</strong>
                        <ul style="margin: 10px 0; padding-left: 20px;">
                          <li>Set <code>REDIS_URL</code> in Vercel/Render Dashboard.</li>
                          <li><a href="https://github.com/om-73/bidup/blob/main/REDIS_SETUP.md" target="_blank" style="color: #ffc107; font-weight: bold;">Step-by-Step Redis Guide</a></li>
                        </ul>
                    </div>
                `;
      }
      return res.status(404).set('Content-Type', 'text/html').send(`
        <body style="background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0;">
          <div style="text-align: center; border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 24px; background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px);">
            ${errorHtml}
            <a href="/" style="display: none;"></a>
          </div>
        </body>
      `);
    }

    const escapeHTML = (str) => {
      return str.replace(/[&<>"']/g, (m) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m]);
    };

    const isMock = process.env.USE_REDIS_MOCK === 'true' || !process.env.REDIS_URL;
    const warningBanner = isMock ? `
      <div style="margin-top: 20px; padding: 15px; background: rgba(255, 193, 7, 0.1); color: #ffc107; border: 1px solid rgba(255, 193, 7, 0.2); border-radius: 8px; font-size: 0.8rem; margin-bottom: 20px;">
        <strong>Notice:</strong> Running on transient storage.
      </div>
    ` : '';

    const productTitle = paste.title || 'Exclusive Auction Item';
    const productImage = paste.image_url ? `<img src="${paste.image_url}" alt="${escapeHTML(productTitle)}" style="width: 100%; border-radius: 16px; margin-bottom: 24px; border: 1px solid var(--border); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">` : '';

    const bidHistoryItems = (paste.bid_history || []).map(bid => `
      <div class="bid-history-item">
        <span style="color: #fff;">₹${bid.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        <span style="color: var(--text-muted); font-size: 0.7rem;">${new Date(bid.timestamp).toLocaleTimeString()}</span>
      </div>
    `).join('');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHTML(productTitle)} | Auction</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
          :root {
            --primary: #6366f1;
            --primary-light: #818cf8;
            --bg: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.7);
            --border: rgba(255, 255, 255, 0.1);
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --accent: #22d3ee;
            --success: #10b981;
            --error: #ef4444;
          }

          body { 
            font-family: 'Outfit', sans-serif; 
            background: var(--bg);
            background-image: radial-gradient(circle at 50% -20%, #1e1b4b, var(--bg));
            color: var(--text); 
            line-height: 1.6; 
            margin: 0;
            padding: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .container { 
            max-width: 1000px; 
            width: 90%;
            margin: 40px auto; 
            display: grid;
            grid-template-columns: 1.2fr 0.8fr;
            gap: 24px;
          }

          @media (max-width: 850px) {
            .container { grid-template-columns: 1fr; }
          }

          .card {
            background: var(--card-bg);
            backdrop-filter: blur(12px);
            border: 1px solid var(--border);
            border-radius: 24px;
            padding: 32px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
          }

          .badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(34, 211, 238, 0.1);
            color: var(--accent);
            margin-bottom: 16px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            width: fit-content;
          }

          .pulse {
            width: 8px;
            height: 8px;
            background: var(--accent);
            border-radius: 50%;
            margin-right: 8px;
            box-shadow: 0 0 0 rgba(34, 211, 238, 0.4);
            animation: pulse 2s infinite;
          }

          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(34, 211, 238, 0); }
            100% { box-shadow: 0 0 0 0 rgba(34, 211, 238, 0); }
          }

          h1 { 
            font-size: 2.2rem;
            font-weight: 700;
            margin: 0 0 16px 0;
            background: linear-gradient(to right, #fff, var(--text-muted));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .description {
            color: var(--text-muted);
            font-size: 1rem;
            margin-bottom: 24px;
          }

          pre { 
            background: #020617; 
            padding: 20px; 
            border-radius: 16px; 
            overflow-x: auto; 
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            border: 1px solid var(--border);
            color: #38bdf8;
            margin-bottom: 24px;
            flex-grow: 1;
            white-space: pre-wrap;
            word-wrap: break-word;
          }

          .auction-info {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .stat-box {
            background: rgba(15, 23, 42, 0.5);
            padding: 16px;
            border-radius: 16px;
            border: 1px solid var(--border);
            transition: transform 0.2s, border-color 0.2s;
          }
          
          .stat-box.updated {
            transform: scale(1.05);
            border-color: var(--accent);
          }

          .stat-label {
            font-size: 0.7rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 1.5rem;
            font-weight: 700;
            color: #fff;
          }

          .bid-input-group {
            display: flex;
            gap: 12px;
            margin-top: 16px;
          }

          input[type="number"] {
            flex: 1;
            background: #020617;
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 12px 16px;
            color: #fff;
            font-family: inherit;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
          }

          input[type="number"]:focus {
            border-color: var(--primary);
          }

          button {
            background: var(--primary);
            color: #fff;
            border: none;
            border-radius: 12px;
            padding: 12px 20px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          button:hover:not(:disabled) {
            background: var(--primary-light);
            transform: translateY(-1px);
          }
          
          button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .meta-footer {
            margin-top: 24px;
            font-size: 0.75rem;
            color: var(--text-muted);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .back-link {
            color: var(--primary-light);
            text-decoration: none;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.9rem;
          }

          .back-link:hover { text-decoration: underline; }

          .timer {
            color: var(--accent);
            font-family: 'JetBrains Mono', monospace;
            font-weight: 600;
          }
          
          #bid-status {
            font-size: 0.8rem;
            margin-top: 8px;
            min-height: 1.2em;
          }

          .bid-history-container {
            margin-top: 24px;
            border-top: 1px solid var(--border);
            padding-top: 20px;
          }

          .bid-history-title {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.1em;
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
          }

          .bid-history-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-height: 200px;
            overflow-y: auto;
          }

          .bid-history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 12px;
            background: rgba(15, 23, 42, 0.3);
            border-radius: 8px;
            font-size: 0.85rem;
            border: 1px solid transparent;
            animation: slideIn 0.3s ease-out;
          }

          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="badge">
              <div class="pulse"></div>
              Live Auction
            </div>
            ${productImage}
            <h1>${escapeHTML(productTitle)}</h1>
            <div class="description">Digital asset ID: ${req.params.id}</div>
            <pre>${escapeHTML(paste.content)}</pre>
            ${warningBanner}
            <div class="meta-footer">
              <div>
                ${paste.expires_at ? `Expires in: <span class="timer" id="countdown" data-time="${paste.expires_at}">-</span>` : 'Infinite License'}
              </div>
              <div>
                Traffic: ${paste.remaining_views !== null ? paste.remaining_views : '∞'} refs
              </div>
            </div>
          </div>

          <div class="card auction-info">
            <div class="stat-box" id="bid-display-box">
              <div class="stat-label" id="bid-label">${paste.current_bid !== null ? 'Current Highest Bid' : 'Starting Bid'}</div>
              <div class="stat-value" id="current-bid-value">₹${(paste.current_bid !== null ? paste.current_bid : (paste.starting_bid || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Min. Increment</div>
              <div class="stat-value">₹1.00</div>
            </div>

            <div class="stat-box">
              <div class="stat-label">Network Status</div>
              <div class="stat-value" id="status-text" style="color: var(--success); font-size: 1rem;">SECURE CONNECTION</div>
            </div>

            <div class="bid-section">
              <div class="stat-label">Submit New Bid</div>
              <div class="bid-input-group">
                <input type="number" id="bid-amount" placeholder="INR" min="${(paste.current_bid !== null ? paste.current_bid : (paste.starting_bid || 0)) + 1}">
                <button id="bid-button" onclick="submitBid()">Bid</button>
              </div>
              <div id="bid-status"></div>
            </div>

            <div class="bid-history-container">
              <div class="bid-history-title">
                Recent Bids
                <span style="font-size: 0.6rem; opacity: 0.6;">LAST 10</span>
              </div>
              <div class="bid-history-list" id="bid-history-list">
                ${bidHistoryItems.length > 0 ? bidHistoryItems : '<div style="color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 10px;">No bids yet</div>'}
              </div>
            </div>

            <!-- Return to Dashboard Removed -->
          </div>
        </div>

        <script>
          const pasteId = '${req.params.id}';
          const countdownEl = document.getElementById('countdown');
          const bidInput = document.getElementById('bid-amount');
          const bidStatus = document.getElementById('bid-status');
          const bidValueDisplay = document.getElementById('current-bid-value');
          const bidBox = document.getElementById('bid-display-box');
          const bidButton = document.getElementById('bid-button');

          if (countdownEl && countdownEl.dataset.time) {
            const target = parseInt(countdownEl.dataset.time);
            function updateTimer() {
              const now = Date.now();
              const diff = target - now;
              if (diff <= 0) {
                countdownEl.innerText = "ENDED";
                bidButton.disabled = true;
                bidInput.disabled = true;
                return;
              }
              const h = Math.floor(diff / 3600000);
              const m = Math.floor((diff % 3600000) / 60000);
              const s = Math.floor((diff % 60000) / 1000);
              countdownEl.innerText = h + 'h ' + m + 'm ' + s + 's';
              requestAnimationFrame(updateTimer);
            }
            updateTimer();
          }

          async function submitBid() {
            const amount = parseFloat(bidInput.value);
            if (!amount || amount <= 0) {
              showStatus('Enter a valid amount', 'error');
              return;
            }

            bidButton.disabled = true;
            showStatus('Processing...', 'text');

            try {
              const response = await fetch('/api/pastes/' + pasteId + '/bids', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount })
              });

              const data = await response.json();

              if (response.ok) {
                showStatus('Bid placed successfully!', 'success');
                bidValueDisplay.innerText = '₹' + data.new_bid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                bidBox.classList.add('updated');
                setTimeout(() => bidBox.classList.remove('updated'), 1000);
                
                // Add to history list
                const historyList = document.getElementById('bid-history-list');
                const noBidsMsg = historyList.querySelector('div[style*="text-align: center"]');
                if (noBidsMsg) noBidsMsg.remove();
                
                const newItem = document.createElement('div');
                newItem.className = 'bid-history-item';
                newItem.innerHTML = '<span style="color: #fff;">₹' + data.new_bid.toLocaleString(\'en-IN\', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '</span><span style="color: var(--text-muted); font-size: 0.7rem;">' + new Date().toLocaleTimeString() + '</span>';
                historyList.prepend(newItem);
                if (historyList.children.length > 10) {
                  historyList.lastElementChild.remove();
                }

                bidInput.value = '';
                bidInput.min = data.new_bid + 1;
              } else {
                showStatus(data.error || 'Failed to place bid', 'error');
              }
            } catch (err) {
              showStatus('Connection error', 'error');
            } finally {
              bidButton.disabled = false;
            }
          }

          function showStatus(msg, type) {
            bidStatus.innerText = msg;
            bidStatus.style.color = 'var(--' + type + ')';
            if (type === 'text') bidStatus.style.color = 'var(--text-muted)';
          }
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = router;
