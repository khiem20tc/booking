const express = require('express');
const router = express.Router();
const { OrderEntity } = require('../models');
const { checkAuth } = require('../middlewares');

router.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

router.post('/create', (req, res, next) => checkAuth(req, res, next, 'customer'), async(req,res) => {
    try{
      const order = new OrderEntity({
      ID: req.body.ID,
      Customer: req.body.Customer,
      Shipper: req.body.Shipper,
      Value: req.body.Value,
      State: req.body.State
    });
    const order_ = await OrderEntity.findOne({ID: req.body.ID});
    if (order_ == null) {
    const savedOrder = await order.save();
    res.status(200).json(savedOrder);
    }
    } catch(err) {
    res.json({msg: err});
}
})

router.get('/:ID', async(req,res) => {
  try {
      const order = await OrderEntity.find({ID: req.params.ID});
      res.status(200).json(order);
  } catch(err) {
      res.json({msg: err});
      res.status(404);
  }
})

router.put('/:ID', (req, res, next) => checkAuth(req, res, next, 'shipper'), async(req,res) => {
  try {
    const order = await OrderEntity.updateOne(
        {_id: req.params.ID}, 
        {$set: { 
            State: req.body.State
          }}
        );
    res.status(200).json(req.body.State);
} catch(err) {
    res.json({msg: err});
}
})

router.put('/:ID', (req, res, next) => checkAuth(req, res, next, 'customer'), async(req,res) => {
  try {
    const order = await OrderEntity.updateOne(
        {_id: req.params.ID}, 
        {$set: { 
            State: 'Cancel'
          }}
        );
    res.status(200).json(req.body.State);
} catch(err) {
    res.json({msg: err});
}
})

router.put('/:ID', async(req, res) => {
  try {
    const order = await OrderEntity.updateOne(
        {_id: req.params.ID}, 
        {$set: { 
            Report: req.body.Report
          }}
        );
    res.status(200).json(req.body.Report);
} catch(err) {
    res.json({msg: err});
}
})

module.exports = router;