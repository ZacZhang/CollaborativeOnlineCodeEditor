const express = require("express");
const router = express.Router();
const problemService = require("../services/problemService");
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const node_rest_client = require('node-rest-client').Client;
const rest_client = new node_rest_client();

EXECUTOR_SERVER_URL = 'http://localhost:5000/build_and_run';

rest_client.registerMethod('build_and_run', EXECUTOR_SERVER_URL, 'POST');

// RESTful api
router.get("/problems", function (req, res) {
    problemService.getProblems()
        .then(problems => res.json(problems));
});

router.get("/problems/:id", function (req, res) {
  let id = req.params.id;
  problemService.getProblem(+id)
    .then(problem => res.json(problem));
});

router.post("/problems", jsonParser, function (req, res) {
  problemService.addProblem(req.body)
    .then(function (problem) {
      res.json(problem);
    }, function (error) {
      res.status(400).send("Problem name already exists");
    });
});

router.post("/build_and_run", jsonParser, function (req, res) {
  const userCode = req.body.user_code;
  const lang = req.body.lang;
  console.log(lang + '; ' + userCode);

  // send build and run request to executor
  rest_client.methods.build_and_run({
    data: { code: userCode, lang: lang },
    headers: { "Content-Type": "application/json" }
  }, (data, response) => {
    console.log("Received response from execution server: " + response);

    // generate a human readable response displayed in output textarea
    const text =
      `Build output: ${data['build']}
      Execute output: ${data['run']}`;

    data['text'] = text;
    res.json(data);
  });
});

module.exports = router;
