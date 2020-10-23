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
    if (!order_) {
    const savedOrder = await order.save();
    return res.status(200).json(savedOrder);
    }
    } catch(err) {
    return res.status(400).json({msg: err});
}
})

router.get('/', async(req,res) => {
  try {
      const order = await OrderEntity.find();
      res.status(200).json(order);
  } catch(err) {
      res.status(400).json({msg: err});
  }
})

router.put('/:ID/setstate', (req, res, next) => checkAuth(req, res, next, 'shipper'), async(req,res) => {
  try {
    const order = await OrderEntity.updateOne(
        {ID: req.params.ID}, 
        {$set: { 
            State: req.body.State
          }}
        );
    res.status(200).json(req.body.State);
} catch(err) {
    res.status(400).json({msg: err});
}
})

router.put('/:ID/cancel', (req, res, next) => checkAuth(req, res, next, 'customer'), async(req,res) => {
  try {
    const order = await OrderEntity.updateOne(
        {ID: req.params.ID}, 
        {$set: { 
            State: "Cancel"
          }}
        );
    res.status(200).send({massage: "Cancel sucessfully"});
} catch(err) {
    res.status(400).json({msg: err});
}
})

router.put('/:ID/report', async(req, res) => {
  try {
    const order = await OrderEntity.updateOne(
        {ID: req.params.ID}, 
        {$set: { 
            Report: req.body.Report
          }}
        );
    res.status(200).json(req.body.Report);
} catch(err) {
    res.status(400).json({msg: err});
}
})

module.exports = router;