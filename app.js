//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose=require("mongoose");
const _ =require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
mongoose.connect("mongodb+srv://admin-sachin:qwerty%40123@cluster0.cuysxnj.mongodb.net/todolistDB");
const itemSchema={
  name: String
};
const Item=mongoose.model("Item",itemSchema);
const item1= new Item({
  name:"welcome to your todolist"
});

const item2= new Item({
  name:"Hit the + button to add new item"
});
const item3= new Item({
  name:"<---hit this to delete item"
});


const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items: [itemSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {
  Item.find({})
    .then(foundItems => {
      if (foundItems.length === 0) {
        return Item.insertMany(defaultItems);
      } else {
        res.render("list", { listTitle: "today", newListItems: foundItems });
      }
    })
    .then(() => {
      res.redirect("/");
    })
    .catch(err => {
      console.log(err);
    });
});

app.get("/:customListName",function(req,res){
  const customListName= _.capitalize(req.params.customListName) ;

  List.findOne({ name: customListName })
  .then(foundList => {
    if (foundList) {
      //show an existing list
      res.render("list",{ listTitle: foundList.name, newListItems: foundList.items })
    } else {
      //create new list
      const list=new List({
        name:customListName,
        items:defaultItems
      });
      list.save();
      res.redirect("/" + customListName);
    }
  })
  .catch(err => {
    console.log(err);
  });


  
});

// app.get("/", function(req, res) {
  
//   Item.find({},function(err,foundItems){
//     if (foundItems.length===0){
//       Item.insertMany(defaultItems)
//   .then(() => {
//     console.log("Default items inserted successfully.");
//   })
//   .catch((err) => {
//     console.log(err);
//   });
//     res.redirect("/");
//   }else{
//     res.render("list", {listTitle: "today", newListItems: items});
//   }

//   });
  

// });

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
  if (listName==="today"){
      item.save();
      res.redirect("/");
  }else{
    List.findOne({ name: listName })
  .then(foundList => {
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName);
  })
  .catch(err => {
    console.log(err);
  });
  }

});
app.post("/delete",function(req,res){
  const checkedItemId= req.body.checkbox ;
  const listName=req.body.listName;

  if (listName==="today"){
    Item.findByIdAndDelete(checkedItemId)
  .then(deletedItem => {
    console.log('Document deleted successfully:', deletedItem);
    res.redirect("/");
  })
  .catch(err => {
    console.log(err);
  });
  }else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      { new: true }
    )
      .then(updatedList => {
        res.redirect("/" + listName);
      })
      .catch(err => {
        console.log(err);
      });
  }
  

});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
