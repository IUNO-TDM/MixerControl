/**
 * Created by beuttlerma on 27.03.17.
 */

module.exports = function Cache(seconds) {
    return function (req, res, next) {
        res.set("Cache-Control", "public, max-age=" + seconds);
        next();
    }
};