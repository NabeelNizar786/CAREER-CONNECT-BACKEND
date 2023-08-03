const postModel = require('../model/postModal');
const empModal = require('../model/empModel');

const createPost = async (req,res) => {
  try {
    const {
      role,
      location,
      jobType,
      ctc,
      exp,
      vacancy,
      description,
      skills,
      additionalSkills
    } = req.body;

    const newPost = new postModel({
      role,
      empId: req.empId,
      location,
      jobtype: jobType,
      ctc,
      minimumExp: exp,
      vacancy: vacancy,
      skills: skills,
      additionalSkills: additionalSkills,
      jobDescription: description
    });

    let post = await newPost.save();

    if(!post) {
      return res
      .status(400)
      .json({ success: false, message: "something went wrong" });
    }

    const update = await empModal.findOneAndUpdate(
      {_id: req.empId},
      {$inc: {postCount: 1}},
      {new:true}
    );

    return res.status(200).json({
      success:true,
      message:"CREATED SUCCESSFULLY",
      empData: update,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

const getPostData = async (req, res) => {
  try {
    let id = req.empId;
    let postData = await postModel.find({ empId: id }).populate("empId");

    if (postData) {
      res.status(200).json({ data: true, message: "data obtained", postData });
    } else {
      res.status(200).json({ data: false, message: "no post found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

const getActivePostData = async (req, res) => {
  try {
    let id = req.empId;
    let postData = await postModel
      .find({ empId: id, status: "Active" })
      .populate("empId");

    if (postData) {
      res.status(200).json({ data: true, message: "data obtained", postData });
    } else {
      res.status(200).json({ data: false, message: "no post found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

const userGetAllPost = async (req,res) => {
  try {
    let postData = await postModel.find({status:"Active", block:{$ne:true}}).populate('empId');
    console.log(postData);
    if(postData) {
      res.status(200).json({ data: true, message: "data obtained", postData });
    } else {
      res.status(404).json({ data: false, message: "no post found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
}

module.exports = {
  createPost,
  getPostData,
  getActivePostData,
  userGetAllPost
}