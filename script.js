


//**************************************************************************************************************/
// Make the shorten tool translate Y relative to half of it's input bar

let shortenTool = document.querySelector(".actionWrapper");
let inputBar = shortenTool.firstElementChild.firstElementChild;

function shortenToolLift() {
    if (window.innerWidth > 499) {
        shortenTool.style.transform = `translateY(-${inputBar.getBoundingClientRect().height}px)`;
    } else {
        console.log("hello");
        shortenTool.style.transform = `translateY(0px)`;

    }
}
shortenToolLift();
window.addEventListener("resize", () => {
    shortenToolLift();
})

/*******************************************************
                        POPUP
-Activate the popup once a link is pressed

*******************************************************/

//Letting the user know this is a portfolio site

//needed elements

const signUpButtons = document.querySelectorAll(".signUp");
const navLinks = document.querySelectorAll("nav a");

const allPopupActivators = [...signUpButtons, ...navLinks];


const popupContent = document.querySelector(".popup .wrapper");
const popup = document.getElementById("popup");
const close = document.getElementById("close");

//Show popup on action


function showPopUp() {

    document.body.classList.add("stopScroll");
    window.scrollY = "0px";
    popup.classList.remove("hide");
    popupContent.style.animation = "showPop 0.5s ease-in";

}

allPopupActivators.forEach(item => {
    item.addEventListener("click", () => {
        showPopUp();

    })
})

//close popup on action


function closePopUp() {

    document.body.classList.remove("stopScroll");
    popup.classList.add("hide");
    popupContent.style.animation = "none"
}

popup.addEventListener("click", (e) => {
    if (e.target.id === "popup") {
        closePopUp();
    }
})

close.addEventListener("click", closePopUp);

/**************************************************************************************************************
                             Manage history and user action in the shortener tool

->main functionality of the url shortener tool
**************************************************************************************************************/

//--> track number of links in the storage and update it respectively

const counterWrapper = document.getElementById("counter");
const counter = counterWrapper.firstElementChild;
//giving it the same height as it has width depending on the text inside it
counterWrapper.style.height = `${counterWrapper.getBoundingClientRect().width}px`;

function trackAndUpdateStorageNumbers() {
    //negate one so it doesn't count the text pop in--> the one that shows the history is empty
    let numberOfLinks = container.childElementCount - 1;
    counter.innerText = `${numberOfLinks}`;
    return numberOfLinks;
}


//--> Clearing History and managing storage 
const container = document.querySelector(".resultsWrapper ul");
//btns
const clearAllBtn = document.getElementById("clear");


//Clear History
function clearAllHistory() {

    const history = document.querySelectorAll(".resultsWrapper ul li");
    //clearing local storage
    localStorage.clear();
    //removing elements
    history.forEach(result => {
        result.remove();
    });

    return ifEmptyShowMassege();
}

clearAllBtn.addEventListener("click", clearAllHistory);



//--------> Copy Button styling and Effect


const REMOVE_COPIED = "REMOVE COPY EFFECT FROM ALL BUTTONS";
const ADD_COPIED = "ADD COPIED EFFECT TO ONE BUTTON";

function manageCopiedEffect(mode, element) {
    const copyLinks = document.querySelectorAll(".copy");

    //element argument is not needed when removing Effects
    if (mode === REMOVE_COPIED) {
        copyLinks.forEach(btn => {
            btn.classList.remove("copied");
            btn.innerText = "copy";
        })
    } else if (mode == ADD_COPIED) {
        element.classList.add("copied");
        element.innerText = "copied";
    }
}

function copyToClipBoard(relatedLink) {
    //Copying to clipboard
    if (relatedLink) {
        copyToClipBoard(relatedLink);
    } else {
        copyToClipBoard("Something went wrong...")
    }
}

function copyToClipBoard(text) {
    navigator.clipboard.writeText(text);
}


/*
    Copy headquarters is the center at which 
    all copy actions are taken care of
*/

let timesItRan = 0;
function copyHeadquarters() {
    timesItRan++;
    const copyLinks = document.querySelectorAll(".copy");

    copyLinks.forEach(btn => {
        btn.addEventListener("click", (e) => {
            //Remove Copied Effect From All Buttons
            manageCopiedEffect(REMOVE_COPIED);

            //Find the text in the link related to the btn
            let relatedLink = e.path[1].querySelector(".inputResult").innerText;
            copyToClipBoard(relatedLink);
            //Add Copied Effect to the selected Btn
            manageCopiedEffect(ADD_COPIED, btn);
        })
    })
}

copyHeadquarters();


//Api integration
const input = document.getElementById("input");
const shortenBtn = document.getElementById("shortenBtn");

const EMPTY_INPUT = "USER LEFT THE INPUT FIELD EMPTY";
const INCORRECT_INPUT = "USER HAS INSERTED AN INCORRECT INPUT";
const ALREADY_EXISTS = "THE INPUT ALREADY EXISTS";

