
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
    return Math.floor(canvas.width / (newSquareWidth + squareSpacing));
}

function calculateAmountRows(newSquareWidth = squareWidth){
    console.log("Amount square rows : " + canvas.height + "/" + (newSquareWidth + squareSpacing) + " = "  + Math.floor(canvas.height / (newSquareWidth + squareSpacing)));
    return Math.floor(canvas.height / (newSquareWidth + squareSpacing));
}


/**
 * Coordinate class is mainly used for storing indexes of a square in the grid.
 * So the way to interpret coordiantes 
 */
class Coordinate{
    constructor(gridIndexX, gridIndexY){
        this.x = gridIndexX;
        this.y = gridIndexY;
    }
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


const DrawingMode = {
    NoDrawing : -1, 
    SetStartingPoint : 0,
    SetFinishingPoint : 1,
    Erase : 2,
    Draw : 3,
    LineMode : 4
}
const defaultDrawingMode = DrawingMode.Draw;
var currentDrawingMode = defaultDrawingMode;
var currentDrawingElementActive = NaN;


//executes the algorithm if true
var executeAlgorithm = true;

//if true, each iteration of the drawing loop, an algorithm step is executed
var doAlgorithm = false;



//indicates if the algorithm has finished 
var algorithmFinished = false;

//indicates if the path has been drawn
var pathDrawingFinished = false;


/**
 * defines the drawing loop
 */
var drawingIntevalID = setInterval(function(){
    draw();
    if (doAlgorithm && executeAlgorithm){
        if (!algorithmFinished){
            doAlgorithmStepBFS();
        } else{
            drawPathBackwards();
        }
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

//-------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------button listener 
//-------------------------------------------------------------------------------------------------------------------------------------------------------

//set the starting button
document.querySelector('#setStarting').onclick = function(){
    changeDrawingMode(DrawingMode.SetStartingPoint, document.querySelector('#setStarting'));

};
//set the finishing button
document.querySelector('#setFinishing').onclick = function(){
    changeDrawingMode(DrawingMode.SetFinishingPoint, document.querySelector('#setFinishing'));

};
//activate erase
document.querySelector('#erase').onclick = function(){
    changeDrawingMode(DrawingMode.Erase, document.querySelector('#erase'));
};
//draw obstacles 
document.querySelector('#draw').onclick = function(){
    changeDrawingMode(DrawingMode.Draw, document.querySelector('#draw'));
    currentDrawingMode = DrawingMode.Draw;
};
//calculate algorithm
document.querySelector('#calculate').onclick = function(){
    changeDrawingMode(DrawingMode.NoDrawing, document.querySelector('#calculate'));

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

document.querySelector('#stopAlgorithm').onclick = function() {
    console.log('Stopped Algorithm');
    executeAlgorithm = false;
}

document.querySelector('#resumeAlgorithm').onclick = function(){
    console.log('Resumed Algorithm');
    executeAlgorithm = true;
}

document.querySelector('#resetAlgorithm').onclick = function(){
    /**
     * 
     */
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
    changeDrawingMode(DrawingMode.LineMode, document.querySelector('#drawLine'));

    lineBegin = [-1, -1];
    lineEnding = [-1, -1];
    //see way down
}

function changeDrawingMode(newDrawingMode, elementToChange){
    /*
    if (currentDrawingElementActive != NaN) {
        currentDrawingElementActive.style.background = 'white';
    }

    if (newDrawingMode != DrawingMode.NoDrawing){
        currentDrawingElementActive = elementToChange;
        elementToChange.style.background = 'green';
    } 
    */

    currentDrawingMode = newDrawingMode;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------button listener 
//-------------------------------------------------------------------------------------------------------------------------------------------------------

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


//-------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------gird-interaction
//-------------------------------------------------------------------------------------------------------------------------------------------------------


/**
 * Detectes a mouse button down event on the canvas and decides what to do based on the 
 * active variabels;
 *      setFinishing
 *      setStarting
 *      erase
 *      drawOnSqaures
 *      lineMode
 *
 * It modifies the grid, and then calls the draw function
 * @param {*} event 
 */
function mouseDownOnCanvas(event){
    position = getMousePositionOnCanvas(event);
    squareIndexes = mapMouseCoordinateToGridSquare(position.x, position.y);
    //alert(squareIndexes[0] + " " + squareIndexes[1]);

    switch(currentDrawingMode){
        case DrawingMode.SetStartingPoint:
            setStartingPosition(squareIndexes);
            break;
        
        case DrawingMode.SetFinishingPoint:
            setFinishingPosition(squareIndexes);
            break;

        case DrawingMode.Erase:
            grid[squareIndexes[1]][squareIndexes[0]] = squareColor;
            break;

        case DrawingMode.Draw:
            grid[squareIndexes[1]][squareIndexes[0]] = obstacleColor;
            break;

        case DrawingMode.LineMode:
            doLineMode(squareIndexes);
            break;
    }

    draw();
}

function doLineMode(squareIndexes){
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



function setStartingPosition(squareIndexes){
    //invalidate old starting position
    if (positionStarting[0] != -1){
        grid[positionStarting[0]][positionStarting[1]] = squareColor;
    }

    grid[squareIndexes[1]][squareIndexes[0]] = startPointColor;
    positionStarting[0] = squareIndexes[1];
    positionStarting[1] = squareIndexes[0];
}

function setFinishingPosition(squareIndexes){
    if (positionFinishing[0] != -1){
        grid[positionFinishing[0]][positionFinishing[1]] = squareColor;
    }

    grid[squareIndexes[1]][squareIndexes[0]] = finishPointColor;
    positionFinishing[0] = squareIndexes[1];
    positionFinishing[1] = squareIndexes[0];
}

/**
 * Draw a line on the grid 
 * Given a starting point (lineBegin) and an endpoint (lineEnding), 
 * the line is drawn by giving every square between these two points a color 
 */
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
        //TODO : Implement
    }
}



//-------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------mouse on canvas
//-------------------------------------------------------------------------------------------------------------------------------------------------------
/**
 * Returns a posiiton object, which contains the position, 
 * of the mouse-click on the canvas (relative to the canvas upper left corner)
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

//-------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------drawing 
//-------------------------------------------------------------------------------------------------------------------------------------------------------

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




//-------------------------------------------------------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------calculation of shortest Path (BFS) 
//-------------------------------------------------------------------------------------------------------------------------------------------------------



/**
 * Resets the algorithm in order to re-rexecute it 
 */
function resetAlgorithm() {
    queue = [positionStarting];
    pathEndNode = positionFinishing;
    buildParentGrid();
}

/**
 * Builds (setup) the parent grid 
 * The parent grid stores the parent of each node in the node
 */
function buildParentGrid() {
    for ( rows = 0; rows < amountSquareRows; rows++){
        parentGrid[rows] = [];
        for ( columns = 0; columns < squaresPerRow; columns++){
            parentGrid[rows][columns] = [-1, 0];
        }
    }
}

/**
 * Executes one algorithm step of the bfs 
 * 
 * BFS is basically :
 * 
 *      while(queue != []){
 *             doAlgorithmStepBFS();
 *      }
 */
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
                algorithmFinished = true;
            }

    } 
}

/**
 * Visits the node grid[nodeY + YDirection][nodeX + xDirection]
 * xDirection and yDirection should be  0, 1 or -1
 * So visit node looks at the top, bottom, left or right neighbour of node 
 * 
 * 
 * If a node is visited it is colored, and its parent added to the parentGrid 
 * 
 * 
 * @returns true, if grid[nodeY + YDirection][nodeX + xDirection] is the finishing node, false if not
 */
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

/**
 * Draws the path backwards by coloring the node stored in pathEndNode
 * The pathendnode is always the uncolored node on the shortest path, furthest away from the starting point
 * 
 * When colored, the pathEndnode is then updated to the parent of pathEndNode (which is stored in the parent grid)
 */
function drawPathBackwards(){
    //draw the path from the goal node to the beginning node
    if (grid[pathEndNode[0]][pathEndNode[1]] != startPointColor) {
        grid[pathEndNode[0]][pathEndNode[1]] = pathColor;
        pathEndNode = parentGrid[pathEndNode[0]][pathEndNode[1]];
    }
}
