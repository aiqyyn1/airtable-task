# Use the official Node.js 14 image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/index

# Copy the package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Expose the port the app uses
EXPOSE 8001

# Set environment variables
ENV NODE_ENV=production
ENV API_KEY=patPogE8NZNH7eMAa.4ffe3aa8ca17b0cac67a4ab670cdcbb52bca63796cf09f164308898d385dfc61
ENV BASE=appelfqn2Ph12hR0a

# Command to run your app
CMD ["node", "index.js"]
