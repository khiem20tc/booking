const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { UserEntity } = require('../models');
const { upload } = require('../middlewares');
const { generateToken, verifyToken, hashPassword, comparePassword } = require('../utils')

router.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });

router.put('/setAvatar/:id', upload.single('csv'), async(req,res) => {
    try {
        const userUpdated = await UserEntity.updateOne(
            {_id: req.params.id}, 
            {$set: { 
                avatar: req.file
                }}
            );
        res.status(200).send(req.file);
    }catch(err) {
        res.send(400).json({error: err});;
    }
})

router.get('/', async(req,res)=>{
    try {
        const user = await UserEntity.find();
        res.status(200).json(user);
    } catch(err) {
        res.status(400).json({error: err});
    }
})

router.post('/signin', async(req,res)=>{
    try {
        if(!req.body.password) res.status(400).json({error: 'Please set your password'});
        const hashedPassword = await hashPassword(req.body.password)
        const user = new UserEntity({
            userName: req.body.userName,
            password: hashedPassword,
            role: req.body.role
        });
        const user_ = await UserEntity.findOne({userName: req.body.userName});
        if (user_ == null) {
        const savedUser = await user.save();
        res.status(200).json(savedUser);
        }
        else res.status(400).send('User is already exist');
    } catch(err) {
        res.json({error: err});
    }
})

router.post('/login', async(req,res)=>{
    const user = await UserEntity.findOne({userName: req.body.userName});
    console.log(user);
    if(user == null){
        return res.status(400).send('User is not found');
    }
    try {
        if (await comparePassword(req.body.password, user.password)){
            res.status(200).send(`Welcome ${user.userName}`)
            const token = await generateToken(user);
            console.log(token);
        }
        else {
            res.status(500).send("Password wrong !! Please try again")
        }
    } catch(err) {
        res.status(400).json({error: err});
    }
})

router.get('/:id', async(req,res)=>{
    try {
        const user = await UserEntity.find({_id: req.params.id});
        res.status(200).json(user);
    } catch(err) {
        res.json({error: err});
        res.status(404);
    }
})

router.delete('/:id', (req, res, next) => checkAuth(req, res, next, 'manager'), async(req,res) => {
    try {
        const userRemoved = await UserEntity.remove({_id: req.params.id});
        res.status(200).json({error: 'deleted'});
    } catch(err) {
        res.status(400).json({error: err});
    }
})

router.put('/:id', async(req,res)=>{
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const userUpdated = await UserEntity.updateOne(
            {_id: req.params.id}, 
            {$set: { 
                password: hashedPassword,
                role: req.body.role
                }
                }
            );
        res.status(200).json({message: 'Updated'});
    } catch(err) {
        res.status(400).json({error: err});
    }
})

router.put('/setHistory/:id', (req, res, next) => checkAuth(req, res, next, 'manager'), async(req,res)=>{
    try {
        const userUpdated = await UserEntity.updateOne(
            {_id: req.params.id}, 
            {$set: { 
                history: req.body.history}}
            );
        res.status(200).json({message: 'Set history successfully'});
    } catch(err) {
        res.status(400).json({error: err});
    }
})

module.exports = router;