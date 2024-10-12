import { Router, Request, Response } from 'express';
import { AppDataSource } from '../app';
import { Shop } from '../entities/Shop';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { shop } = req.query;

  if (!shop) {
    res.status(400).json({ error: 'Missing shop parameter' });
    return;
  }

  const shopRepo = AppDataSource.getRepository(Shop);

  try {
    const shopEntry = await shopRepo.findOneBy({ shop_id: shop as string });

    if (shopEntry) {
      const nonce = Date.now().toString(); // csp

      res.setHeader(
        'Content-Security-Policy',
        `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://dcsaascdn.net; style-src 'self' 'unsafe-inline';` // this crap is needed due to CSP
      );

      res.send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Shop Data</title>
                    <meta charset="UTF-8">
                    <script src="https://dcsaascdn.net/js/dc-sdk-1.0.5.min.js" nonce="${nonce}"></script>
                    <script type="text/javascript" nonce="${nonce}"> // 1:1 from documentation, to UNHIDE the app
                        window.onload = function() {
                            var ShopAppInstance = new ShopApp(function(app) {
                                app.init(null, function(params, app) {
                                    if (localStorage.getItem('styles') === null) {
                                        for (var x = 0; x < params.styles.length; ++x) {
                                            var el = document.createElement('link');
                                            el.rel = 'stylesheet';
                                            el.type = 'text/css';
                                            el.href = params.styles[x];
                                            document.getElementsByTagName('head')[0].appendChild(el);
                                        }
                                        localStorage.setItem('styles', JSON.stringify(params.styles));
                                    }

                                    app.show(null, function() {
                                        app.adjustIframeSize();
                                    });

                                }, function(errmsg, app) {
                                    alert('Error: ' + errmsg);
                                });
                            }, true);
                        };
                    </script>
                </head>
                <body>
                    <h1>Shop Data for ${shopEntry.shop_id}</h1>
                    <p>Shop URL: ${shopEntry.shop_url}</p>
                    <p>Access Token: ${shopEntry.access_token}</p>
                    <p>Refresh Token: ${shopEntry.refresh_token}</p>
                    <p>Token Expires At: ${shopEntry.token_expires}</p>
                    <p>Action: ${shopEntry.action}</p>
                    <p>Application Code: ${shopEntry.application_code}</p>
                    <p>Application Version: ${shopEntry.application_version}</p>
                    <p>Trial: ${shopEntry.trial}</p>
                    <p>Hash: ${shopEntry.hash}</p>
                    <p>Timestamp: ${shopEntry.timestamp}</p>
                </body>
                </html>
            `);
    } else {
      res.status(404).json({ error: 'Shop not found' });
    }
  } catch (error) {
    console.error('Error fetching shop data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
