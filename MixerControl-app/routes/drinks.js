var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var helper = require('../services/helper_service');



var recipes_mock = [ {
  "updatedAt" : "2017-01-23",
  "thumbnail" : "data:image/jpeg;base64,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",
  "rating" : {
    "min" : 1,
    "max" : 5,
    "count" : 4,
    "value" : 2.5
  },
  "description" : "Ein Kinderpunsch, wie man ihn vom Weihnachtsmarkt kennt",
  "id" : "0",
  "imageRef" : "",
  "title" : "Kinderpunsch",
  "authorId" : "0",
  "retailPrice" : {
    "amount" : 5,
    "currency" : "IUNO"
  },
  "updatedAt" : "2017-01-23"
},{
  "updatedAt" : "2017-01-22",
  "thumbnail" : "",
  "rating" : {
    "min" : 1,
    "max" : 5,
    "count" : 1,
    "value" : 5
  },
  "description" : "Der Klassiker von Douglas Adams",
  "id" : "1",
  "imageRef" : "",
  "title" : "Pangalaktischer Donnergurgler",
  "authorId" : "1",
  "retailPrice" : {
    "amount" : 8,
    "currency" : "IUNO"
  },
  "updatedAt" : "2017-01-22"
}
,{
  "updatedAt" : "2017-01-22",
  "thumbnail" : "",
  "rating" : {
    "min" : 1,
    "max" : 5,
    "count" : 1,
    "value" : 5
  },
  "description" : "Der Klassiker2 von Douglas Adams",
  "id" : "2",
  "imageRef" : "",
  "title" : "Pangalaktischer Donnergurgler",
  "authorId" : "1",
  "retailPrice" : {
    "amount" : 8,
    "currency" : "IUNO"
  },
  "updatedAt" : "2017-01-22"
}
,{
  "updatedAt" : "2017-01-22",
  "thumbnail" : "",
  "rating" : {
    "min" : 1,
    "max" : 5,
    "count" : 1,
    "value" : 5
  },
  "description" : "Der Klassiker3 von Douglas Adams",
  "id" : "3",
  "imageRef" : "",
  "title" : "Pangalaktischer Donnergurgler",
  "authorId" : "1",
  "retailPrice" : {
    "amount" : 8,
    "currency" : "IUNO"
  },
  "updatedAt" : "2017-01-22"
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

  res.json(recipes_mock);
});


router.get('/:id', function (req, res, next) {
    var recipeId = req.params['id'];
   res.json(recipes_mock[recipeId]);
});



module.exports = router;
