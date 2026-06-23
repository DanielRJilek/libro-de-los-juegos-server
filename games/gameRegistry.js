const Laquet = require('./laquet/Laquet');

const MODELS = {
  laquet: Laquet,
};

function getGameModel(gameInstance) {
  const GameClass = MODELS[gameInstance.title?.toLowerCase()];
  if (!GameClass) throw new Error(`Unknown game: ${gameInstance.title}`);
  return new GameClass(gameInstance);
}

module.exports = { getGameModel };