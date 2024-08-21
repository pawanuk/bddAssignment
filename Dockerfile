# Use an official Node.js image as the base image
FROM mcr.microsoft.com/playwright:focal

# Set environment variables
ENV DOCKER_ENV=true

# Install xvfb to simulate a display server
RUN apt-get update && apt-get install -y xvfb

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code to the container
COPY . .

# Install Playwright dependencies
RUN npx playwright install-deps

# Install the necessary Playwright browsers
RUN npx playwright install

# Define the command to run your tests with xvfb-run
CMD ["xvfb-run", "-a", "npm", "run", "test"]
