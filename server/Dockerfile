FROM node:20
WORKDIR /usr/src/app

# Install dependencies (including dev deps for dev script)
COPY package.json package-lock.json* ./
RUN npm install --include=dev

# Copy code
COPY . .

EXPOSE 4000

CMD ["npm", "run", "dev"]
