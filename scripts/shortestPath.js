
const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
canvas.addEventListener("mousedown", mouseDownOnCanvas, false);

var squareWidth = 10;
const squareSpacing = 1;
var squaresPerRow = calculateSquaresPerRow();
var amountSquareRows = calculateAmountRows();
//alert(squaresPerRow);
//alert(amountSquareRows);

function calculateSquaresPerRow(newSquareWidth = squareWidth){
    return Math.floor(canvas.width / (squareWidth + squareSpacing));
}

function calculateAmountRows(newSquareWidth = squareWidth){
    console.log("Amount square rows : " + canvas.height + "/" + (newSquareWidth + squareSpacing) + " = "  + Math.floor(canvas.height / (newSquareWidth + squareSpacing)));
    return Math.floor(canvas.height / (newSquareWidth + squareSpacing));
}

var positionStarting = [-1, 0];
var positionFinishing = [-1, 0];


//definition of colors
const startPointColor = 'blue';
const finishPointColor = 'red';
const squareColor = 'white';
const obstacleColor = 'black';
const pathColor = 'yellow';
const visited = 'orange';


//tells, if a starting location has been set
var setStarting = false;

//tells, if a finishing location has been set
var setFinishing = false;

//if erase == true, any sqaure that will be clicked is going to be white again (see mouseOnCnvas)
var erase = false;

//if true, an obstacle is going to be drawn on the canvas
var drawOnSquares = true;

//executes the algorithm if true
var executeAlgorithm = true;

//if true, each iteration of the drawing loop, an algorithm step is executed
var doAlgorithm = false;

//if activated, the user can set a starting point. The second time he clicks, a line is calculated between the points and drawn on the grid
var lineMode = false;
var lineBegin = [-1, -1]
var lineEnding = [-1, -1]



/**
 * defines the drawing loop
 */
var drawingIntevalID = setInterval(function(){
    draw();
    if (doAlgorithm && executeAlgorithm){
        doAlgorithmStepBFS();
    }
}, 10);


/**
 * Holds the grid[rowamount][columnsPerRows] = color
 */
var grid = [];

/**
 * The parent grid is a grid, which is set up by the bfs
 * it holds parentGird[nodeRow][nodeColumn] = [parent(node).row, parent(node).column]
 */
var parentGrid = [];

/**
 * The global queue, used for bfs 
 */
var queue = [positionStarting];

/**
 * this variable holds the path node that is furthest away from the starting point and has not yet been drawn
 */
var pathEndNode = positionFinishing;

buildGrid();
buildParentGrid();
//resetAlgorithm();


//-----------------------------------------------------------------button listener 
//set the starting button
document.querySelector('#setStarting').onclick = function(){
    setStarting = true;
    setFinishing = false;
    erase = false;
    drawOnSquares = false;
};
//set the finishing button
document.querySelector('#setFinishing').onclick = function(){
    setFinishing = true;
    setStarting = false;
    erase = false;
    drawOnSquares = false;
};
//activate erase
document.querySelector('#erase').onclick = function(){
    setStarting = false;
    setFinishing = false;
    erase = true;
    drawOnSquares = false;
};
//draw obstacles 
document.querySelector('#draw').onclick = function(){
    setStarting = false;
    setFinishing = false;
    erase = false;
    drawOnSquares = true;
};
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

document.querySelector('#clear').onclick = function(){
    buildGrid();
    doAlgorithm = false;
    resetAlgorithm();
}

document.querySelector('#stopAlgorithm').onclick = function(){
    console.log('Stopped Algorithm');
    executeAlgorithm = false;
}

document.querySelector('#resumeAlgorithm').onclick = function(){
    console.log('Resumed Algorithm');
    executeAlgorithm = true;
}

document.querySelector('#resetAlgorithm').onclick = function(){
    for (row = 0; row < grid.length; row++){
        for (column = 0; column < grid[row].length; column++){
            if (grid[row][column] == pathColor || grid[row][column] == visited){
                grid[row][column] = squareColor;
            } 
        }
    }
    doAlgorithm = false;
    resetAlgorithm();
}

