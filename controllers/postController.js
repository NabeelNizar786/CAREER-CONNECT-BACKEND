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

const editPost = async (req, res) => {
  try {
    const {
      id,
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

    if (!id) {
      return res
        .status(400)
        .json({ error: true, message: "Post ID is required" });
    }

    // Find the post by ID
    const post = await postModel.findById(id);

    if (!post) {
      return res.status(404).json({ error: true, message: "Post not found" });
    }

    // Update the post fields
    post.role = role;
    post.location = location;
    post.jobtype = jobType;
    post.ctc = ctc;
    post.minimumExp = exp;
    post.vacancy = vacancy;
    post.skills = skills;
    post.additionalSkills = additionalSkills;
    post.jobDescription = description;

    await post.save();

    let empId = req.empId;
    let postData = await postModel.find({ empId: empId }).populate("empId");
    if (postData) {
      return res.status(200).json({
        success: true,
        message: "Post updated successfully",
        postData,
      });
    }
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
    const page = parseInt(req.query.page) || 1; // Get page number from query parameter (default to 1)
    const limit = parseInt(req.query.limit) || 3; // Get limit from query parameter (default to 10)
    const skip = (page - 1) * limit; // Calculate number of documents to skip

    let postData = await postModel
      .find({ status: "Active" })
      .populate({
        path: "empId",
        match: { status: { $ne: false } }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

      const totalCount = await postModel.countDocuments({ status: "Active" });

    postData = postData.filter(post => post.empId !== null);

    if (postData.length > 0) {
      res.status(200).json({ data: true, message: "Data obtained", postData, page, limit, totalCount});
    } else {
      res.status(404).json({ data: false, message: "No posts found" });
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

const InvitedJobs = async (req, res) => {
  try {
    const userId = req.userId;
    const postData = await postModel
      .find({ "invites.userId": userId })
      .populate("empId");
    if (postData) {
      return res.status(200).json({ success: true, postData });
    } else {
      return res.status(200).json({ success: true, postDat: [] });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error, message: "internal server error" });
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

  const userApplications = async (req, res) => {
    try {
      const userId = req.userId;
      const status = req.params.status;
      const postData = await postModel
        .find({
          applicants: {
            $elemMatch: {
              applicant: userId,
              status: status,
            },
          },
        })
        .populate("empId");
      if (postData) {
        res.status(200).json({ success: true, postData });
      } else {
        res.status(200).json({ success: true, postData: [{}] });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "something went wrong" });
    }
  };

  const empUserInvite = async (req, res) => {
    try {
      console.log(req.body);
      const { userId, postId } = req.body;
      const postData = await postModel.findOne({ _id: postId });
      const alreadyInvited = postData.invites.some(
        (invite) => invite.userId.toString() === userId
      );
      if (alreadyInvited) {
        return res
          .status(200)
          .json({ success: false, message: "User already invited", postData });
      }
      const newUser = {
        userId: userId,
      };
      postData.invites.push(newUser);
      await postData.save();
      console.log(postData);
      return res
        .status(200)
        .json({ succes: true, message: "invited successfully", postData });
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({ success: false, message: "internal server error" });
    }
  };

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
  changeApplicationStatus,
  editPost,
  InvitedJobs,
  userApplications,
  empUserInvite
};
