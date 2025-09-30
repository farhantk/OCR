FROM node:18-bullseye

# install system deps: tesseract & poppler with language packs
RUN apt-get update && apt-get install -y --no-install-recommends \
tesseract-ocr \
tesseract-ocr-eng \
tesseract-ocr-ind \
poppler-utils \
&& rm -rf /var/lib/apt/lists/*


WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .


EXPOSE 3000
CMD ["node", "server.js"]