/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Renren authentication strategy authenticates requests by delegating to
 * Renren using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Renren application's Client ID
 *   - `clientSecret`  your Renren application's Client Secret
 *   - `callbackURL`   URL to which Renren will redirect the user after granting authorization
 *   - `scope`         array of permission scopes to request.  valid scopes include:
 *                     'user', 'public_repo', 'repo', 'gist', or none.
 *                     (see http://wiki.dev.renren.com/wiki/Authentication for more info)
 *
 * Examples:
 *
 *     passport.use(new RenrenStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/renren/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://graph.renren.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://graph.renren.com/oauth/token';
  options.scopeSeparator = options.scopeSeparator || ',';
  options.customHeaders = options.customHeaders || {};

  if (!options.customHeaders['User-Agent']) {
    options.customHeaders['User-Agent'] = options.userAgent || 'passport-renren';
  }

  OAuth2Strategy.call(this, options, verify);
  this.name = 'renren';
  this._userProfileURL = options.userProfileURL || 'https://api.renren.com/v2/user/login/get';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from RenRen.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `renren`
 *   - `uid`              the user's Renren ID
 *   - `displayName`      the user's full name
 *
 * reference http://wiki.dev.renren.com/wiki/API
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
  this._oauth2.getProtectedResource(this._userProfileURL + '?access_token=' + accessToken, accessToken, function (err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {
      var json = JSON.parse(body);
      console.log(json);
      var profile = { provider: 'renren' };
      profile.id = json.response.id;
      profile.displayName = json.response.name;
      profile.picture = json.response.avatar;

      profile._raw = body;
      profile._json = json;
      done(null, profile);
    } catch(e) {
      done(e);
    }
  });
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
