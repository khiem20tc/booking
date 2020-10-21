const express = require('express');
const router = express.Router();
const { startApp } = require('../blockchain');

router.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

router.post('/', (address, number, next) => startApp(), async(req,res) => {
    try{

    }
    catch(err){

    }
})

module.exports = router;