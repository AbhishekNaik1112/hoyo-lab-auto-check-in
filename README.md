# HoYo Lab Auto Check-In Bot

This is a Node.js-based automation bot designed to perform daily check-ins on the HoYoLab platform using cron jobs and GitHub Actions, specifically for _Honkai: Star Rail_. With this bot, you can automate daily check-ins and ensure you never miss your rewards.

## Features

- **Automated Daily Check-In**: Automatically performs daily check-ins to collect rewards.
- **Scheduled Execution**: Uses cron jobs and GitHub workflows to run the bot at a specified time.
  - _Honkai: Star Rail_ check-in at 1:30 am IST.
- **Environment Configuration**: Stores sensitive information, such as tokens, in an environment file for security.

## Requirements

- **Node.js**: Ensure Node.js is installed on your system.
- **GitHub Account**: To set up GitHub workflows for automated execution.
- **.env File**: Securely store your HoYoLab credentials in a `.env` file.

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone https://github.com/AbhishekNaik1112/hoyo-lab-auto-check-in.git
   cd hoyo-lab-auto-check-in
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   - Copy the example environment file:
     ```bash
     cp .env.example .env
     ```
   - In the `.env` file, add your HoYoLab credentials and any other necessary environment variables.

4. **Run the Bot Locally**

   ```bash
   node index.js
   ```

5. **Set Up Cron Jobs in GitHub Workflow**

   - The bot uses cron jobs to automate daily check-ins at specified times.
   - Open `.github/workflows/cron.yaml` and review the workflow file.
   - Adjust the cron schedule to match your desired check-in time, which is set to 1:30 am IST for _Honkai: Star Rail_.
   - Create a `.gitignore` file (if it isn’t already present) and update it to exclude files like `.env` and `node_modules`.
   - Push the code to your GitHub repository.

6. **Configure Secrets in GitHub**

   - Go to your repository on GitHub, navigate to **Settings** > **Secrets and Variables** > **Actions**.
   - Click on **New repository secret** and add the following secrets:
     - `DISCORD_WEBHOOK` with your webhook URL.
     - `STAR_RAIL_ACCOUNT` with your account token or credentials.

## Usage

After setup, the bot will automatically execute at the scheduled time, checking in for _Honkai: Star Rail_ and collecting rewards.

To run the bot locally, use:

```bash
node index.js
```

## .env File Example

Create a `.env` file in the root directory with the following content:

```
DISCORD_WEBHOOK=""
STAR_RAIL_ACCOUNT=""
```

This file stores your credentials securely for local use.

## Disclaimer

This project is not affiliated with HoYoverse. Use it responsibly and adhere to the platform's terms of service.