document.querySelector('#drawLine').onclick = function(){
    setStarting = false;
    setFinishing = false;
    erase = false;
    drawOnSquares = false;

    //toggle line mode
    if (lineMode){
        lineMode = false;
        document.querySelector('#drawLine').style.background = 'white';

    } else{
        lineMode = true;
        document.querySelector('#drawLine').style.background = 'green';
    }
    lineBegin = [-1, -1];
    lineEnding = [-1, -1];
    //see way down
}


//----------------------------slider listener

document.querySelector('#squareSizeSlider').addEventListener('change', function(){
    squareWidth = parseInt(document.querySelector('#squareSizeSlider').value, 10);
    grid = [];
    squaresPerRow = calculateSquaresPerRow(squareWidth);
    amountSquareRows = calculateAmountRows(squareWidth);
    buildGrid();
    buildParentGrid();
}, false);


//<button type="button" id="stopAlgorithm">Stop Algorithm</button>
//<button type="button" id="resumeAlgorithm">Resume Algorithm</button>
        





/**
 * Initializes the grid by placing 'white' (the defaultSquareColor) inside each square
 * @param {*} defaultSquareColor 
 */
function buildGrid(defaultSquareColor='white'){
    for (rows = 0; rows < amountSquareRows; rows++){
        grid[rows] = [];
        for (columns = 0; columns < squaresPerRow; columns++){
            grid[rows][columns] = defaultSquareColor;
        }
    }
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
    if (setStarting){
        //invalidate old starting position
        if (positionStarting[0] != -1){
            grid[positionStarting[0]][positionStarting[1]] = squareColor;
        }

        grid[squareIndexes[1]][squareIndexes[0]] = startPointColor;
        positionStarting[0] = squareIndexes[1];
        positionStarting[1] = squareIndexes[0];
    }
    else if (setFinishing){

        if (positionFinishing[0] != -1){
            grid[positionFinishing[0]][positionFinishing[1]] = squareColor;
        }

        grid[squareIndexes[1]][squareIndexes[0]] = finishPointColor;
        positionFinishing[0] = squareIndexes[1];
        positionFinishing[1] = squareIndexes[0];
    }
    else if (erase){
        grid[squareIndexes[1]][squareIndexes[0]] = squareColor;
    }
    else if (drawOnSquares){
        grid[squareIndexes[1]][squareIndexes[0]] = obstacleColor;
    } else if(lineMode){
        if (lineBegin[0] == -1){
            lineBegin = [squareIndexes[1], squareIndexes[0]];
            grid[squareIndexes[1]][squareIndexes[0]] = obstacleColor;
        } else{
            lineEnding = [squareIndexes[1], squareIndexes[0]];
            drawLineOnGrid();
            lineBegin = [-1, -1];
            lineEnding = [-1, -1];
            
        }
    }
    draw();
}

function drawLineOnGrid(){
    //draw horizontal line
    if (lineBegin[0] == lineEnding[0]){
        for (i = lineBegin[1]; i <= lineEnding[1]; i++){
            grid[lineBegin[0]][i] = obstacleColor;
        }
    }
    //draw vertical line
    else if (lineBegin[1] == lineEnding[1]){
        for (i = lineBegin[0]; i <= lineEnding[0]; i++){
            grid[i][lineBegin[1]] = obstacleColor;
        }
    }
    //draw diagonal line 
    else{
        //get the greatest distance of the two distances to travel (vertical and horizontal)
        //in order to iterate over the greater distance 
        var iterationBegin = 0;
        var iterationEnding = 0;
        var diagonalCounter = 0;
        if (lineEnding[0] - lineBegin[0] >= lineEnding[1] - lineBegin[1]){
            iterationBegin = lineBegin[0];
            iterationEnding = lineEnding[0];
        } else{
            iterationBegin = lineBegin[1];
            iterationEnding = lineEnding[1];
        }
        
        for (i = iterationBegin; i <= iterationEnding; i++){
            grid[i][diagonalCounter] = obstacleColor;
            if (diagonalCounter <= lineEnding[1]){
                diagonalCounter++;
            }
        }


        var diagonalCounterOne = lineBegin[1];
        var diagonalCounterTwo = lineBegin[0];
        for (i = lineBegin[0]; i <= lineEnding[0]; i++){
            grid[i][diagonalCounterOne] = obstacleColor;
            if (diagonalCounterOne <= lineEnding[1]){
                diagonalCounterOne++;
            }
        }
    }
}

