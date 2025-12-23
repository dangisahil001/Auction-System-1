const authValidator = require('./authValidator');
const auctionValidator = require('./auctionValidator');
const bidValidator = require('./bidValidator');
const adminValidator = require('./adminValidator');

module.exports = {
  ...authValidator,
  ...auctionValidator,
  ...bidValidator,
  ...adminValidator,
};
