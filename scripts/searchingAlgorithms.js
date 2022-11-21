
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener("mousedown", mouseDownOnCanvas, false);

var squareWidth = 5;
var squareSpacing = 1;
var amountOfPillors = Math.floor(canvas.width / (squareWidth + squareSpacing));

const scramblingIterations = 100;

//alert(squaresPerRow);
//alert(amountSquareRows);



const visited = 'orange';


//executes the algorithm if true
var executeAlgorithm = true;

//if true, each iteration of the drawing loop, an algorithm step is executed
var doAlgorithm = false;

var insertionSort = false;
var bogoSort = false;
var heapSort = false;



/**
 * defines the drawing loop
 */
var drawingIntevalID = setInterval(function(){
    draw();
    if (doAlgorithm && executeAlgorithm){
        doAlgorithmStep();
    }
}, 10);


var heightArray = [];
buildHeightArray();
draw();
//scrambleHeightArray();


function buildHeightArray(){
    var factor = Math.floor(canvas.height / amountOfPillors);
    for (var i = 0; i < amountOfPillors; i++){
        if (i + 1 < canvas.height){
            heightArray.push((i + 1) * factor);
        }
    }
}



//calculate algorithm
document.querySelector('#calculate').onclick = function(){
    setStarting = false;
    setFinishing = false;
    erase = false;
    drawOnSquares = false;
    doAlgorithm = true;
    executeAlgorithm = true;

    //see way down
}

//stop drawing
document.querySelector('#stopDrawingLoop').onclick = function(){
    clearInterval(drawingIntevalID);
}

document.querySelector('#scramble').onclick = function(){
    scrambleHeightArray();
    draw();
}

/*
document.querySelector('#stopAlgorithm').onclick = function(){
    console.log('Stopped Algorithm');
    executeAlgorithm = false;
}

document.querySelector('#resumeAlgorithm').onclick = function(){
    console.log('Resumed Algorithm');
    executeAlgorithm = true;
}
*/
document.querySelector('#insertionSort').onclick = function(){
    insertionSort = true;
    document.querySelector('#insertionSort').style.background = 'green';
}

document.querySelector('#bogoSort').onclick = function(){
    insertionSort = false;
    bogoSort = true;
    document.querySelector('#insertionSort').style.background = 'white';
    document.querySelector('#bogoSort').style.background = 'green';

}

document.querySelector('#heapSort').onclick = function(){
    insertionSort = false;
    bogoSort = false;
    heapSort = true;
    document.querySelector('#insertionSort').style.background = 'white';
    document.querySelector('#bogoSort').style.background = 'white';
    document.querySelector('#heapSort').style.background = 'green';
}


document.querySelector('#amountBarSlider').addEventListener('change', function(){
    amountBars = parseInt(document.querySelector('#amountBarSlider').value, 10);
    setup(amountBars);

}, false);



//<button type="button" id="stopAlgorithm">Stop Algorithm</button>
//<button type="button" id="resumeAlgorithm">Resume Algorithm</button>
        


function setup(amountBars){
    var newBarWidth = Math.floor(canvas.width / amountBars) - squareSpacing;
    squareWidth = newBarWidth;
    amountOfPillors = amountBars;
    heightArray = [];
    buildHeightArray();
    draw();
    resetHeapSort();
}





/**
 * Detectes a mouse button down event on the canvas and decides what to do based on the 
 * active variabels;
 *      setFinishing
 *      setStarting
 *      erase
 *      drawOnSqaures
 *
 * It modifies the grid, and then calls the draw function
 * @param {*} event 
 */
function mouseDownOnCanvas(event){
    position = getMousePositionOnCanvas(event);
    squareIndexes = mapMouseCoordinateToGridSquare(position.x, position.y);
    //alert(squareIndexes[0] + " " + squareIndexes[1]);
    
    draw();
}


//------------------------------------------------------------------------
//------------------------mouse on canvas methods
//------------------------------------------------------------------------
/**
 * Returns a posiiton object, which contains the position, 
 * of the mouse-click on the canvas
 * @param {*} event 
 * @returns 
 */
