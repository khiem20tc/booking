const express = require('express');
const router = express.Router();
const { OrderEntity } = require('../models');
const { checkAuth } = require('../middlewares');
const { verifyToken } = require('../utils');
const { UserEntity } = require('../models/User');

router.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });   

router.post('/create', (req, res, next) => checkAuth(req, res, next, 'customer'), async(req,res) => {
    try{
      const orderProcessing = await OrderEntity.find({$or:[{State: "Created"},{State: "Im coming"},{State: "Im going"}]});
      //console.log(orderProcessing);
      const array = [];
      orderProcessing.forEach(async element => {await array.push(element.Shipper)});
      //console.log(array);

      const freeShipperList = await UserEntity.find({$and:[{role: "shipper"},{address:{$nin: array }}]});
      //console.log(freeShipperList);
      freeShipperList.forEach(async element => {await array.push(element.Shipper)});

      var time = new Date();
      let ID = time.getTime();
      const order = new OrderEntity({
      ID: ID,
      Customer: req.user.address,
      Shipper: array[0],
      Value: req.body.Value,
      State: "Created"
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
      return res.status(200).json(order);
  } catch(err) {
      return res.status(400).json({msg: err});
  }
})

router.get('/:ID', async(req,res) => {
  try {
      const order = await OrderEntity.findOne({ID: req.params.ID});
      return res.status(200).json(order);
  } catch(err) {
      return res.status(400).json({msg: err});
  }
})

router.put('/:ID/setstate', (req, res, next) => checkAuth(req, res, next, 'shipper'), async(req,res) => {
  try {
    const order_ = await OrderEntity.findOne({ID: req.params.ID})
    if (req.user.address == order_.Shipper) {
    const order = await OrderEntity.updateOne(
        {ID: req.params.ID}, 
        {$set: { 
            State: req.body.State
          }}
        );
    return res.status(200).json(req.body.State);
    }
    else {
      return res.status(400).json({msg: 'User is invalid'})
    }
} catch(err) {
    return res.status(400).json({msg: err});
}
})

router.put('/:ID/cancel', (req, res, next) => checkAuth(req, res, next, 'customer'), async(req,res) => {
  try {
    const order_ = await OrderEntity.findOne({ID: req.params.ID})
    if (req.user.address == order_.Customer) {
    const order = await OrderEntity.updateOne(
        {ID: req.params.ID}, 
        {$set: { 
            State: "Cancel"
          }}
        );
    return res.status(200).send({massage: "Cancel sucessfully"});
    }
    else {
      return res.status(400).json({msg: 'User is invalid'})
    }
} catch(err) {
    return res.status(400).json({msg: err});
}
})

router.put('/:ID/report', async(req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decode = await verifyToken(token);
    const order_ = await OrderEntity.findOne({ID: req.params.ID})
    if (decode.address == order_.Customer) {
    const order = await OrderEntity.updateOne(
        {ID: req.params.ID}, 
        {$set: { 
            ReportByCustomer: req.body.Report
          }}
        );
    return res.status(200).json(req.body.Report);
    }
    else if (decode.address == order_.Shipper) {
      const order = await OrderEntity.updateOne(
          {ID: req.params.ID}, 
          {$set: { 
              ReportByShipper: req.body.Report
            }}
          );
      return res.status(200).json(req.body.Report);
      }
    else {
      return res.status(400).json({msg: 'User is invalid'})
    }
} catch(err) {
    return res.status(400).json({msg: err});
}
})

module.exports = router;