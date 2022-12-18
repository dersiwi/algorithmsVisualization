//---------------------------------------------colors

const canvasBackgroundColor = '#816797';
const defaultNodeColor = '#FFFFFF';

const startPointColor = '#0000FF';
const finishPointColor = '#FF0000';
const squareColor = defaultNodeColor;
const obstacleColor = '#000000';
const pathColor = '#FFFF00';
const visited = '#FFA500';
const queuedColor = '#808080';

var drawingColor = obstacleColor;

const msBetweenDraws = 100;



//---------------------------------------------setup global variables 

canvas.addEventListener("mousedown", mouseDownOnCanvas, false);







//----------------------------------------define all classes 
    //convert an rgb-object into its perceived brightnesss
function rgbToLuma(rgb){
        //more accurate formula : Y = 0.2126 R + 0.7152 G + 0.0722 B
        return (2*rgb.r+ rgb.b+3*rgb.g)/6;
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

    getX(){return this.x;}
    getY(){return this.y;}
};

//---------------------------------------variables for algorithm

var grid = [];
var startingPoint = new Coordinate(-1, -1);
var finishingPoint = new Coordinate(-1, -1);

var startingNode = null;
var goalNode = null;


var runDemo = false;

//---------------------------------------setup of the grid


function setupGrid(){
    grid = [];

    var squaresPerRow =  Math.floor((canvas.clientWidth / ratio - squareSpacing) / (squareWidth + squareSpacing));
    var amountSquareRows = Math.floor((canvas.clientHeight / ratio - squareSpacing) / (squareWidth + squareSpacing));
;
    console.log("Squares per row :" + squaresPerRow);
    console.log("X, Y first square : " + (squareSpacing + 0 * (squareWidth + squareSpacing)) + ", " + (squareSpacing + 0 * (squareWidth + squareSpacing)));

    var indexCounter = 0;
    for (rows = 0; rows < amountSquareRows; rows++){
        grid[rows] = [];
        for (columns = 0; columns < squaresPerRow; columns++){
            grid[rows][columns] = new Node(
                x = squareSpacing + columns * (squareWidth + squareSpacing), 
                y = squareSpacing + rows * (squareWidth + squareSpacing), 
                index = indexCounter,
                width=squareWidth, 
                color=defaultNodeColor);
            indexCounter++;
        }
    }
}

