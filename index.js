import fetch from "node-fetch";
import https from "https";
import dotenv from "dotenv";
dotenv.config();

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

const STAR_RAIL_ACCOUNT = {
  data: [
    {
      value: process.env.STAR_RAIL_ACCOUNT,
    },
  ],
};

const STAR_RAIL_CONSTANTS = {
  ACT_ID: "e202303301540311",
  successMessage: "You have successfully checked in today, Trailblazer~",
  signedMessage: "You've already checked in today, Trailblazer~",
  game: "Honkai: Star Rail",
  gameId: 6,
  assets: {
    author: "PomPom",
    game: "Honkai: Star Rail",
    iconLogo:
      "https://fastcdn.hoyoverse.com/static-resource-v2/2024/04/12/74330de1ee71ada37bbba7b72775c9d3_1883015313866544428.png",
  },
  url: {
    info: "https://sg-public-api.hoyolab.com/event/luna/os/info",
    home: "https://sg-public-api.hoyolab.com/event/luna/os/home",
    sign: "https://sg-public-api.hoyolab.com/event/luna/os/sign",
  },
};

class GameAccount {
  constructor(name, owner, value) {
    this.name = name;
    this.owner = owner;
    this.value = value;
  }

  get ltuid() {
    const match = this.value.match(/ltuid_v2=([^;]+)/);
    return match ? match[1] : null;
  }
}

class StarRailGame {
  constructor(constants, accounts) {
    this.constants = constants;
    this.accounts = accounts.map(
      (account) => new GameAccount(account.name, account.owner, account.value)
    );
    this.agent = new https.Agent({ rejectUnauthorized: false });
  }

  async fetchWithRetry(url, options, retries = 3) {
    options.agent = this.agent;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response");
        }

        return await response.json();
      } catch (error) {
        if (i === retries - 1) throw error;
      }
    }
  }

  async getSignInfo(account) {
    const url = `${this.constants.url.info}?act_id=${this.constants.ACT_ID}`;
    const options = {
      headers: { Cookie: account.value },
      agent: this.agent,
    };
    try {
      const body = await this.fetchWithRetry(url, options);
      return {
        success: true,
        data: {
          isSigned: body.data.is_sign,
        },
      };
    } catch (error) {
      return { success: false };
    }
  }

  async sign(account) {
    const url = this.constants.url.sign;
    const options = {
      method: "POST",
      headers: {
        Cookie: account.value,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ act_id: this.constants.ACT_ID }),
      agent: this.agent,
    };
    try {
      const body = await this.fetchWithRetry(url, options);
      return { success: body.retcode === 0 };
    } catch (error) {
      this.handleError("Error signing in", account, error);
      return { success: false };
    }
  }

  handleError(message, account, error = null) {
    const errorMessage = error ? `${message}: ${error}` : message;
    console.error(`${this.constants.game}: ${errorMessage}`);
  }

  async checkAndExecute() {
    const success = [];
    const failed = [];
    for (const account of this.accounts) {
      if (!account.ltuid) {
        this.handleError(`ltuid_v2 not found in cookie`, account);
        failed.push(account);
        continue;
      }

      try {
        const info = await this.getSignInfo(account);
        if (!info.success || info.data.isSigned) {
          console.info(`${this.constants.game}: Already checked in.`);
          continue;
        }

        const sign = await this.sign(account);
        if (!sign.success) {
          this.handleError(`Failed to sign in`, account);
          failed.push(account);
          continue;
        }

        console.info(`${this.constants.game}: Successfully checked in.`);
        success.push(account);
      } catch (error) {
        this.handleError(`Error during check-in process`, account, error);
        failed.push(account);
      }
    }
    return { success, failed };
  }
}

async function main() {
  const game = new StarRailGame(STAR_RAIL_CONSTANTS, STAR_RAIL_ACCOUNT.data);
  const result = await game.checkAndExecute();

  let messageContent = `Daily check-in summary for ${STAR_RAIL_CONSTANTS.game}:\n`;

  if (result.success.length > 0) {
    messageContent += `\nSuccessfully checked in accounts: ${result.success.map(account => account.name).join(", ")}`;
  } else {
    messageContent += `\nNo accounts were successfully checked in.`;
  }

  if (result.failed.length > 0) {
    messageContent += `\nFailed accounts: ${result.failed.map(account => account.name).join(", ")}`;
  }

  if (DISCORD_WEBHOOK) {
    const message = {
      content: messageContent,
    };
    try {
      await fetch(DISCORD_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(message),
      });
      console.info("Discord notification sent successfully");
    } catch (error) {
      console.error("Error sending Discord notification:", error);
    }
  }
}

main();