const ProblemModel = require("../models/problemModel");

// ask MongoDb for the problems data
let getProblems = function () {
  return new Promise((resolve, reject) => {
    ProblemModel.find({}, function (err, problems) {
      if (err) {
        reject(err);
      } else {
        resolve(problems);
      }
    });
  });
};

let getProblem = function (id) {
  return new Promise((resolve, reject) => {
    ProblemModel.findOne({id: id}, function (err, problem) {
      if (err) {
        reject(err);
      } else {
        resolve(problem);
      }
    });
  });
};

let addProblem = function (newProblem) {
  return new Promise((resolve, reject) => {
    ProblemModel.findOne({name: newProblem.name}, function (err, problem) {
      if (problem) {
        reject("Problem name already exists");
      } else {
        ProblemModel.count({}, function (err, num) {
          newProblem.id = num + 1;
          let mongoProblem = new ProblemModel(newProblem);
          mongoProblem.save();
          resolve(newProblem);
        });
      }
    });
  });
};

module.exports = {
  getProblems: getProblems,
  getProblem: getProblem,
  addProblem: addProblem
};
