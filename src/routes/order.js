const express = require("express");
const router = express.Router();
const { OrderEntity } = require("../models");
const { checkAuth } = require("../middlewares");
const { verifyToken } = require("../utils");
const { UserEntity } = require("../models/User");
const { log } = require("../middlewares");
const Order = require("../models/Order");

router.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

router.post(
  "/create",
  (req, res, next) => checkAuth(req, res, next, "customer"),
  async (req, res) => {
    try {
      log("API order/create");
      const orderProcessing = await OrderEntity.find({
        $or: [
          { State: "Created" },
          { State: "Im coming" },
          { State: "Im going" },
        ],
      });
      console.log(orderProcessing);
      const array = [];
      orderProcessing.forEach(async (element) => {
        await array.push(element.Shipper);
      });
      console.log(array);

      const freeShipperList = await UserEntity.find({
        $and: [{ role: "shipper" }, { address: { $nin: array } }],
      });

      if (!freeShipperList[0])
        return res.status(400).send("Shipper is not available");

      console.log(freeShipperList);

      console.log(freeShipperList[0].address);

      var time = new Date();
      let ID = time.getTime();
      const order = await new OrderEntity({
        ID: ID,
        Customer: req.user.address,
        Shipper: freeShipperList[0].address,
        Value: req.body.Value,
        State: "Created",
        ReportByCustomer: "",
        ReportByShipper: "",
      });
      const order_ = await OrderEntity.findOne({ ID: ID });
      if (!order_) {
        const savedOrder = await order.save();
        log("API order/create sucessful", JSON.stringify(savedOrder));
        return res.status(200).json(savedOrder);
      }
    } catch (err) {
      console.log(err);
      log("err", err);
      return res.status(400).send("Failed");
    }
  }
);

router.get("/", async (req, res) => {
  try {
    log("API get order");
    const order = await OrderEntity.find();
    return res.status(200).json(order);
  } catch (err) {
    log("err", err);
    return res.status(400).json({ msg: err });
  }
});

router.get("/requestIDbyShipper", async (req, res) => {
  try {
    log("API get order/requestIDbyShipper");
    const token = req.headers.authorization.split(" ")[1];
    const decode = await verifyToken(token);
    const order = await OrderEntity.findOne({
      $and: [
        { Shipper: decode.address },
        {
          $or: [
            { State: "Created" },
            { State: "Im coming" },
            { State: "Im going" },
          ],
        },
      ],
    });
    return res.status(200).json(order.ID);
  } catch (err) {
    log("err", err);
    return res.status(400).json({ msg: err });
  }
});

router.get("/requestIDbyCustomer", async (req, res) => {
  try {
    log("API get order/requestIDbyCustomer");
    const token = req.headers.authorization.split(" ")[1];
    const decode = await verifyToken(token);
    const order = await OrderEntity.find({
      $and: [
        { Customer: decode.address },
        { State: { $nin: ["I deliveried", "Cancel"] } },
      ],
    });
    return res.status(200).json(order);
  } catch (err) {
    log("err", err);
    return res.status(400).json({ msg: err });
  }
});

router.get("/orderListByUser", async (req, res) => {
  try {
    log("API get order/orderListByUser");
    const token = req.headers.authorization.split(" ")[1];
    const decode = await verifyToken(token);
    console.log(decode);
    let order;
    if (decode.role == "customer") {
      order = await OrderEntity.find({ Customer: `${decode.address}` });
    } else if (decode.role == "shipper") {
      order = await OrderEntity.find({ Shipper: `${decode.address}` });
    }
    return res.status(200).json(order);
  } catch (err) {
    log("err", err);
    return res.status(400).json({ msg: err });
  }
});

router.get("/:ID", async (req, res) => {
  try {
    log("API get order/:ID");
    const order = await OrderEntity.findOne({ ID: req.params.ID });
    return res.status(200).json(order);
  } catch (err) {
    log("err", err);
    return res.status(400).json({ msg: err });
  }
});

router.put(
  "/:ID/setstate",
  (req, res, next) => checkAuth(req, res, next, "shipper"),
  async (req, res) => {
    try {
      log("API put order/:ID/setstate");
      const order_ = await OrderEntity.findOne({ ID: req.params.ID });
      if (req.user.address == order_.Shipper) {
        const order = await OrderEntity.updateOne(
          { ID: req.params.ID },
          {
            $set: {
              State: req.body.State,
            },
          }
        );
        return res.status(200).json(req.body.State);
      } else {
        return res.status(400).send("User is invalid");
      }
    } catch (err) {
      log("err", err);
      return res.status(400).json({ msg: err });
    }
  }
);

router.put(
  "/:ID/cancel",
  (req, res, next) => checkAuth(req, res, next, "customer"),
  async (req, res) => {
    try {
      log("API put order/:ID/cancel");
      const order_ = await OrderEntity.findOne({ ID: req.params.ID });
      if (req.user.address == order_.Customer) {
        const order = await OrderEntity.updateOne(
          { ID: req.params.ID },
          {
            $set: {
              State: "Cancel",
            },
          }
        );
        return res.status(200).send("Cancel sucessfully");
      } else {
        return res.status(400).send("User is invalid");
      }
    } catch (err) {
      log("err", err);
      return res.status(400).json({ msg: err });
    }
  }
);

router.put("/:ID/report", async (req, res) => {
  try {
    log("API put order/:ID/report");
    const token = req.headers.authorization.split(" ")[1];
    const decode = await verifyToken(token);
    const order_ = await OrderEntity.findOne({ ID: req.params.ID });
    if (decode.address == order_.Customer) {
      const order = await OrderEntity.updateOne(
        { ID: req.params.ID },
        {
          $set: {
            ReportByCustomer: req.body.Report,
          },
        }
      );
      return res.status(200).json(req.body.Report);
    } else if (decode.address == order_.Shipper) {
      const order = await OrderEntity.updateOne(
        { ID: req.params.ID },
        {
          $set: {
            ReportByShipper: req.body.Report,
          },
        }
      );
      return res.status(200).json(req.body.Report);
    } else {
      return res.status(400).send("User is invalid");
    }
  } catch (err) {
    log("err", err);
    return res.status(400).json({ msg: err });
  }
});

module.exports = router;
