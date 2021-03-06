//jshint esversion: 6
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
var _ = require('lodash');
app.use(bodyParser.urlencoded(
  { extended: "true" }
));

app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb+srv://mrigankx:test@cluster0.khu7t.mongodb.net/todolistDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
    name: String
});

const Item = mongoose.model("Item", itemSchema); 

const item1 = new Item({
  name: "Click the + button to add items"
});
const item2 = new Item({
  name: "Click the checkbox to delete item"
});

const defaultItems = [item1, item2];
const listSchema = {
  name: String,
  items: [itemSchema]
};
const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  res.render("login");
});
app.post("/", (req, res) => {
  const username = req.body.username;
  res.redirect("/" + username);
});

app.get("/home", (req, res) => {
  
  Item.find((err, foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
      if (err) {
      console.log(err);
  }

      });
             res.redirect("/home"); 
    }
    else {
      res.render("list", { title: "Today", allItems: foundItems });

    }
  });

 });
app.post("/home", (req, res) => {
  let newItem = req.body.newItem;
  const listName = req.body.button;
  const item = new Item({
    name: newItem
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/home");
  }
  else {
    List.findOne({ name: listName }, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
  
});
app.post("/delete", (req, res)=>{
  const id = req.body.deleteItem;
  const listName = req.body.listName;
  if (listName === "Today")
  {
     Item.findByIdAndRemove(id, (err) => {
    if (err)
      console.log(err);
    
    res.redirect("/home");
  });
  }
  else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: id}}}, (err, result) => {
      if (!err) {
        res.redirect("/"+ listName);
      }
    });
  }
 
});
app.get("/:listname", (req, res) => {
  const customList = _.capitalize(req.params.listname);
  List.findOne({ name: customList }, (err, result) => {
    if (!err) {
      if (!result)
      { 
        const list = new List({
            name: customList,
            items: defaultItems
          });
        list.save();
        res.redirect("/" + customList);
      }
      else {
        res.render("list", { title: result.name, allItems: result.items });
      }
    }
  });
 
});
app.post("/logout", (req, res) => {
  res.redirect("/");
});

app.listen(port, function () {
  console.log("Server started on port:" + port);
});