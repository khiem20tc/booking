const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { log } = require("../middlewares");
const { UserEntity } = require("../models");
const { upload } = require("../middlewares");
const {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword,
} = require("../utils");
const { checkAuth } = require("../middlewares");
const keccak256 = require("keccak256");

router.all("/", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

router.put("/setAvatar/:id", upload.single("csv"), async (req, res) => {
  try {
    const userUpdated = await UserEntity.updateOne(
      { _id: req.params.id },
      {
        $set: {
          avatar: req.file,
        },
      }
    );
    return res.status(200).send(req.file);
  } catch (err) {
    return res.send(400).json({ error: err });
  }
});

router.get("/", async (req, res) => {
  try {
    log("API get user");
    const user = await UserEntity.find();
    return res.status(200).json(user);
  } catch (err) {
    log("err", err);
    return res.status(400).json({ error: err });
  }
});

router.post("/signup", async (req, res) => {
  log("API user/signup", req.body.userName);
  try {
    if (!req.body.password)
      res.status(400).json({ error: "Please set your password" });
    const hashedPassword = await hashPassword(req.body.password);
    let address = keccak256(req.body.userName).toString("hex");

    const user = new UserEntity({
      userName: req.body.userName,
      password: hashedPassword,
      role: req.body.role,
      address: address,
    });
    const user_ = await UserEntity.findOne({ userName: req.body.userName });

    if (user_ == null) {
      log("signin sucessful", req.body.userName);
      const savedUser = await user.save();
      return res.status(200).json(savedUser);
    } else {
      log("signin fail", req.body.userName);
      return res.status(400).json({ msg: "Username is already exist" });
    }
  } catch (err) {
    log("err", err);
    return res.json({ error: err });
  }
});

router.post("/login", async (req, res) => {
  log("API user/login", req.body.userName);
  const user = await UserEntity.findOne({ userName: req.body.userName });
  console.log(user);
  if (user == null) {
    log("Username is incorrect", req.body.userName);
    return res.status(400).json({ message: "Username is not found" });
  }
  try {
    if (await comparePassword(req.body.password, user.password)) {
      const token = await generateToken(user);
      log("login sucessful", req.body.userName);
      return res
        .status(200)
        .json({ message: `Welcome ${user.userName}`, token: token });
    } else {
      log("Password is incorrect", req.body.password);
      return res.status(500).send("Password wrong !! Please try again");
    }
  } catch (err) {
    log("error", err);
    return res.status(400).json({ error: err });
  }
});

router.post("/checkrole", async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = await verifyToken(token);
    return res.status(200).json({ role: decode.role });
  } catch (err) {
    return res.status(400).json({ msg: err });
  }
});

router.get("/:id", async (req, res) => {
  try {
    log("API get user/:id", req.params.id);
    const user = await UserEntity.find({ _id: req.params.id });
    log("sucessful", user);
    return res.status(200).json(user);
  } catch (err) {
    log("failed", user);
    res.json({ error: err });
    return res.status(404);
  }
});

router.delete(
  "/:id",
  (req, res, next) => checkAuth(req, res, next, "manager"),
  async (req, res) => {
    try {
      log("API delete user/id");
      const userRemoved = await UserEntity.remove({ _id: req.params.id });
      return res.status(200).json({ msg: "deleted" });
    } catch (err) {
      log("err", err);
      return res.status(400).json({ error: err });
    }
  }
);

router.put("/:id", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const userUpdated = await UserEntity.updateOne(
      { _id: req.params.id },
      {
        $set: {
          password: hashedPassword,
        },
      }
    );
    return res.status(200).json({ message: "Password has changed" });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
});

router.put(
  "/setHistory/:address",
  (req, res, next) => checkAuth(req, res, next, "manager"),
  async (req, res) => {
    try {
      log("API setHistory user/id");
      const userUpdated = await UserEntity.updateOne(
        { address: req.params.address },
        {
          $push: {
            history: req.body.history,
          },
        }
      );
      return res.status(200).json({ message: "Set history successfully" });
    } catch (err) {
      log("err", err);
      return res.status(400).json({ error: err });
    }
  }
);

module.exports = router;
