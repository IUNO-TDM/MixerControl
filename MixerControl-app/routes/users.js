var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');



var users_mock = [ {
  "firstname" : "Rudi",
  "thumbnail" : "",
  "id" : "0",
  "imageRef" : "",
  "email" : "rudi@ruesselschwein.de",
  "lastname" : "Ruesselschwein"
},{
  "firstname" : "Douglas",
  "thumbnail" : "",
  "id" : "",
  "imageRef" : "",
  "email" : "douglas@adams.com",
  "lastname" : "Adams"
}
];


/**
 * Functions
 */

String.prototype.format = function () {
  var args = [].slice.call(arguments);
  return this.replace(/(\{\d+\})/g, function (a) {
    return args[+(a.substr(1, a.length - 2)) || 0];
  });
};

router.get('/', function (req, res, next) {

  res.json(users_mock);
});


router.get('/:id', function (req, res, next) {
  var userId = req.params['id'];
  res.json(users_mock[userId]);
});



module.exports = router;