function max(n, m){
    if (n >= m){
        return n;
    }else{
        return m;
    }
}


function min(n, m){
    if (n <= m){
        return n;
    }else{
        return m;
    }
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
 function drawSquares(ctx){
    for (rows = 0; rows < grid.length; rows++){
        //fillRect(ctx, rows, columns, squareWidth, squareWidth, grid[rows][columns]);
        
        for (columns = 0; columns < grid[rows].length; columns++){
            beginY = columns * (squareWidth) + (columns - 1) * (squareSpacing);
            beginX = rows * (squareWidth) + (rows - 1) * (squareSpacing);
            
            if (beginX >= canvas.width || beginY >= canvas.width){continue;}
            fillRect(ctx, beginY, beginX, squareWidth, squareWidth, grid[rows][columns]);
        }
        
        //alert(rows);

    }
}

/**
 * Fills a rectangle on ctx with color
 * The upper left corner is (upperX, upperY) 
 * @param {*} ctx 
 * @param {*} upperX 
 * @param {*} upperY 
 * @param {*} width 
 * @param {*} height 
 * @param {*} color 
 */
function fillRect(ctx, upperX, upperY, width, height, color='white') {
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
    
    drawSquares(ctx);
    return 0;
}



draw();





//------------------------------------------calculation of shortest path 
function calculateShortestPath(){
    if (positionStarting[0] == -1 || grid[positionStarting[0]][positionStarting[1]] != startPointColor){
        alert("No starting point set.");
        return;
    }
    breitenSuche();
    intervalDrawing = true;
}




function resetAlgorithm(){
    queue = [positionStarting];
    pathEndNode = positionFinishing;
    buildParentGrid();
}

function buildParentGrid(){
    for ( rows = 0; rows < amountSquareRows; rows++){
        parentGrid[rows] = [];
        for ( columns = 0; columns < squaresPerRow; columns++){
            parentGrid[rows][columns] = [-1, 0];
        }
    }
}

function doAlgorithmStepBFS(){
    if (queue.length > 0){
        currentNode = queue.shift();
        nodeY = currentNode[0];
        nodeX = currentNode[1];

        //get upper neighbour
        if (visitNode(nodeY, nodeX, 0, -1) ||
            visitNode(nodeY, nodeX, 0, 1) ||
            visitNode(nodeY, nodeX, - 1, 0)||
            visitNode(nodeY, nodeX, 1, 0))
            {
                console.log("Found the end node");
                queue = [];
                pathEndNode = [nodeY, nodeX];
            }

    } else{
        //draw the path from the goal node to the beginning node
        if (grid[pathEndNode[0]][pathEndNode[1]] != startPointColor) {
            grid[pathEndNode[0]][pathEndNode[1]] = pathColor;
            pathEndNode = parentGrid[pathEndNode[0]][pathEndNode[1]];
        }

    }
}

function visitNode(nodeY, nodeX, xDirection, yDirection){
    neighbourX = nodeX + xDirection;
    neighbourY = nodeY + yDirection;
    console.log(neighbourX);
    console.log(neighbourY);
    if (neighbourX < squaresPerRow && neighbourX >= 0
        && neighbourY < amountSquareRows && neighbourY >= 0){
            
            if (grid[neighbourY][neighbourX] == finishPointColor){
                pathEndNode = [neighbourY, neighbourX];
                //found the finishing point
                return true;
            }

            if (grid[neighbourY][neighbourX] == squareColor){
                //bfs stuff
                queue.push([neighbourY, neighbourX]);
                grid[neighbourY][neighbourX] = visited;

                //parent grid for shortest path 
                parentGrid[neighbourY][neighbourX] = [nodeY, nodeX];
            }
    }
    return false;
}

