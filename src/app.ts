import 'reflect-metadata';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {DataSource} from 'typeorm';
import path from 'path';

import {installRoute} from './routes/install';
import appFrontendRoute from './routes/app-frontend';


const app = express();
app.use(bodyParser.json());
app.use(cors());


const AppDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'shop_data',
    entities: [path.join(__dirname, '/entities/*.{ts,js}')],
    synchronize: true,
});

export {AppDataSource};


const initializeDataSource = async (retries = 5, delay = 5000) => {
    while (retries) {
        try {
            await AppDataSource.initialize();
            console.log('Data Source has been initialized!');
            break;
        } catch (err: any) {
            console.error(`Error during Data Source initialization: ${err.message}`);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            if (retries === 0) {
                console.error('Could not connect to the database. Exiting...');
                process.exit(1);
            }
            await new Promise((res) => setTimeout(res, delay));
        }
    }
};


initializeDataSource().then(() => {

    app.use('/installation-process', installRoute);
    app.use('/app-frontend', appFrontendRoute);


    app.listen(3000, () => {
        console.log('Server running on port 3000');
    });
});