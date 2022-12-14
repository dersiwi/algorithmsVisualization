//---------------------------------------------colors

const canvasBackgroundColor = '#816797';
const defaultNodeColor = 'white';

const defaultSquareWidth = 3;
var squareSpacing = 1;
var squareWidth = defaultSquareWidth*2;

//---------------------------------------------setup global variables 
const maxCanvasDimension = 900;
const canvas = document.querySelector('#canvas');

canvas.width = getDesiredCanvasDimension(canvas.width);
canvas.height = getDesiredCanvasDimension(canvas.height);


const ctx = canvas.getContext('2d');
//canvas.addEventListener("mousedown", mouseDownOnCanvas, false);


//alert(squaresPerRow);
//alert(amountSquareRows);

function getDesiredCanvasDimension(current){
    console.log("calculating optimal canvas size");
    //return a number closest to currentWidth that is divisible by (squareSpacing + squareWidth*squareSpacing)
    while (current < maxCanvasDimension){
        if(Number.isInteger((current - squareSpacing)/ (squareSpacing + squareWidth))){
            console.log(current);
            return current;
        }
        else{
            current++;
        }
    }
    return current;
}



//----------------------------------------define all classes 



class Node {
    constructor(x, y, width=squareWidth, color=defaultNodeColor){
        this.x = x;
        this.y = y;
        this.width = width;
        this.color = color;
        this.reachableNodes = [];
        this.parent = null;
    }

    addNeighbour(node){
        this.reachableNodes.push(node);
    }

    getReachableNodes(){
        return this.reachableNodes;
    }

    setParent(node){
        this.parent = node;
    }

    draw(){
        console.log(this.color);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.width);
    }
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

//---------------------------------------variables for algorithm

var grid = [];
var startingPoint = new Coordinate(-1, -1);
var finishingPoint = new Coordinate(-1, -1);


//---------------------------------------setup of the grid


function setupGrid(){
    grid = [];

    var squaresPerRow =  Math.floor((canvas.width - squareSpacing) / (squareWidth + squareSpacing));
    var amountSquareRows = Math.floor((canvas.height - squareSpacing) / (squareWidth + squareSpacing));


    for (rows = 0; rows < amountSquareRows; rows++){
        grid[rows] = [];
        for (columns = 0; columns < squaresPerRow; columns++){
            grid[rows][columns] = new Node(
                x = squareSpacing + columns * (squareWidth + squareSpacing), 
                y = squareSpacing + rows * (squareWidth + squareSpacing), 
                width=squareWidth, 
                color=defaultNodeColor);
        }
    }

    //add all the reachable neighbours -- essentially build the graph
    for (rows = 0; rows < amountSquareRows; rows++){
        for (columns = 0; columns < squaresPerRow; columns++){
            var node = grid[rows][columns];
            if (rows - 1 > 0){
                node.addNeighbour(grid[rows - 1][columns]);
            }
            if (columns - 1 > 0){
                node.addNeighbour(grid[rows][columns - 1]);
            }
            if (rows + 1 < amountSquareRows){
                node.addNeighbour(grid[rows + 1][columns]);
            }
            if (columns + 1 < squaresPerRow){
                node.addNeighbour(grid[rows][columns + 1]);
            }
        }
    }

}



function draw(){
    ctx.fillStyle = canvasBackgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (i = 0; i < grid.length; i++){
        for (j = 0; j < grid[i].length; j++){
            grid[i][j].draw();
        }
    }

}

function changeGridSize(multiplier){
    squareWidth = multiplier * (defaultSquareWidth) + (multiplier - 1) * squareSpacing;
    canvas.width = getDesiredCanvasDimension(canvas.width);
    canvas.height = getDesiredCanvasDimension(canvas.height);
    setupGrid();
}

setupGrid();
draw();


//-------------------------------------------------------------------Drawing mode handling 

const DrawingMode = {
    NoDrawing : -1, 
    SetStartingPoint : 0,
    SetFinishingPoint : 1,
    Erase : 2,
    Draw : 3,
    LineMode : 4
}
const defaultDrawingMode = DrawingMode.Draw;
const defaultActiveID = '#draw';
var currentDrawingMode = defaultDrawingMode;
var currentActiveID = defaultActiveID;

//--------------------------------------------------------------------Listener 
document.querySelector('#squareSizeSlider').addEventListener('change', function(){
    changeGridSize(parseInt(document.querySelector('#squareSizeSlider').value, 10));
    setupGrid();
    draw();
}, false);

//change the drawing mode and set all button-backgrounds to white
function changeDrawingMode(newDrawingMode, id){
    currentDrawingMode = newDrawingMode;
    document.querySelector(currentActiveID).style.color = "black";
    currentActiveID = id;
    document.querySelector(currentActiveID).style.color = "green";
}

//set the starting button
document.querySelector('#setStarting').onclick = function(){
    changeDrawingMode(DrawingMode.SetStartingPoint, '#setStarting');

};
//set the finishing button
document.querySelector('#setFinishing').onclick = function(){
    changeDrawingMode(DrawingMode.SetFinishingPoint, '#setFinishing');

};
//activate erase
document.querySelector('#erase').onclick = function(){
    changeDrawingMode(DrawingMode.Erase, "#erase");
};
//draw obstacles 
document.querySelector('#draw').onclick = function(){
    changeDrawingMode(DrawingMode.Draw, "#draw");
    currentDrawingMode = DrawingMode.Draw;
};


//calculate algorithm
document.querySelector('#calculate').onclick = function(){

    doAlgorithm = true;
    executeAlgorithm = true;
    //see way down
}