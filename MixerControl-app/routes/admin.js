/**
 * Created by goergch on 23.01.17.
 */
var express = require('express');
var router = express.Router();
var logger = require('../global/logger');
var production_queue = require('../models/production_queue');


router.post('/production/startConfirm', function (req, res, next) {
  production_queue.startConfirmed();
  res.sendStatus(200);
});

router.post('/production/pause', function (req, res, next){
    production_queue.pauseProduction();
    res.sendStatus(200);

});
router.post('/production/resume', function (req, res, next){
    production_queue.resumeProduction();
    res.sendStatus(200);

});


module.exports = router;
