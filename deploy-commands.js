const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Load environment variables (make sure you have a .env file with your token and client ID)
require('dotenv').config();

const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error('Missing DISCORD_TOKEN or CLIENT_ID in environment variables.');
  process.exit(1);
}

// Collect all commands
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Read command files and push the "data" property into the commands array
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

// Create a REST instance
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(`Started refreshing ${commands.length} application (/) commands.`);

    // Delete all existing global commands
    // await rest.put(Routes.applicationCommands(CLIENT_ID), { body: [] });

    // delete all commands on the 794276731132313601 guild
     await rest.put(Routes.applicationGuildCommands(CLIENT_ID, '1330682931462541354'), { body: [] });

    console.log(`Successfully deleted existing global commands.`);

    // Wait a few seconds to ensure the commands are deleted before deploying new ones
    setTimeout(async () => {
      // Deploy new global commands
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, "1330682931462541354"), { body: commands }); 

      console.log(`Successfully reloaded ${commands.length} global application (/) commands.`);
    }, 3000); // Wait 3 seconds before pushing new commands (adjust as needed)

  } catch (error) {
    console.error(error);
  }
})();
