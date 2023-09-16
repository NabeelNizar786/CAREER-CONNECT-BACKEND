const chatModel = require('../model/chatModel');

const createChat = async (req, res) => {
    try {
      const exists = await chatModel.findOne({
        members: { $all: [req.body.senderId, req.body.receiverId] },
      });
      if (exists) {
        console.log(exists, "haiiii");
        return res
          .status(200)
          .json({ message: "chat already exists", chatData: exists });
      }
  
      const newChat = new chatModel({
        members: [req.body.senderId, req.body.receiverId],
      });
      const result = await newChat.save();
      res.status(200).json({ chatData: result });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
  const userChat = async (req, res) => {
    try {
      const chat = await chatModel.find({
        members: { $in: [req.params.userId] },
      });
  
      res.status(200).json({ chat });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
  const findChat = async (req, res) => {
    try {
      const chat = await chatModel.find({
        members: { $all: [req.params.firstId, req.params.secondId] },
      });
      res.status(200).json({ chat });
    } catch (error) {
      console.log(error);
      res.status(500).json(error);
    }
  };
  module.exports = {
    createChat,
    userChat,
    findChat,
  };
  