function showErrors(mode) {
    if (mode === EMPTY_INPUT) {
        input.placeholder = "Can't Shorten a link if it doesn't exist Empty...";
        alert("Input field is empty...")
    } else if (mode === INCORRECT_INPUT) {
        input.placeholder = "Url is not valid!";
        alert("URL IS NOT VALID!");
    } else if (mode === ALREADY_EXISTS) {
        input.placeholder = "Already Exists";
        alert("The link already exists!");
    }
    input.value = "";
}
async function ingestInput() {
    document.querySelector(".resultsWrapper").scroll(0, 0);

    if (!input.value) {
        return showErrors(EMPTY_INPUT);
    } else if (localStorage.getItem(input.value)) {
        return showErrors(ALREADY_EXISTS);
    }
    loadingTool(SHOW_LOADING);

    let apiCaller = "https://api.shrtco.de/v2/shorten?url=";
    let userInput = input.value;
    try {
        const sendRequest = await fetch(`${apiCaller}${userInput}`);
        const translate = await sendRequest.json();
        var result = await translate.result.short_link;
    } catch {
        return showErrors(INCORRECT_INPUT);
    }

    //oldLink ==> newLink 
    //adding record to local storage
    localStorage.setItem(`${userInput}`, result);
    //adding record to the user Interface history page
    addToHistoryRecords(userInput, result);
    //empty input field
    input.value = "";
    loadingTool(HIDE_LOADING);
}

shortenBtn.addEventListener("click", ingestInput);


const ui_storage = document.querySelector(".resultsWrapper ul");

function addToHistoryRecords(userInput, userResult) {
    let newRecord = document.createElement("li");
    newRecord.className = "list-group-item";
    newRecord.innerHTML = `
        
                <div class="linkResult">
                  <p class="inputHistory">
                    ${userInput}
                  </p>
                  <p class="inputResult">${userResult}</p>
                </div>

                <button class="copy greenBtn ms-auto">Copy</button>
    `;

    ui_storage.prepend(newRecord);
    copyHeadquarters();
    trackAndUpdateStorageNumbers()
    ifEmptyShowMassege();
}

function updateHistoryRecords() {
    if (!localStorage.length) {
        addDefault();
    }
    for (let x = 0; x < localStorage.length; x++) {
        let userInput = localStorage.key(x);
        let userResult = localStorage.getItem(userInput);
        addToHistoryRecords(userInput, userResult);
    }
    trackAndUpdateStorageNumbers()
}

updateHistoryRecords()


//Text Massege in case the storage was empty

function ifEmptyShowMassege() {
    const isEmptyMassege = document.querySelector(".isEmpty");

    //if it's empty
    if (trackAndUpdateStorageNumbers() == 0) {
        isEmptyMassege.classList.remove("hide");
        document.querySelector(".resultsWrapper").scroll(0, 0);
        return false;
    }
    //if not empty
    isEmptyMassege.classList.add("hide");
    return true;
}

ifEmptyShowMassege();

//Loading process once the user submits input

const submitLoading = document.getElementById("toolLoader");
const inputTool = document.getElementById("input");

var SHOW_LOADING = "The tool is processing";
var HIDE_LOADING = "The tool is done";

function loadingTool(mode) {
    if (mode === SHOW_LOADING) {
        submitLoading.style.display = "block";
    } else if (mode === HIDE_LOADING) {
        submitLoading.style.display = "none";
    }
}

function horizontalLoaderPositioning() {
    let inputToolWidth = inputTool.scrollWidth;
    // -------------------------------------------
    submitLoading.style.left = `${inputToolWidth - 75}px`;
}

horizontalLoaderPositioning()

window.addEventListener("resize", () => {
    horizontalLoaderPositioning();
})


// Add default records to history

function addDefault() {
    localStorage.setItem(`https://www.facebook.com/abdullah.nassif`, `shrtco.de/1UrfGP`);
    localStorage.setItem(`https://github.com/AbNassif`, `shrtco.de/A4w7VV`);
}

//download textFile

const exportBtn = document.getElementById("exportTxt");

function fillText(download) {
    console.log("hello");
    let text = "";

    let maxRowLength = 64;
    let star = "*";
    let stars = star.repeat(maxRowLength);
    let underlines = "_".repeat(maxRowLength);
    for (let x = 0; x < localStorage.length; x++) {
        let unshortenedLink = localStorage.key(x);
        let shortenedLink = localStorage.getItem(unshortenedLink);
        let rowNumber = `(${x + 1})`;
        let subtractedStars = star.repeat((maxRowLength - rowNumber.length) / 2)
        //top row
        text += `${subtractedStars} ${rowNumber} ${subtractedStars} \n\n`;
        //records
        text += `-->OLD LINK: ${unshortenedLink} \n\n`;
        text += `-->SHORTENED LINK: ${shortenedLink} \n`;
        //end of row
        text += `${underlines}\n${stars}\n\n\n`;
    }
    return download("Shorter - Your Shortened Links", text);
}
function download(filename, text) {
    console.log("hello");
    var element = document.createElement('a');
    element.setAttribute('href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


exportBtn.addEventListener("click", fillText.bind(this, download));
