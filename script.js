"use strict";

document.addEventListener("DOMContentLoaded", start);

const allStudents = [];
const expelledStudentsArray = [];

//prototype for all students
const Student = {
  firstname: "",
  middlename: "null",
  lastname: "",
  nickname: "",
  image: "",
  house: "",
  prefect: false,
  expelled: false,
  inquisitorial: false,
  bloodstatus: undefined,
};

let filterBy = "all";
let sortBy = "Firstname A-Z";
let studentsOnDisplay;
let hasBeenHacked = false;

function start() {
  console.log("start");
  //load jsondata
  loadJson(
    "https://petlatkea.dk/2021/hogwarts/students.json",
    prepareStudentData
  );
  //when sure the students array have been created load blood status
  if (allStudents !== []) {
    loadJson(
      "https://petlatkea.dk/2021/hogwarts/families.json",
      setBloodStatus
    );
  }

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
  document
    .querySelector("#searchbar")
    .addEventListener("input", searchThroughPage);
  document
    .querySelector("#secretbutton")
    .addEventListener("click", hackTheSystem);
}

//show number infos on top of page
function showInfoNumbers() {
  let house;
  document.querySelector(
    "#gryffindornumber"
  ).textContent = filterStudentsByHouse("gryffindor");
  document.querySelector(
    "#hufflepuffnumber"
  ).textContent = filterStudentsByHouse("hufflepuff");
  document.querySelector(
    "#slytherinnumber"
  ).textContent = filterStudentsByHouse("slytherin");
  document.querySelector(
    "#ravenclawnumber"
  ).textContent = filterStudentsByHouse("ravenclaw");
  document.querySelector("#totalstudents").textContent = allStudents.length;
  document.querySelector("#totalexpelled").textContent =
    expelledStudentsArray.length;
  document.querySelector("#studentsdisplayed").textContent =
    studentsOnDisplay.length;

  function filterStudentsByHouse(houseVar) {
    house = houseVar;
    let studentsInHouse = allStudents.filter(isInSpecificHouse);
    return studentsInHouse.length;
  }

  function isInSpecificHouse(student) {
    if (student.house.toLowerCase() === house) {
      return true;
    } else {
      return false;
    }
  }
}

function prepareStudentData(data) {
  studentsOnDisplay = createObjectsWithStudentData(data);
  buildStudentList();
}

function setBloodStatus(json) {
  allStudents.forEach((student) => {
    if (json.half.includes(student.lastname)) {
      student.bloodstatus = "half blood";
    } else if (json.pure.includes(student.lastname)) {
      student.bloodstatus = "pure blood";
    } else {
      student.bloodstatus = "muggleborn";
    }
  });
}

//TODO - if time divide out to smaller functions
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
    //special cases for image files:
    //TODO - make better if you have tiiiiime!!! (this doesn't really make sense but it works for a version1)
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
    } else if (student.firstname == "" || student.lastname == "") {
      student.image = "no_image.png";
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
  filterStudents();
  sortingStudents();
  if (filterBy === "expelled" && expelledStudentsArray.length === 0) {
    document.querySelector("#listview").innerHTML =
      "<p style='padding-top:20px; font-weight:bold;'>There are no expelled students.</p>";
    document.querySelector("#studentsdisplayed").textContent = "0";
  } else {
    showStudentList(studentsOnDisplay);
  }
}

function showStudentList(students) {
  const list = document.querySelector("#listview");
  const template = document.querySelector("template");

  //clear list
  list.innerHTML = "";
  //add each student to list
  students.forEach((student) => {
    showSingleStudent(student, template, list);
  });

  //show info in top of list
  showInfoNumbers();
}
function showSingleStudent(student, template, list) {
  const clone = template.content.cloneNode(true);

  //insert image
  clone.querySelector("img").src += student.image;
  //insert name
  let displayName;
  if (student.middlename !== "null") {
    displayName =
      student.firstname + " " + student.middlename + " " + student.lastname;
  } else {
    displayName = student.firstname + " " + student.lastname;
  }
  clone.querySelector(".name").textContent = displayName;
  if (student.prefect === true) {
    clone.querySelector("h3").classList.add("prefectsymbol");
  } else if (student.prefect === false) {
    clone.querySelector("h3").classList.remove("prefectsymbol");
  }
  clone.querySelector(".student").id = student.firstname;
  if (filterBy == "expelled") {
    clone.querySelector(".student").classList.add("expelled");
  }
  //insert house
  clone.querySelector(".house").textContent = student.house;
  if (student.inquisitorial === true) {
    clone.querySelector(".house").classList.add("squadsymbol");
  } else if (student.inquisitorial === false) {
    clone.querySelector(".house").classList.remove("squadsymbol");
  }
  //add eventlistener for popup
  clone.querySelector(".studentinfo").addEventListener("click", () => {
    showPopup(student, displayName);
  });

  //prefect
  clone.querySelector(".prefect").dataset.prefect = student.prefect;
  clone
    .querySelector(".prefect")
    .addEventListener("click", togglePrefectStatus);
  function togglePrefectStatus() {
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToAppointPrefect(student);
    }
    buildStudentList();
  }

  //add expellbutton
  clone.querySelector(".expell").addEventListener("click", expelStudent);

  //allow slytherin students to be appointed to the inquisitorial squad
  if (
    student.house.toLowerCase() === "slytherin" ||
    student.bloodstatus === "pure blood"
  ) {
    clone.querySelector(".squad").classList.remove("hidden");
    clone.querySelector(".squad").dataset.squad = student.inquisitorial;
    clone.querySelector(".squad").addEventListener("click", () => {
      appointToInqSquad(student);
    });
  }

  list.appendChild(clone);
}

