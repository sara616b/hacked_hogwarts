"use strict";

document.addEventListener("DOMContentLoaded", start);

const allStudents = [];
const expelledStudentsArray = [];

const Student = {
  firstname: "",
  middlename: "null",
  lastname: "",
  nickname: "",
  image: "",
  house: "",
};

let filterBy = "all";
let sortBy = "Firstname A-Z";
let studentsOnDisplay;

function start() {
  console.log("start");
  //load jsondata
  loadJson(
    "https://petlatkea.dk/2021/hogwarts/students.json",
    prepareStudentData
  );

  //add eventlisteners to everything you can click on
  addingInitialEventListeners();
}

function loadJson(link, action) {
  fetch(link)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      action(jsonData);
    });
}

function addingInitialEventListeners() {
  document.querySelectorAll("[data-action=filter]").forEach((button) => {
    button.addEventListener("click", setFilter);
  });
  document
    .querySelector("#sorting")
    .addEventListener("input", buildStudentList);
  document.querySelector("#popup button").addEventListener("click", () => {
    document.querySelector("#popup").classList.add("hidden");
  });
}

function prepareStudentData(data) {
  studentsOnDisplay = createObjectsWithStudentData(data);
  buildStudentList(studentsOnDisplay);
}

//returns object with all students
function createObjectsWithStudentData(data) {
  //loop through json
  data.forEach((jsonObject) => {
    //Create new object
    let student = Object.create(Student);

    let fullnameFromJSON = jsonObject.fullname.trim();

    //insert correct firstname and lastname after checking if there even is a more than one name
    let firstnameFromJSON = fullnameFromJSON.substring(
      0,
      fullnameFromJSON.indexOf(" ")
    );
    let lastnameFromJSON = fullnameFromJSON.substring(
      fullnameFromJSON.lastIndexOf(" ") + 1,
      fullnameFromJSON.lenght
    );
    if (fullnameFromJSON.includes(" ") == false) {
      student.firstname =
        fullnameFromJSON.substring(0, 1).toUpperCase() +
        fullnameFromJSON.substring(1).toLowerCase();
    } else {
      student.firstname =
        firstnameFromJSON.substring(0, 1).toUpperCase() +
        firstnameFromJSON.substring(1).toLowerCase();

      //check if there're any hyphens in lastname and capitalize accordingly
      if (lastnameFromJSON.includes("-")) {
        student.lastname =
          lastnameFromJSON.substring(0, 1).toUpperCase() +
          lastnameFromJSON
            .substring(1, lastnameFromJSON.indexOf("-"))
            .toLowerCase() +
          lastnameFromJSON
            .substring(
              lastnameFromJSON.indexOf("-"),
              lastnameFromJSON.indexOf("-") + 2
            )
            .toUpperCase() +
          lastnameFromJSON.substring(lastnameFromJSON.indexOf("-") + 2);
      } else {
        student.lastname =
          lastnameFromJSON.substring(0, 1).toUpperCase() +
          lastnameFromJSON.substring(1).toLowerCase();
      }
    }

    //check for middlename and nickname
    if (fullnameFromJSON.indexOf(" ") !== fullnameFromJSON.lastIndexOf(" ")) {
      //insert correct middlename
      let middlenameFromJSON = fullnameFromJSON
        .substring(
          fullnameFromJSON.indexOf(" "),
          fullnameFromJSON.lastIndexOf(" ")
        )
        .trim();
      if (middlenameFromJSON.includes('"')) {
        student.nickname = middlenameFromJSON.replace('"', "");
      } else if (middlenameFromJSON.includes(" ")) {
        student.middlename =
          middlenameFromJSON.substring(0, 1).toUpperCase() +
          middlenameFromJSON
            .substring(1, middlenameFromJSON.indexOf(" "))
            .toLowerCase() +
          middlenameFromJSON
            .substring(
              middlenameFromJSON.indexOf(" "),
              middlenameFromJSON.indexOf(" ") + 1
            )
            .toUpperCase() +
          middlenameFromJSON.substring(middlenameFromJSON.indexOf(" ") + 1);
      } else {
        student.middlename =
          middlenameFromJSON.substring(0, 1).toUpperCase() +
          middlenameFromJSON.substring(1).toLowerCase();
      }
    }

    //insert correct house
    student.house =
      jsonObject.house.trim().substring(0, 1).toUpperCase() +
      jsonObject.house.trim().substring(1).toLowerCase();

    //insert correct photo filename
    student.image = (
      lastnameFromJSON +
      "_" +
      firstnameFromJSON.substring(0, 1) +
      ".png"
    ).toLowerCase();
    //TODO check if two images are the same and change filename (for the patils)
    //special cases for image files:
    if (student.lastname === "Patil") {
      student.image = (
        lastnameFromJSON +
        "_" +
        firstnameFromJSON +
        ".png"
      ).toLowerCase();
    } else if (student.firstname === "Justin") {
      student.image = (
        lastnameFromJSON.substring(lastnameFromJSON.indexOf("-") + 1) +
        "_" +
        firstnameFromJSON.substring(0, 1) +
        ".png"
      ).toLowerCase();
    } else if (student.firstname === "Leanne") {
      student.image = "#";
    }

    //add to allStudents array
    allStudents.push(student);
  });
  //display all students in console
  //console.table(allStudents);
  return allStudents;
}
//build studentlist by sorting them and then show them
function buildStudentList() {
  sortingStudents();
  filterStudents();
  showStudentList(studentsOnDisplay);
}

