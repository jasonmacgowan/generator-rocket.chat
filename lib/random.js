/* eslint-disable */
// Shamelessly stolen and trimmed from https://github.com/meteor/meteor/blob/devel/packages/random/random.js

// We use cryptographically strong PRNGs (crypto.getRandomBytes() on the server,
// window.crypto.getRandomValues() in the browser) when available. If these
// PRNGs fail, we fall back to the Alea PRNG, which is not cryptographically
// strong, and we seed it with various sources such as the date, Math.random,
// and window size on the client.  When using crypto.getRandomValues(), our
// primitive is hexString(), from which we construct fraction(). When using
// window.crypto.getRandomValues() or alea, the primitive is fraction and we use
// that to construct hex string.

const nodeCrypto = require('crypto');

var UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';
var BASE64_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789-_';

var RandomGenerator = function() {};

/**
 * @name Random.fraction
 * @summary Return a number between 0 and 1, like `Math.random`.
 * @locus Anywhere
 */
RandomGenerator.prototype.fraction = function() {
  var self = this;
  var numerator = parseInt(self.hexString(8), 16);
  return numerator * 2.3283064365386963e-10; // 2^-32
};

/**
 * @name Random.hexString
 * @summary Return a random string of `n` hexadecimal digits.
 * @locus Anywhere
 * @param {Number} n Length of the string
 */
RandomGenerator.prototype.hexString = function(digits) {
  var self = this;
  var numBytes = Math.ceil(digits / 2);
  var bytes;
  // Try to get cryptographically strong randomness. Fall back to
  // non-cryptographically strong if not available.
  try {
    bytes = nodeCrypto.randomBytes(numBytes);
  } catch (e) {
    // XXX should re-throw any error except insufficient entropy
    bytes = nodeCrypto.pseudoRandomBytes(numBytes);
  }
  var result = bytes.toString('hex');
  // If the number of digits is odd, we'll have generated an extra 4 bits
  // of randomness, so we need to trim the last digit.
  return result.substring(0, digits);
};

RandomGenerator.prototype._randomString = function(charsCount, alphabet) {
  var self = this;
  var digits = [];
  for (var i = 0; i < charsCount; i++) {
    digits[i] = self.choice(alphabet);
  }
  return digits.join('');
};

/**
 * @name Random.id
 * @summary Return a unique identifier, such as `"Jjwjg6gouWLXhMGKW"`, that is
 * likely to be unique in the whole world.
 * @locus Anywhere
 * @param {Number} [n] Optional length of the identifier in characters
 *   (defaults to 17)
 */
RandomGenerator.prototype.id = function(charsCount) {
  var self = this;
  // 17 characters is around 96 bits of entropy, which is the amount of
  // state in the Alea PRNG.
  if (charsCount === undefined) charsCount = 17;

  return self._randomString(charsCount, UNMISTAKABLE_CHARS);
};

/**
 * @name Random.secret
 * @summary Return a random string of printable characters with 6 bits of
 * entropy per character. Use `Random.secret` for security-critical secrets
 * that are intended for machine, rather than human, consumption.
 * @locus Anywhere
 * @param {Number} [n] Optional length of the secret string (defaults to 43
 *   characters, or 256 bits of entropy)
 */
RandomGenerator.prototype.secret = function(charsCount) {
  var self = this;
  // Default to 256 bits of entropy, or 43 characters at 6 bits per
  // character.
  if (charsCount === undefined) charsCount = 43;
  return self._randomString(charsCount, BASE64_CHARS);
};

/**
 * @name Random.choice
 * @summary Return a random element of the given array or string.
 * @locus Anywhere
 * @param {Array|String} arrayOrString Array or string to choose from
 */
RandomGenerator.prototype.choice = function(arrayOrString) {
  var index = Math.floor(this.fraction() * arrayOrString.length);
  if (typeof arrayOrString === 'string') return arrayOrString.substr(index, 1);
  else return arrayOrString[index];
};

var Random = new RandomGenerator();

// Create a non-cryptographically secure PRNG with a given seed (using
// the Alea algorithm)
Random.createWithSeeds = function(...seeds) {
  if (seeds.length === 0) {
    throw new Error('No seeds were provided');
  }
  return new RandomGenerator(RandomGenerator.Type.ALEA, {
    seeds: seeds,
  });
};

module.exports = Random;
