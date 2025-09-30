# build stage
FROM node:18-bullseye AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build


# production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# optional: copy custom nginx conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]