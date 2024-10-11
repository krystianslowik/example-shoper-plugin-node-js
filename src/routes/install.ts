import {Router, Request, Response} from 'express';
import axios from 'axios';
import {AppDataSource} from '../app';
import {Shop} from '../entities/Shop';

export const installRoute = Router();

installRoute.post('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const {
            auth_code, shop, shop_url, action,
            application_code, application_version, trial, hash, timestamp
        } = req.body;

        if (!auth_code || !shop || !shop_url) {
            res.status(400).json({error: 'Missing required parameters'});
            return;
        }

        const tokenResponse = await axios.post(
            `${shop_url}/webapi/rest/oauth/token?grant_type=authorization_code`,
            `code=${encodeURIComponent(auth_code)}`,
            {
                auth: {
                    username: '[REDACTED]',
                    password: '[REDACTED]',
                },
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const {access_token, refresh_token, expires_in} = tokenResponse.data;

        const shopRepo = AppDataSource.getRepository(Shop);

        let shopEntry = await shopRepo.findOneBy({shop_id: shop});

        const validTimestamp = timestamp ? new Date(timestamp) : new Date();

        if (!shopEntry) {

            shopEntry = shopRepo.create({
                shop_id: shop,
                shop_url,
                access_token,
                refresh_token,
                token_expires: new Date(Date.now() + expires_in * 1000),
                action,
                application_code,
                application_version,
                trial,
                hash,
                timestamp: validTimestamp,
            });
        } else {

            shopEntry.access_token = access_token;
            shopEntry.refresh_token = refresh_token;
            shopEntry.token_expires = new Date(Date.now() + expires_in * 1000);
            shopEntry.action = action;
            shopEntry.application_code = application_code;
            shopEntry.application_version = application_version;
            shopEntry.trial = trial;
            shopEntry.hash = hash;
            shopEntry.timestamp = validTimestamp;
        }


        await shopRepo.save(shopEntry);

        res.status(200).json({message: 'Shop successfully installed'});
    } catch (error: any) {
        console.error('Installation process failed:', error);


        if (axios.isAxiosError(error)) {
            const axiosError = error.response?.data || error.message;
            res.status(500).json({error: 'Authentication failed', details: axiosError});
        } else {
            res.status(500).json({error: 'Installation process failed', details: error.message});
        }
    }
});