function showStudentList(students) {
  const list = document.querySelector("#listview");
  const template = document.querySelector("template");
  list.innerHTML = "";

  students.forEach((student) => {
    showSingleStudent(student, template, list);
  });

  //add expellbutton
  document.querySelectorAll(".expell").forEach((expellButton) => {
    expellButton.addEventListener("click", expellStudent);
  });
  //add prefect button
  document.querySelectorAll(".prefect").forEach((prefectButton) => {
    prefectButton.addEventListener("click", appointPrefet);
  });
}
function showSingleStudent(student, template, list) {
  const clone = template.cloneNode(true).content;

  //insert image
  clone.querySelector("img").src += student.image;
  //insert name
  if (student.middlename !== "null") {
    clone.querySelector(".name").textContent =
      student.firstname + " " + student.middlename + " " + student.lastname;
  } else {
    clone.querySelector(".name").textContent =
      student.firstname + " " + student.lastname;
  }
  clone.querySelector(".student").id = student.firstname;
  //insert house
  clone.querySelector(".house").textContent = student.house;
  //add eventlistener for popup
  clone.querySelector(".studentinfo").addEventListener("click", showPopup);
  list.appendChild(clone);
}

function setFilter() {
  filterBy = this.getAttribute("data-filter");
  buildStudentList();
}

//sets filter and checks students by calling isInHouse
function filterStudents() {
  if (filterBy == "all") {
    studentsOnDisplay = allStudents;
  } else {
    studentsOnDisplay = allStudents.filter(isInHouse);
  }
}
function isInHouse(student) {
  if (student.house.toLowerCase() === filterBy) {
    return true;
  } else {
    return false;
  }
}

//sorts students
function sortingStudents() {
  sortBy = document.querySelector("#sorting").options[
    document.querySelector("#sorting").selectedIndex
  ].text;
  studentsOnDisplay.sort(compareByName);
}
function compareByName(a, b) {
  let aval = a;
  let bval = b;
  if (sortBy === "Firstname A-Z") {
    aval = a.firstname;
    bval = b.firstname;
  } else if (sortBy === "Firstname Z-A") {
    aval = b.firstname;
    bval = a.firstname;
  } else if (sortBy === "Lastname A-Z") {
    aval = a.lastname;
    bval = b.lastname;
  } else if (sortBy === "Lastname Z-A") {
    aval = b.lastname;
    bval = a.lastname;
  }

  if (aval > bval) {
    return 1;
  } else {
    return -1;
  }
}

//show popup
function showPopup() {
  const popup = document.querySelector("#popup");
  popup.classList = "";

  //insert content about student
  popup.querySelector(".name").textContent = this.querySelector(
    ".name"
  ).textContent;
  popup.querySelector("img").src = this.querySelector("img").src;

  let house = this.querySelector(".house").textContent;
  popup.querySelector(".house").textContent = house;
  popup.classList.add(house.toLowerCase());
}

//expell a student
function expellStudent() {
  //find student's place in array
  let thisStudetsIndex;
  for (let i = 0; i < allStudents.length; i++) {
    if (allStudents[i].firstname === this.parentElement.parentElement.id) {
      thisStudetsIndex = i;
    }
  }

  //add to expelled students array
  expelledStudentsArray.push(allStudents[thisStudetsIndex]);

  //remove from allStudents array
  allStudents.splice(thisStudetsIndex, 1);
  studentsOnDisplay = allStudents;

  //build list
  buildStudentList();
}

//appoint prefect
function appointPrefet() {
  console.log("APPOINT PREFECT");
}
