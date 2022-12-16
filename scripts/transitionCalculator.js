//aCOLOR PICKER 

const colorPickerOne = document.querySelector('#squareOneColor');
const colorPickerTwo = document.querySelector('#squareTwoColor');
const c1Text = document.querySelector('#colorOneInText');
const c2Text = document.querySelector('#colorTwoInText');
colorPickerOne.addEventListener("change", changeColorOne, false);
colorPickerTwo.addEventListener("change", changeColorTwo, false);

var colorOne = colorPickerOne.value;
var colorTwo = colorPickerTwo.value;
setNewWeight();


function changeColorOne(event) {
    colorOne = event.target.value;
    setNewWeight();
}


function changeColorTwo(event) {
    colorTwo = event.target.value;
    setNewWeight();
}

function setNewWeight(){
    //calculate weight between the two colors 
    n1 = new Node(x=0, y=0, index=0, width=0, color=colorOne);
    n2 = new Node(x=0, y=0, index=0, width=0, color=colorTwo);
    document.querySelector("#weightDisplay").innerHTML = Math.floor(n1.calculateWeight(n1, n2));
    c1Text.style.color = colorOne;
    c2Text.style.color = colorTwo;
    document.quer
}