function setFilter() {
  filterBy = this.getAttribute("data-filter");
  document
    .querySelectorAll("[data-action=filter]")
    .forEach((button) => button.classList.remove("chosen"));
  this.classList.add("chosen");
  buildStudentList();
}

//sets filter and checks students by calling isInHouse
function filterStudents() {
  if (filterBy == "all") {
    studentsOnDisplay = allStudents;
  } else if (filterBy == "expelled") {
    studentsOnDisplay = expelledStudentsArray;
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
  } else if (sortBy === "Prefects") {
    aval = b.prefect;
    bval = a.prefect;
  }

  if (aval > bval) {
    return 1;
  } else {
    return -1;
  }
}

//show popup
function showPopup(student, displayName) {
  const popup = document.querySelector("#popup");
  popup.querySelector("button").addEventListener("click", () => {
    popup.classList.add("hidden");
  });
  popup.classList = "";

  //insert content about student
  popup.querySelector(".popupname").textContent = displayName;
  popup.querySelector("#popup img").src = "images/" + student.image;
  popup.querySelector(".popuphouse").innerHTML =
    "<strong>House: </strong>" + student.house;
  popup.classList.add(student.house.toLowerCase());
  if (student.nickname !== "") {
    popup.querySelector(".popupnickname").textContent =
      'Nickname: "' + student.nickname;
  } else {
    popup.querySelector(".popupnickname").textContent = "No nickname";
  }
  if (student.prefect) {
    popup.querySelector(".popupprefect").innerHTML =
      "Is a <strong>prefect.</strong>";
  } else {
    popup.querySelector(".popupprefect").innerHTML =
      "Is <strong>not</strong> a prefect.";
  }
  if (student.expelled) {
    popup.querySelector(".popupexpelled").textContent =
      "Has been <strong>expelled.</strong>";
  } else {
    popup.querySelector(".popupexpelled").innerHTML =
      "Has <strong>not</strong> been expelled.";
  }
  if (student.inquisitorial) {
    popup.querySelector(".popupinquisitorial").innerHTML =
      "Is part of the <strong>inquisitorial squad.</strong>";
  } else {
    popup.querySelector(".popupinquisitorial").innerHTML =
      "Is <strong>not</strong> part of the inquisitorial squad.";
  }
  popup.querySelector(".popupbloodstatus").innerHTML =
    "<strong>Bloodstatus: </strong>" + student.bloodstatus;
  popup.querySelector("#popuphousecrest").classList = "";
  popup
    .querySelector("#popuphousecrest")
    .classList.add("crest" + student.house.toLowerCase());
}

