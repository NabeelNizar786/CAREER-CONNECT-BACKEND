const postModel = require("../model/postModal");
const empModal = require("../model/empModel");
const {uploadToCloudinary} = require('../config/cloudinary');
const sendMail = require('../utils/nodeMailer');
const userModel = require('../model/userModel');

const createPost = async (req, res) => {
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
      additionalSkills,
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
      jobDescription: description,
    });

    let post = await newPost.save();

    if (!post) {
      return res
        .status(400)
        .json({ success: false, message: "something went wrong" });
    }

    const update = await empModal.findOneAndUpdate(
      { _id: req.empId },
      { $inc: { postCount: 1 } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "CREATED SUCCESSFULLY",
      empData: update,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

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

const getSinglePostData = async (req,res) => {
  try {
    let postId = req.params.postId;

    const postData = await postModel.findOne({_id: postId}).populate("applicants.applicant");

    if (postData) {
      return res
        .status(200)
        .json({ success: true, message: "data obtained", postData });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "data not found" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
  }
}

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

const userGetAllPost = async (req, res) => {
  try {
    let postData = await postModel
      .find({ status: "Active", block: { $ne: true } })
      .populate("empId").sort({ createdAt: -1 });

      console.log(postData);
    if (postData) {
      res.status(200).json({ data: true, message: "data obtained", postData });
    } else {
      res.status(404).json({ data: false, message: "no post found" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

const singleJobDetails = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    let postData = await postModel.findOne({ _id: id }).populate("empId");

    if (postData) {
      res.status(200).json({ data: true, message: "DATA OBTAINED", postData });
    } else {
      res.status(404).json({ data: false, message: "NO POST FOUND" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, message: error.message });
  }
};

const applyJob = async(req, res) => {
  try {
    const resume = req.file.path;
    const {postId, coverLetter} = req.body;

    let post = await postModel.findOne({_id: postId});

    if(post) {
      const existingApplicant = post.applicants.find(
        (applicant) => applicant.applicant.toString() === req.userId
      );

      if (existingApplicant) {
        return res
        .status(400)
          .json({ success: true, message: "ALREADY APPLIED" });
      }
    }

    const data = await uploadToCloudinary(resume, "resumes");

    const newApplicant = {
      applicant: req.userId,
      status: "Pending",
      coverLetter: coverLetter,
      resumeUrl: data.url,
      resumePublicId: data.public_id,
    }

    post.applicants.push(newApplicant);
    await post.save();

    return res
    .status(200)
    .json({ success: true, message: "APPLIED SUCCESFULLY", post });
  } catch (error) {
    console.log(error);
    res
    .status(500)
    .json({ success: false, message: "SOMETHING WENT WRONG" });
  }
  }

  const changeApplicationStatus = async(req,res) => {
    try {
      const {postId, applicationId, newStatus, userId} = req.params;
      console.log(postId, applicationId, newStatus, userId);

      let postData = await postModel.findOneAndUpdate(
        {_id:postId, "applicants._id": applicationId},
        {$set: {"applicants.$.status" : newStatus}},
        {new:true}
      )
      .populate("applicants.applicant")
      .populate("empId");

      if(!postData) {
        return res
        .status(404)
        .json({ success: false, message: "post not found" });
      }
      
      console.log('Before userData retrieval');
     const userData = await userModel.findByIdAndUpdate({_id: userId});
console.log('After userData retrieval');
console.log(userData);

      let message = "";

      if(newStatus == "Selected") {
        message = `Congratulations  on your selection! We are thrilled to inform you that your application for the ${postData.role} position has been chosen by ${postData.empId.companyName}.
       Your skills and experience stood out among the applicants, and we believe you will be a valuable addition to our team.
         Welcome aboard!`;
      } else if (newStatus == "Rejected") {
        message = `We regret to inform you that your job application for the ${postData.role} position has been rejected by ${postData.empId.companyName}.
        We appreciate your interest in our company and wish you the best in your future endeavors.`;
      }

      await sendMail(userData.email, "Application Status", message);

      return res
      .status(200)
      .json({ success: true, message: "updated successfully", postData });
    } catch (error) {
      return res
      .status(500)
      .json({ success: false, message: "something went wrong" });
    }
  }


module.exports = {
  createPost,
  getPostData,
  getActivePostData,
  userGetAllPost,
  singleJobDetails,
  applyJob,
  getSinglePostData,
  changeApplicationStatus
};
