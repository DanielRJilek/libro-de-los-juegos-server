const Laquet = require('./Laquet');
const CabeQuinal = require('./CabeQuinal');

const MODELS = {
  laquet: Laquet,
  cabequinal: CabeQuinal,
};

function getGameModel(gameInstance) {
  const GameClass = MODELS[gameInstance.title?.toLowerCase().replace(/-/g, '')];
  console.log(GameClass);
  if (!GameClass) throw new Error(`Unknown game: ${gameInstance.title}`);
  return new GameClass(gameInstance);
}

module.exports = { getGameModel };