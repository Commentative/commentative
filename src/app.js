const express = require("express");
const path = require("path");
const app = express();
const handlebars = require("express-handlebars");
const bodyParser = require("body-parser");
const axios = require("axios");

const readabilityParser = require("./helpers/readabilityParser");

app.set("views", path.join(__dirname, "views"));

app.set("view engine", "hbs");
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
    layoutsDir: path.join(__dirname, "views", "layouts"),
    partialsDir: path.join(__dirname, "views", "partials"),
    defaultLayout: "main"
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.set("port", process.env.PORT || 3000);

app.use(express.static(__dirname + "/views"));

app.get("/", (req, res) => {
  res.render("home", { page: "home" });
});

app.get("/newarticle", async (req, res) => {
  const url = req.query.contenturl;
  const articleObj = await readabilityParser(url);
  res.render("newarticle", { articleObj, page: "newarticle" });
});

app.get("/:uuid", async (req, res) => {
  const url = `https://8rj0xswzt3.execute-api.eu-west-1.amazonaws.com/dev/commentative/${req.params.uuid}`;
  const result = await axios(url);
  const articleObj = {
    content: result.data.articleBody,
    comments: result.data.comments
  };
  console.log(articleObj);
  res.render("newarticle", { articleObj, page: "newarticle" });
});

app.listen(app.get("port"), () => {
  console.log("App running on port", app.get("port"));
});

module.exports = app;
