const fetch = require('node-fetch').default; // Correctly import the fetch function
const { Dex } = require('@pkmn/dex');
const { Generations } = require('@pkmn/data');
const { Smogon } = require('@pkmn/smogon');
const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');

// Create instances of Generations and Smogon
const gens = new Generations(Dex);
const smogon = new Smogon(fetch);

let pokemonData;
let sprite;

async function getPokemonStats(interaction) {
  try {
    // Await the stats result
    const sets = await smogon.sets(gens.get(9), `${interaction.options.getString('pokemon')}`); // Fetch stats
    pokemonData = sets[0];
    console.log(sets); // Log the resolved value
  } catch (error) {
    console.error('Error fetching stats:', error); // Log any errors
  }
}

async function getPokemonImage(name) {
  console.log(name);
  try {
    // Fetch data from the PokeAPI
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!response.ok) {
      throw new Error('Pokemon not found');
    }
    const data = await response.json();

    // Get the sprite URL
    const spriteUrl = data.sprites.front_default; // front_default is the standard sprite

    sprite = spriteUrl;
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  data: new SlashCommandBuilder()
.setName('search')
.setDescription('Searches Pokemon')
.addStringOption(option => 
  option
    .setName('pokemon')
    .setDescription('Search for your Pokemon.')
    .setRequired(true)
),
  async execute(interaction) {
    try{
//       const sent = await interaction.reply({content: 'Pinging...', fetchReply: true});
      await interaction.reply('Pokemon Searching...');
      await getPokemonStats(interaction);

      await getPokemonImage(pokemonData.species.toLowerCase())


      const pokemonEmbed = new EmbedBuilder()
        .setColor("Blue")
        .setTitle(pokemonData.name + ' | ' + pokemonData.species)
        .setThumbnail(sprite)
        .addFields(
          {name: "Item", value: pokemonData.item},
          {name: "Nature", value: pokemonData.nature},
          {name: "Ability", value: pokemonData?.ability || "N/A"},
          {name: "Moves",  value: pokemonData.moves[0], inline: true},
          {name: "\u200B",  value: pokemonData.moves[1], inline: true},
          {name: "\u200B",  value: pokemonData.moves[2], inline: true},
          {name: " ",  value: pokemonData.moves[3], inline: true},
          {name: " ", value: " "},
         // {name: "EVs", value: `${pokemonData.evs?.hp || " "}`, inline: true},
        //  // {name: "\u200B", value: `${pokemonData.evs?.atk || " "}`, inline: true},
        //  // {name: "\u200B", value: `${pokemonData.evs?.def || " "}`, inline: true},
        //   {name: "\u200B", value: `${pokemonData.evs?.spa || " "}`, inline: true},
        //   {name: "\u200B", value: `${pokemonData.evs?.spd || " "}`, inline: true},
        //   {name: "\u200B", value: `${pokemonData.evs?.spe || " "}`, inline: true}
         )

        // Assuming pokemonEmbed is already defined
        for (let [key, value] of Object.entries(pokemonData.evs)) {
        // Only add fields for non-null, non-undefined values
        if (value !== undefined && value !== null) {
          pokemonEmbed.addFields({
            name: key, // Dynamic field name (e.g., 'hp', 'atk', etc.)
            value: value.toString(), // Dynamic field value
            inline: true  // Make fields inline
          });
        }
        
          
        }


        await interaction.editReply({content: '', components: [], embeds: [pokemonEmbed]});
  } catch (error) {
    console.error(error)
    await interaction.editReply({content: 'Pokemon not found.'})
  }
}
}