const handleFactory = require("./handleFactory");
const asyncCatcher = require("../utils/asyncCatcher");
const { Experience } = require("../models/experienceModule");
const User = require("../models/userModule");
exports.createExperince = asyncCatcher(async (req, res, next) => {
  try {
    const experience = await Experience.create(req.body.data);
    experience.user_id = req.user._id;
    const filtre = req.query.filtre ? req.query.filtre.split(",") : [];
    console.log(filtre);
    res.status(201).json({
      status: "success",
      experience: experience,
    });
    const myuser = await User.findOneAndUpdate(
      { _id: experience.user_id },
      { $push: { Experiences: experience._id } }
    );
  } catch (error) {
    console.error("Error adding creating experince:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to creating experince",
    });
  }
});
exports.upadtingExperince = asyncCatcher(async (req, res, next) => {
  try {
    await Experience.findOneAndUpdate(req.params.expID, req.body);
    res.status(201).json({
      status: "success",
    });
  } catch (error) {
    console.error("Error adding updating experience:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update experience",
    });
  }
});


///////////////////
///////////////////
//////////////////
////////////////////

exports.addExperience = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming you have the user id from authentication middleware
    const { title, companyName, EmploymentType, location, startDate, endDate,image } =
      req.body;

    const user = await User.findById(userId);

    // Add the new experience
    user.Experience.push({
      title,
      companyName,
      EmploymentType,
      location,
      startDate,
      endDate,
      image,
    });

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.addEducations = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming you have the user id from authentication middleware
    const { school, field, degree, startDate, endDate,image } = req.body;

    const user = await User.findById(userId);

    // Add the new experience
    user.Education.push({
      endDate,
      startDate,
      degree,
      field,
      school,
      image
    });

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};


exports.deleteExperience = async (req, res, next) => {
  try{
    console.log("wwwwwwwwwwwyyyyyyyyyyyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..................")
    console.log(req.body)
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$pull:{Experience:req.body}});
res.status(200).json({
  seccess:true,
})
}
  catch(error){
    console.error("Error deleting education:", error);
    res.status(400).json({
      status: "error",
      message: "Failed to delete education ",
    });
  }
};
exports.deleteeducation=asyncCatcher(async (req, res, next) => {
  
  try{
    console.log("wwwwwwwwwwwyyyyyyyyyyyaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa nnnnnnnnnnnnnnnnnnnnnnnnnnnnnn..................")
    console.log(req.body)
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$pull:{Education:req.body}});
res.status(200).json({
  seccess:true,
})
}
  catch(error){
    console.error("Error deleting education:", error);
    res.status(400).json({
      status: "error",
      message: "Failed to delete education ",
    });
  }
})
exports.addCertification = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming you have the user id from authentication middleware
    const { name, org, url, startDate,image } = req.body;

    const user = await User.findById(userId);

    // Add the new experience
    user.Certification.push({
      name,
      org,
      url,
      startDate,
      image
    });

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
exports.addlicences=asyncCatcher(async (req, res, next) => {
  try{
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$push:{licences:req.body}});
res.json({
  seccess:true,
})
}
  catch(error){
    console.error("Error adding licence:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to add licence ",
    });
  }
})


exports.deletelicences=asyncCatcher(async (req, res, next) => {
  try{
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$pull:{licences:req.body}});
res.json({
  seccess:true,
})
}
  catch(error){
    console.error("Error delete licence:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete licence ",
    });
  }
})


exports.deletesertification=asyncCatcher(async (req, res, next) => {
  try{
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$pull:{Certification:req.body}});
res.json({
  seccess:true,
})
}
  catch(error){
    console.error("Error delete licence:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete licence ",
    });
  }
})


// exports.addlanguage=asyncCatcher(async (req, res, next) => {
//   try{
// const myuser= await User.findOneAndUpdate({_id:req.user._id},{$push:{language:req.body}});
// res.json({
//   seccess:true,
// })
// }
//   catch(error){
//     console.error("Error adding language:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Failed to add language ",
//     });
//   }
// })
exports.deletelanguage=asyncCatcher(async (req, res, next) => {
  try{
    console.log("hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$pull:{Language:req.body}});
res.json({
  seccess:true,
})
}
  catch(error){
    console.error("Error delete language:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete language ", 
    });
  }
})

exports.deleteskill=asyncCatcher(async (req, res, next) => {
  try{
const myuser= await User.findOneAndUpdate({_id:req.user._id},{$pull:{skills:{$in:[req.body]}}});
res.json({
  seccess:true,
})
}
  catch(error){
    console.error("Error delete language:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete language ",
    });
  }
})

exports.addLanguage = async (req, res, next) => {
  try {
    const userId = req.user._id; // Assuming you have the user id from authentication middleware
    const { language, proficiency,} = req.body;

    const user = await User.findById(userId);

    // Add the new experience
    user.Language.push({
     language,
     proficiency,
    });

    await user.save();

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};



