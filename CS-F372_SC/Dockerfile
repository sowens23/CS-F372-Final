# Make sure all files have proper permissions: sudo chmod -R 755 *
# Then build the image: docker build -t cs-docker .
# Then run the container: docker run cs-docker:latest

# Use Node image (version up to you)
FROM node:18-alpine

# Create a working directory inside the container
WORKDIR /app

# Copy only package.json/package-lock.json first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the server
CMD ["node", "server.js"]