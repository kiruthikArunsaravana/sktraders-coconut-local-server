# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/110c22f8-74ed-40e4-9c38-16ebf8511783

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/110c22f8-74ed-40e4-9c38-16ebf8511783) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/110c22f8-74ed-40e4-9c38-16ebf8511783) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Backend (MySQL + Express) 🔧

This project now includes a simple Express server in `/server` that stores `coconut_inputs` and `labour_wages` in MySQL.

Quick start:

1. Run MySQL locally (Docker):

```sh
docker run --name husk-mysql -e MYSQL_ROOT_PASSWORD=pass -e MYSQL_DATABASE=husk -p 3306:3306 -d mysql:8.0
```

2. Initialize DB schema:

```sh
mysql -h 127.0.0.1 -u root -p husk < server/sql/init.sql
```

3. Configure and start server:

```sh
cp server/.env.example server/.env
# edit server/.env if needed
cd server
npm install
npm run dev
```

4. Start frontend (from repo root):

```sh
npm i
npm run dev
```

The frontend (`src/pages/InputManagement.tsx`) now calls the API on `http://localhost:4000`. If the server is unavailable, the app will fall back to storing data in `localStorage`.

### Run everything with Docker Compose

You can run MySQL and the server together with Docker Compose:

```sh
# build and start services (mysql and server)
docker compose up --build
```

- MySQL will be available on port 3306
- Server will be available on port 4000 and automatically connect to the MySQL container

You can stop the services with:

```sh
docker compose down
```

---
