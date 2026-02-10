# Server (Express + MySQL)

This server provides simple API endpoints to store `coconut_inputs` and `labour_wages` in a local MySQL database.

Quick steps to run locally:

1. Start MySQL (Docker recommended):

```sh
# runs MySQL on port 3306 with a database/test user
docker run --name husk-mysql -e MYSQL_ROOT_PASSWORD=pass -e MYSQL_DATABASE=husk -p 3306:3306 -d mysql:8.0
```

2. Initialize tables (one-time):

```sh
# after MySQL is running, run the SQL in server/sql/init.sql
# you can use the mysql client or any DB GUI
mysql -h 127.0.0.1 -u root -p husk < server/sql/init.sql
```

3. Configure env

```sh
cp server/.env.example server/.env
# edit server/.env if you used different DB credentials
```

4. Install & run server

```sh
cd server
npm install
npm run dev
```

The server listens on the port set in `server/.env` (default: 4000). The frontend (Vite) runs on `http://localhost:5173` and will call the server endpoints.

Endpoints:
- GET /api/coconut
- POST /api/coconut
- DELETE /api/coconut/:id
- GET /api/labour
- POST /api/labour
- DELETE /api/labour/:id

Notes:
- The frontend has been updated to POST/GET/DELETE to these endpoints and will fall back to localStorage if the server is unreachable.
- For production consider adding proper authentication, migrations, and secure DB credentials.
