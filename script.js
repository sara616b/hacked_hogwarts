"use strict";

document.addEventListener("DOMContentLoaded", start);

const allStudents = [];

const Student = {
  firstname: "",
  middlename: "null",
  lastname: "",
  nickname: "",
  image: "",
  house: "",
};

function start() {
  console.log("start");

  //load jsondata
  loadJson(
    "https://petlatkea.dk/2021/hogwarts/students.json",
    prepareStudentData
  );
  //show jsondata in templates
}

function loadJson(link, action) {
  fetch(link)
    .then((response) => response.json())
    .then((jsonData) => {
      // when loaded, prepare objects
      action(jsonData);
    });
}

function prepareStudentData(data) {
  let students = createObjectsWithStudentData(data);
  showStudentList(students);
}

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

    //add to allStudents array
    allStudents.push(student);
  });

  //display all students in console
  console.table(allStudents);
  return allStudents;
}

function showStudentList(students) {
  const list = document.querySelector("#listview");
  const template = document.querySelector("template");

  students.forEach((student) => {
    showSingleStudent(student, template, list);
  });
}

function showSingleStudent(student, template, list) {
  const clone = template.cloneNode(true).content;
  clone.querySelector("img").src += student.image;
  console.log("/image/" + student.image + ")");
  clone.querySelector(".name").textContent =
    student.firstname + " " + student.lastname;
  clone.querySelector(".house").textContent = student.house;
  list.appendChild(clone);
}