function getMousePositionOnCanvas(event){
    var rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

/**
 * Maps mousecoordinates on the canvas to a square on the grid
 * @param {*} x 
 * @param {*} y 
 * @returns 
 */
function mapMouseCoordinateToGridSquare(x, y){
    sqaureColumn = Math.floor(x / (squareWidth + squareSpacing))
    sqaureRow = Math.floor(y / (squareWidth + squareSpacing))
    return [sqaureColumn, sqaureRow];
}

//------------------------------------------------------------------------
//------------------------drawing methods
//------------------------------------------------------------------------

/**
 * Draws all sqaures of the grid on the canvas 
 * @param {} ctx 
 */
 function drawRects(ctx){
    for (var i = 0; i < amountOfPillors; i++){
        fillRect(ctx, i * (squareWidth + squareSpacing), canvas.height - heightArray[i], squareWidth, heightArray[i]);
    }
}

/**
 * Fills a rectangle on ctx with color
 * The upper left corner is (upperX, upperY) 
 */
function fillRect(ctx, upperX, upperY, width, height, color='white'){
    ctx.fillStyle = color;
    ctx.fillRect(upperX, upperY, width, height);
}



/**
 * Draws the backgounr and the squares
 * @returns 
 */
function draw(){
    console.log("Drawing");
    //clearRect(0, 0, canvas.width, canvas.height);

    fillRect(ctx, 0, 0, canvas.width, canvas.height, color='green')
    
    drawRects(ctx);
    return 0;
}








//------------------------------------------calculation of sorting



function scrambleHeightArray(iterations = scramblingIterations){
    for (var i = 0; i < iterations; i++){
        var randomIndex1 = Math.floor(Math.random() * amountOfPillors);
        var randomIndex2 = Math.floor(Math.random() * amountOfPillors);
        swap(randomIndex1, randomIndex2, heightArray);

    }
}

function doAlgorithmStep(){
    if (insertionSort){
        doInsertionSortStep();
    }
    if (bogoSort){
        doBogoSortStep();
    }
    if (heapSort){
        doHeapsortStep();
    }

}

//------------------------------------------------------insertion sort 

function resetInsertionSort(){
    loopVariableiInsertionSort = 1;
    loopVariablejInsertionSort = 1;
}


//vairables for insertion sort
var loopVariableiInsertionSort = 1;
var loopVariablejInsertionSort = 1;



function doInsertionSortStep(){
    var i = loopVariableiInsertionSort;
    var j = loopVariablejInsertionSort;
    if (i < heightArray.length){
        if ((j > 0) && heightArray[j - 1] > heightArray[j]){
            //heightArray[j] = heightArray[j - 1];
            swap(j, j - 1, heightArray);
            loopVariablejInsertionSort -= 1;
        } else{
            //swap(i, j, heightArray);
            //heightArray[loopVariablejInsertionSort] = heightArray[loopVariableiInsertionSort]
            loopVariableiInsertionSort += 1;
            loopVariablejInsertionSort = loopVariableiInsertionSort;
        }
    } else{
        resetInsertionSort();
        executeAlgorithm = false;
    }
}

function insertionSort(A){
    for (var i = 0; i < A.length; i++) {
        j = i;
        //if the position before j is smaller than its prev. position, 
        //swap j with its predecessor until A[j] is in the right place
        while( j > 0 && A[j - 1] > A[j]) {
            swap(A[j - 1], A[j]);
            j = j - 1;
        }
    }
}

//-----------------------------------------------------------bogosort

function doBogoSortStep(){
    if (!isSorted()){
        scrambleHeightArray(1);
    }
}

function isSorted(){
    for (var i = 1; i < heightArray.length; i++){
        if (heightArray[i - 1] > heightArray[i]){
            return false;
        }
    }
    return true;
}

//-----------------------------------------------------------------heapsort
var buildHeapLoopVariable = Math.ceil(heightArray.length / 2);

var currentArrayLength = heightArray.length - 1;

function resetHeapSort(){
    buildHeapLoopVariable = Math.ceil(heightArray.length / 2);
    currentArrayLength = heightArray.length - 1;
}

/**
 * For some reason heapsort doesn't fully work every time its executed.
 * Sometmes, the first 1-3 elements are not fully sorted.
 * But i don't really know why
 */

function doHeapsortStep(){
    if (buildHeapLoopVariable >= 0) {
        //build (max) Heap
        sinkDown(buildHeapLoopVariable, heightArray.length);
        buildHeapLoopVariable -= 1;

    } else{
        //buildHeap is done, now do
        if (currentArrayLength >= 0){
            console.log("Built heap");
            swap(0, currentArrayLength, heightArray);
            currentArrayLength -= 1;
            sinkDown(0, currentArrayLength);
        }else{
            //heapsort is done
            resetHeapSort();
            executeAlgorithm = false;
        }
    }
}



function sinkDown(index, arrayLength){
    //var maxChildIndex = getMaxChild(index, arrayLength);      --this didn't work i actually don't know why (the first 3 elements were not sorted)

    //get the max child index
    var n = arrayLength;
    var maxChildIndex = index;
    var leftChildIndex = index * 2 + 1;
    if (leftChildIndex < n && heightArray[leftChildIndex] > heightArray[index]){
        maxChildIndex = leftChildIndex;
    }
    var rightChildIndex = index * 2 + 2;
    if (rightChildIndex < n && heightArray[rightChildIndex] > heightArray[maxChildIndex]){
        maxChildIndex = rightChildIndex;
    }
    
    
    //actual sinkDown function
    if (maxChildIndex != index){
        swap(maxChildIndex, index, heightArray);
        sinkDown(maxChildIndex, arrayLength);
    }
}




 

function swap(indexOne, indexTwo, array){
    var temp = array[indexOne];
    array[indexOne] = array[indexTwo];
    array[indexTwo] = temp;
}