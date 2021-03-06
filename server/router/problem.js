const express = require("express")
const router = express.Router()
const { isAdmin, getUserId, isLogin } = require("../lib/middleware")

const models = require("../db/models")

router.post("/create", isAdmin, async (req, res) => {
  const { title, problem_info, input_info, output_info, limit, example_data, judge_data } = req.body
  const newProblem = await models.Problem.create({
    title,
    problem_info,
    input_info,
    output_info,
    limit,
  })
  example_data.forEach((v, i) => {
    models.Problem_example.create({
      input_example: v.input,
      output_example: v.output,
      ProblemId: newProblem.id,
    })
  })
  judge_data.forEach((v, i) => {
    models.Problem_judge.create({
      input_judge: v.input,
      output_judge: v.output,
      ProblemId: newProblem.id,
    })
  })
})

router.get("/list/:page", getUserId, async (req, res) => {
  const page = Number(req.params.page)
  const result = await models.Problem.findAndCountAll({
    attributes: ["id", "title", "total_submit", "total_solved"],
    offset: page * 15,
    limit: 15,
    include: [{ model: models.User_problem, where: { UserId: req.body.UserId }, required: false }],
  })
  res.json(result)
})

router.post("/getUserSubmit", isLogin, async (req, res) => {
  const { ProblemId, UserId } = req.body
  const submitData = await models.Submit.findAll({
    where: { ProblemId, UserId },
    include: [{ model: models.Submit_result }],
    order: [["id", "DESC"]],
  })
  res.send(submitData)
})

router.get("/:id", async (req, res) => {
  const result = await models.Problem.findOne({
    where: { id: req.params.id },
    include: [{ model: models.Problem_example }],
  })
  res.json(result)
})

module.exports = router
