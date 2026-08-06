# Stage 1: Build React Vite frontend app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files and install packages
COPY package*.json ./
RUN npm ci || npm install

# Copy application source code and build production bundle
COPY . .
RUN npm run build

# Stage 2: Production container with Nginx
FROM nginx:alpine

# Copy built static files to default Nginx root directory
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