function setupGraph(){
    console.log("setting up graph");
    //add all the reachable neighbours -- essentially build the graph
    for (rows = 0; rows < grid.length; rows++){
        for (columns = 0; columns < grid[rows].length; columns++){
            var node = grid[rows][columns];
            node.resetReachbleNodes();
            if (rows - 1 >= 0){
                node.addNeighbour(grid[rows - 1][columns]);
            }
            if (columns - 1 >= 0){
                node.addNeighbour(grid[rows][columns - 1]);
            }
            if (rows + 1 < grid.length){
                node.addNeighbour(grid[rows + 1][columns]);
            }
            if (columns + 1 < grid[rows].length){
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



setupGrid();
draw();

//-------------------------------------------------------------------algorithms 

const AlgorithmToExecute = {
    BFS : 1,
    dijkstra : 2
}
var currentAlgorithm = AlgorithmToExecute.BFS;


function setAlgoBooleans(){
    doAlgorithm = true;
    executeAlgorithm = true;
    algorithmFinished = false;
    executeAlgorithm = true;
}

queue = []
finishNode = null;
algorithmFinished = false;
doAlgorithm = false;
executeAlgorithm = false;
function startAlgorithm(){
    queue = []
    queue.push(startingNode);
    setAlgoBooleans();
}

function finish(node){
    algorithmFinished = true;
    finishNode = node;
}

function doAlgorithmStepBFS(){

    if (queue.length > 0){
        currNode = queue.shift();       //get next node from fifo queue

        neighbours = currNode.getReachableNodes();
        for (i = 0; i < neighbours.length; i++){
            neighbourNode = neighbours[i][0];   //reachable nodes are pair of [node, weight] - weight is irrelevant for BFS
            if (isToBeExplored(neighbourNode)) {

                if (isGoalNode(neighbourNode)){
                    //found the goal node, end algorithm
                    finish(neighbourNode);
                }

                neighbourNode.setParent(currNode);
                neighbourNode.setQueued(true);
                queue.push(neighbourNode);
            }
        }
        if (currNode.color != startPointColor){
            currNode.setVisited(true);
        }
    }
}
function isToBeExplored(node){
    if (node.visited == false && node.queued == false && node.color == defaultNodeColor
        || node.visited == false && node.queued == false && node.color == finishPointColor){
        return true;
    }
    return false;
}


pq = new PriorityQueue();
function startDijkstra(){

    //set all distances of all nodes to infinity
    const infinity = 10000000
    for (i = 0; i < grid.length; i++){
        for (j = 0; j < grid[i].length; j++){
            grid[i][j].currSmallestDistance = infinity;
        }
    }

    pq = new PriorityQueue();
    startingNode.currSmallestDistance = 0;
    pq.enqueue(startingNode, 0);
    setAlgoBooleans();
}

/**
 *  u:= Knoten in Q mit kleinstem Wert in abstand[]
 5          entferne u aus Q                                // für u ist der kürzeste Weg nun bestimmt
 6          für jeden Nachbarn v von u:
 7              falls v in Q:                            // falls noch nicht berechnet
 8                 distanz_update(u,v,abstand[],vorgänger[])   // prüfe Abstand vom Startknoten zu v 
 9      return vorgänger[]
 */
function doAlgorithmStepDijkstra(){
    if (!pq.isEmpty()){
        var pqElement = pq.getMinPrio();
        var currNode = pqElement.item;
        var neighbours = currNode.getReachableNodes();

        for (i = 0; i < neighbours.length; i++){
            neighbourNode = neighbours[i][0];   //reachable nodes are pair of [node, weight]
            weightToNeighbour = neighbours[i][1];
            if (exploreNode(neighbourNode)) {    //node should be looked at
                if (isGoalNode(neighbourNode)){
                    //found the goal node, end algorithm
                    finish(neighbourNode);
                }

                //if we find a queued node, we check if the distance is now cheaper, if yes, we update it.
                if (neighbourNode.queued){
                    newDistance = currNode.currSmallestDistance + currNode.calculateWeight(currNode, neighbourNode);
                    if (newDistance < neighbourNode.currSmallestDistance){
                        neighbourNode.parent = currNode;
                        pq.changePriority(neighbourNode, newDistance);
                    }
                } else{
                    neighbourNode.currSmallestDistance = weightToNeighbour + pqElement.priority;
                    neighbourNode.setParent(currNode);
                    neighbourNode.setQueued(true);
                    pq.enqueue(neighbourNode, neighbourNode.currSmallestDistance);
                }
            }
        }
        if (currNode.color != startPointColor){
            currNode.setVisited(true);
        }
    }
}

function exploreNode(node){
    if (node.visited || node.color == startPointColor || node.color == obstacleColor){
        return false;
    }
    return true;
}

function isGoalNode(node){
    return node.color == finishPointColor;}


function isVisited(node){
    if (node.color == visited || node.color == startPointColor){return true;}
    return false;}

function inQueue(node){
    return node.color == queuedColor;}

function isGoalNode(node){
    return node.color == finishPointColor;}

function drawPathBackwards(){
    if (finishNode != null){
        finishNode.setPathNode(true);
        finishNode = finishNode.parent;
    }
}


//-------------------------------------------------------------------Drawing mode handling 


/**
 * defines the drawing loop
 */
var drawingIntevalID = setInterval(function(){
    draw();
    //doAlgorithm is entered as soon as the algroithm starts
    //executeAlgorithm is true if another step of the algorithm is supposed to be executed
    if (runDemo){
        runDemoStep();
    }
    if (doAlgorithm && executeAlgorithm){
        if (!algorithmFinished){
            switch(currentAlgorithm){
                case AlgorithmToExecute.BFS:
                    doAlgorithmStepBFS();
                     break;
                case AlgorithmToExecute.dijkstra:
                    doAlgorithmStepDijkstra();
                    break;
                default:
                    return;
            }
        } else{
            drawPathBackwards();
        }
    }
}, msBetweenDraws);




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



//------------------------------------------------------------------------------------Event handling functions 

function setStartingPosition(coordinates){
    if (startingNode != null){
        startingNode.color = defaultNodeColor;
    }
    startingPoint = coordinates;
    startingNode = grid[coordinates.y][coordinates.x];
    startingNode.color = startPointColor;
}
function setFinishingPosition(coordinates){
    if (goalNode != null){
        goalNode.color = defaultNodeColor;
    }
    finishingPoint = coordinates;
    goalNode = grid[coordinates.y][coordinates.x];
    goalNode.color = finishPointColor;
}



function mapMouseCoordinateToGridSquare(x, y){
    squareColumn = Math.floor(x / (squareWidth + squareSpacing))
    squareRow = Math.floor(y / (squareWidth + squareSpacing))
    return new Coordinate(squareColumn, squareRow);
}

/*
var startingPoint = new Coordinate(-1, -1);
var finishingPoint = new Coordinate(-1, -1);

var startingNode = null;
var goalNode = null;
*/


function mouseDownOnCanvas(event){
    try{
        position = getMousePositionOnCanvas(event);
        c = mapMouseCoordinateToGridSquare(position.x, position.y);
        node = grid[c.getY()][c.getX()];
        //alert(squareIndexes[0] + " " + squareIndexes[1]);
    
        switch(currentDrawingMode){
            case DrawingMode.SetStartingPoint:
                setStartingPosition(c);
                break;
            
            case DrawingMode.SetFinishingPoint:
                setFinishingPosition(c);
                break;
    
            case DrawingMode.Erase:
                node.setColor(defaultNodeColor);
                break;
    
            case DrawingMode.Draw:
                node.setColor(drawingColor);
                break;
    
            case DrawingMode.LineMode:
                alert("Not implemented yet! Continue  function mouseDownOnCanvas(event).");
                break;
        }
    } catch(error){
        console.error(error);
    }


    draw();
}



//change the drawing mode and set all button-backgrounds to white
function changeDrawingMode(newDrawingMode, id){
    currentDrawingMode = newDrawingMode;
    document.querySelector(currentActiveID).style.color = "black";
    currentActiveID = id;
    document.querySelector(currentActiveID).style.color = "green";
}

//------------------------------------------------------------------------------------------Listener 

document.querySelector('#squareSizeSlider').addEventListener('change', function(){
    changeGridSize(parseInt(document.querySelector('#squareSizeSlider').value, 10));
    setupGrid();
    draw();
}, false);



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
    setupGraph();
    switch(currentAlgorithm){
        case AlgorithmToExecute.BFS:
            startAlgorithm();
            break;
        case AlgorithmToExecute.dijkstra:
            startDijkstra();
            break;
        default:
            return;
    }
    //see way down
}


document.querySelector('#clear').onclick = function(){
    setupGrid();
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


document.querySelector('#bfs').onclick = function(){
    currentAlgorithm = AlgorithmToExecute.BFS;
    document.querySelector('#selectedAlgorithm').innerHTML = "BFS";
}
document.querySelector('#selectdijkstra').onclick = function(){
    currentAlgorithm = AlgorithmToExecute.dijkstra;
    document.querySelector('#selectedAlgorithm').innerHTML = "Dijkstra";
}

//aCOLOR PICKER 
document.querySelector('#drawingColor').addEventListener("change", watchColorPicker, false);

function watchColorPicker(event) {
    drawingColor = event.target.value;
    console.log("Drawing color selected : " + drawingColor);
    changeDrawingMode(DrawingMode.Draw, "#draw");
    currentDrawingMode = DrawingMode.Draw;
}

