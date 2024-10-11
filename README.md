
# Shoper Example plugin

> This project is a **Node.js** application that integrates with **MySQL** to manage shop installations and retrieve shop data.



## Installation

To get the project up and running:

1. **Clone the repository**:

   ```bash
   git clone https://github.com/krystianslowik/example-shoper-plugin-node-js.git
   cd example-shoper-plugin-node-js
   ```

2. **Install deps & navigate to the `docker` directory**:

   ```bash
   npm i
   cd docker
   ```

3. **Build and start the containers**:

   ```bash
   docker-compose -f docker-compose-database.yml up --build
   ```

4. The application will be available at [http://localhost:3000](http://localhost:3000).

> Note: Use proxy or make sure you're sharing IP publicly, if you want to assign it to APP URL in Shoper

5. Build & deploy an app 

   ```bash
   npm run build
   cd dist/
   ```
   
> when deploying remember to set up environment (database credentials)


## Configuration

The app uses environment variables to configure the database, defined in `docker-compose.yml`:

- **DB_HOST**: Hostname of the MySQL service (`db`).
- **DB_PORT**: MySQL port (`3306`).
- **DB_USER**: MySQL user (`root`).
- **DB_PASSWORD**: MySQL password (`password`).
- **DB_NAME**: MySQL database name (`shop_data`).

## API Endpoints

### POST `/installation-process`

- **URL**: `http://localhost:3000/installation-process`
- **Method**: POST
- **Description**: Handles app installation request, authenticates to shop via Shoper Auth API & stores credentials in DB.

How installation request payload looks like?
```json
{
    "action": "install",
    "application_code": "[REDACTED]",
    "auth_code": "14021ada7278b3d406d390839e91ac69",
    "shop": "[REDACTED]",
    "shop_url": "https://devshop-395063.shoparena.pl"
}
```

### GET `/app-frontend`

- **URL**: `http://localhost:3000/app-frontend`
- **Method**: GET
- **Description**: Fetches shop data by `shop_id`, which is included as the GET param, when app is opened in that Shop backend.

## Testing with cURL

### POST `/installation-process`

```bash
curl -X POST http://localhost:3000/installation-process -H "Content-Type: application/json" -d '{
    "action": "install",
    "application_code": "[REDACTED]",
    "auth_code": "14021ada7278b3d406d390839e91ac69",
    "shop": "[REDACTED]",
    "shop_url": "https://devshop-395063.shoparena.pl"
}'
```

### GET `/app-frontend`

```bash
curl "http://localhost:3000/app-frontend?shop=[REDACTED]"
```
