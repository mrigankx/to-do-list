//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
app.use(bodyParser.urlencoded(
  { extended: "true" }
));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema); 

const item1 = new Item({
  name: "buy apple"
});
const item2 = new Item({
  name: "buy mango"
});
const item3 = new Item({
  name: "buy tea"
});
const defaultItems = [item1, item2, item3];

app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get("/", (req, res) => {
  
  Item.find((err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
      if (err) {
      console.log(err);
  }

      });
             res.redirect("/"); 
    }
    else {
      res.render("list", { todayDate: "Today", allItems: foundItems });

    }
  });

 });
app.post("/", (req, res) => {
  let newItem = req.body.newItem;

    const item = new Item({
    name: newItem
    });
  item.save();
  res.redirect("/");

});
app.get("/work", (req, res) => {
 
  res.render("list", { todayDate: "Work List", allItems: workItems });
});
app.get("/about", (req, res) => { 
  res.render("about");
});
app.listen(port, function () {
  console.log("Server started on port:" + port);
});