//expell a student
function expelStudent() {
  //find student's place in array
  let thisStudetsIndex;
  for (let i = 0; i < allStudents.length; i++) {
    if (allStudents[i].firstname === this.parentElement.parentElement.id) {
      thisStudetsIndex = i;
    }
  }
  //set to expelled and remove from prefect and inq squad
  allStudents[thisStudetsIndex].expelled = true;
  allStudents[thisStudetsIndex].prefect = false;
  allStudents[thisStudetsIndex].inquisitorial = false;

  //add to expelled students array
  expelledStudentsArray.push(allStudents[thisStudetsIndex]);

  //remove from allStudents array
  allStudents.splice(thisStudetsIndex, 1);
  studentsOnDisplay = allStudents;

  //build list
  buildStudentList();
}
//appoint prefect if allowed
function tryToAppointPrefect(selectedStudent) {
  //already selected prefects
  let prefects = allStudents.filter((student) => student.prefect);
  let numberOfPrefects = prefects.length;
  let prefectsSameHouse = [];
  prefectsSameHouse = prefects.filter(prefectInHouse);

  function prefectInHouse(student) {
    if (student.house === selectedStudent.house && student.prefect) {
      return true;
    } else {
      return false;
    }
  }

  //check if there're already two prefect from selected students house
  if (prefectsSameHouse.length == 2) {
    stopOrRemoveAPrefect(prefectsSameHouse[0], prefectsSameHouse[1]);
  } else {
    appointPrefect(selectedStudent);
  }

  function stopOrRemoveAPrefect(prefectA, prefectB) {
    document.querySelector("#removeprefect").classList.remove("hidden");
    document
      .querySelector("#removeprefect .closebutton")
      .addEventListener("click", closeWarningCleanup);
    document.querySelector("#removeprefect #prefectA").textContent =
      prefectA.firstname;
    document.querySelector("#removeprefect #prefectB").textContent =
      prefectB.firstname;
    document
      .querySelector("#removeprefect #prefectA")
      .addEventListener("click", () => {
        removePrefect(prefectA);
        appointPrefect(selectedStudent);
        buildStudentList();
        closeWarningCleanup();
      });
    document
      .querySelector("#removeprefect #prefectB")
      .addEventListener("click", () => {
        removePrefect(prefectB);
        appointPrefect(selectedStudent);
        buildStudentList();
        closeWarningCleanup();
      });

    function closeWarningCleanup() {
      document.querySelector("#removeprefect").classList.add("hidden");
      document
        .querySelector("#removeprefect .closebutton")
        .removeEventListener("click", closeWarningCleanup);

      document
        .querySelector("#removeprefect #prefectA")
        .removeEventListener("click", () => {
          removePrefect(prefectA);
          appointPrefect(selectedStudent);
          buildStudentList();
          closeWarningCleanup();
        });
      document
        .querySelector("#removeprefect #prefectB")
        .removeEventListener("click", () => {
          removePrefect(prefectB);
          appointPrefect(selectedStudent);
          buildStudentList();
          closeWarningCleanup();
        });
    }
  }

  function removePrefect(student) {
    student.prefect = false;
  }
  function appointPrefect(student) {
    student.prefect = true;
  }
}

function appointToInqSquad(student) {
  if (student.inquisitorial === true) {
    student.inquisitorial = false;
  } else if (student.inquisitorial === false) {
    student.inquisitorial = true;
    //check if hacked and if true set timeout
    if (hasBeenHacked) {
      setTimeout(() => {
        appointToInqSquad(student);
      }, 500);
    }
  }
  buildStudentList();
}

//search bar
function searchThroughPage() {
  //string from searchbar
  let searchstring = document.querySelector("#searchbar").value.toLowerCase();
  //search through all students and update students
  let searchResult = allStudents.filter(filterBySearchString);
  function filterBySearchString(student) {
    //searching first, middle and last name
    if (
      student.firstname.toString().toLowerCase().includes(searchstring) ||
      student.lastname.toString().toLowerCase().includes(searchstring) ||
      student.middlename.toString().toLowerCase().includes(searchstring)
    ) {
      return true;
    } else {
      return false;
    }
  }

  //update surrently showing students to search result
  showStudentList(searchResult);

  //when clearing search result display the students that were on display before search initiated
  if (searchstring == "") {
    buildStudentList();
  }
}

//hacking muh hahhahhaaa
function hackTheSystem() {
  if (!hasBeenHacked) {
    hasBeenHacked = true;
    console.log("HOGWARTS IS BEING HACKED");
    //create new student object with my info and add to display-array
    addMe();
    //change bloodstatuses
    corruptBloodStatuses();

    //set a timeout for inq squad
  } else if (hasBeenHacked) {
    console.log("Has already been hacked.");
  }
}

function addMe() {
  //add new student
  let me = Object.create(Student);
  me.firstname = "Sarah";
  me.middlename = "Isabella";
  me.lastname = "Frederiksen";
  //Photo by "https://unsplash.com/@ctj?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" Cecilie Johnsen on Unsplash
  me.image = "f_jkr.jpg";
  me.house = "Hufflepuff";

  allStudents.push(me);
  buildStudentList();
}

function corruptBloodStatuses() {
  //corruptBloodStatuses
  allStudents.forEach((student) => {
    if (student.bloodstatus == "pure blood") {
      let randomBloodChoices = ["muggleborn", "half blood"];
      student.bloodstatus = randomBloodChoices[Math.round(Math.random())];
    } else if (
      student.bloodstatus == "muggleborn" ||
      student.bloodstatus == "half blood"
    ) {
      student.bloodstatus = "pure blood";
    }
  });
}
