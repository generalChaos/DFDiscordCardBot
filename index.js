const Discord = require('discord.js');
const FuzzySearch = require('fuzzy-search');
const _ = require('lodash');
const CardsData = require('./data/data.json');

const client = new Discord.Client();

const messageLengthMax = 50;
const messageLengthMin = 2;
const tagRegExpressions = [new RegExp("^!card (.+)"), new RegExp("\\[{2}(.+)\\]{2}")];
const token = 'MzExOTA3ODk2Mzk0Nzc2NTc4.C_YybQ.wfU2jpYGl96DkjQiEIFP2seg2p0';

function markdownItalics(text) {
  return `*${text}*`
}

function markdownBold(text) {
  return `__**${text}**__`;
}

function markdownMultiline(text) {
  return "```"+text+"```";
}

function markdownRarityIcon(rarity) {
  switch(rarity)
  {
    case 'Champion':
      return `<:champion:312628748455378946>`;
      break;
    case 'Epic':
      return `<:epic:312628748597854212>`;
      break;
    case 'Rare':
      return `<:rare:312628748774014976>`;
      break;
    case 'Common':
      return `<:common:312628748862095360>`;
      break;
    case 'Basic':
      return `<:basic:312628748707037185>`;
      break;
    default:
      return "";
      console.log(`${rarity} is not a rarity I can parse.`);
  }
}

function markdownFactionIcon(factionName) {
  switch(factionName)
  {
    case 'Delirium':
      return `<:Delirium:290891820953501696>`;
      break;
    case 'Eclipse':
      return `<:Eclipse:268660918295068673>`;
      break;
    case 'Essence':
      return `<:Essence:269558803014352896>:`;
      break;
    case 'Scales':
      return `<:Scales:268660926519967744>`;
      break;
    case 'Silence':
      return `<:Silence:268660933277122560>`;
      break;
    case 'Strife':
      return `<:Strife:268660941393100800>`;
      break;
    case 'Thorns':
      return `<:Thorns:268660949945286657>`;
      break;
    default:
      console.log("No such faction recognized:", factionName);
      return "";
      break;
  }
}


function markdownCard(card) {
  const { name, type, cost, faction, rarity, power, health, manaFragments, cardText } = card;
  const cardTitle = `${markdownFactionIcon(faction)} ${markdownBold(name)} (${faction} ${type}) ${markdownRarityIcon(rarity)}`;
  const cardPower = power !== 'N/A' ? `  ${parseInt(power)} <:attack:312628748560367627>  ` : "";
  const cardHealth = health !== 'N/A' ? `  ${parseInt(health)} <:health:312628748060983298>   ` : "";
  const cardFragments = type !== 'Spell' ? `  ${manaFragments} <:mana_frag:312628748098732034>  ` : "";
  const cardDetails = ` ${cardPower}${cardHealth}${cardFragments}`;

  return `\n${cardTitle}\n  ${cost} <:mana:312628748539265024>  ${power !== "N/A" || type !== "Spell" ? cardDetails : ""} ${markdownMultiline(cardText)}`;
}

function getTaggedCardName(text) {
  let cardName = null;
  _.forEach(tagRegExpressions, regexp => {
    const tagMatch = text.match(regexp);
    if(tagMatch && tagMatch.length) {
      console.log("Found match:", tagMatch);
      cardName = tagMatch[1]; // 2nd index is the placeholder text
    }
  });
  return cardName;
}

client.on('ready', () => {
  console.log(`I am ready with ${CardsData.length} cards on file!`);
});

client.on('message', message => {

  const matchedCardName = getTaggedCardName(message.content);
  // If the user input is too small (too many matches) or too big, search for match.
  if(matchedCardName && matchedCardName.length > 2){
    const searcher = new FuzzySearch(CardsData, ['name']);
    const result = searcher.search(matchedCardName, { sort: true });
    let resultNames = _.map(result, o => o.name);
    console.log(`\n\n\nHere are the matched result names for ${message}\n\n`, resultNames);

    if (result.length) {
      const bestMatch = result[0];
      const secondaryMatches = _.drop(resultNames);
      const cardSecondaryMatches = resultNames.length > 1 ? `*Did you mean one of these: ${secondaryMatches.join(', ')}* ?` : "";
      const cardReply = `${markdownCard(bestMatch)}${cardSecondaryMatches}`;
      message.reply(cardReply);
    }
    else {
      console.log("Could not find a card match for: ", message.content );
    }
  }
});

client.login(token);
