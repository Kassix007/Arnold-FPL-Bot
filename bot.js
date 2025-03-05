require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

const classicUrl = "https://fantasy.premierleague.com/api/leagues-classic/693683/standings/";
const h2hUrl = "https://fantasy.premierleague.com/api/leagues-h2h/693775/standings/";
client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === "#classic") 
    {
    await message.channel.send("Fetching standings...");

    try {
      const response = await axios.get(classicUrl);
      const standings = response.data.standings.results;

      if (!standings || standings.length === 0) {
        return message.channel.send("No standings available.");
      }

      let standingsMessage = "**🏆 Classic League Standings 🏆**\n";
      standings.slice(0, 10).forEach((team, index) => {
        standingsMessage += `\n**${index + 1}.** ${team.entry_name} - *${team.player_name}* - **${team.total} pts**`;
      });

      await message.channel.send(standingsMessage);
    } catch (error) {
      console.error("Error fetching standings:", error);
      await message.channel.send("❌ Failed to fetch standings. Try again later.");
    }
   
  }

  if (message.content.toLowerCase() === "#h2h") 
    {
        await message.channel.send("Fetching h2h standings...");

        try {
        const response = await axios.get(h2hUrl);
        const standings = response.data.standings.results;

        if (!standings || standings.length === 0) {
            return message.channel.send("No standings available.");
        }

        let table = "```ansi\n";
        table += " Rank | Team                      | Points  \n";
        table += "-------------------------------------------\n";

        standings.forEach((team, index) => {
            const rank = (index + 1).toString().padEnd(5);
            const name = team.entry_name.padEnd(25);
            const points = team.total.toString().padStart(7);

            // Highlight the last two rows in light red using ANSI escape codes
            if (index >= standings.length - 2) {
                table += `\u001b[41;97m ${rank} | ${name} | ${points} \u001b[0m\n`; // Light red background
            } else {
                table += ` ${rank} | ${name} | ${points} \n`;
            }
        });

        table += "```";

        message.channel.send(table);
        } catch (error) {
        console.error("Error fetching standings:", error);
        await message.channel.send("❌ Failed to fetch standings. Try again later.");
        }
    }
  if (message.content.toLowerCase() === "#help") {
    await message.channel.send(
      "Gives weekly league updates : Available commands:\n\n" +
        "`#classic` - Fetches the current standings of the classic league.\n" +
        "`#h2h` - Fetches the current standings of the head-to-head league.\n"
    );
  }

  if (message.content.startsWith('#exec ')) {
    const code = message.content.slice(6);

    try {
        let result = eval(code); 
        
        if (typeof result !== 'string') {
            result = JSON.stringify(result, null, 2);
        }

        message.channel.send(`\`\`\`js\n${result}\n\`\`\``);
    } catch (err) {
        message.channel.send(`\`\`\`js\nError: ${err.message}\n\`\`\``);
    }
}
});

client.login(process.env.TOKEN);
