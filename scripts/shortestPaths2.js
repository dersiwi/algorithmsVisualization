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

const defaultSquareWidth = 3;
var squareSpacing = 1;
var squareWidth = defaultSquareWidth*7;

//---------------------------------------------setup global variables 
const maxCanvasDimension = 900;
const canvas = document.querySelector('#canvas');
const originalCanvasHeight = canvas.height;
const originalCanvasWidth = canvas.width;

canvas.width = getDesiredCanvasDimension(originalCanvasWidth);
canvas.height = getDesiredCanvasDimension(originalCanvasHeight);


const ctx = canvas.getContext('2d');
canvas.addEventListener("mousedown", mouseDownOnCanvas, false);



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
    //convert an rgb-object into its perceived brightnesss
function rgbToLuma(rgb){
        //more accurate formula : Y = 0.2126 R + 0.7152 G + 0.0722 B
        return (2*rgb.r+ rgb.b+3*rgb.g)/6;
    }


class Node {
    constructor(x, y, index, width=squareWidth, color=defaultNodeColor){
        this.x = x;
        this.y = y;
        this.index = index;
        this.width = width;
        this.color = color;
        this.reachableNodes = [];
        this.parent = null;
    }

    setColor(color){
        this.color = color;
    }

    addNeighbour(node){
        this.reachableNodes.push([node, this.calculateWeight(this, node)]);       
    }

    

    //calculates the weight of the edge between node1 and node 2 based on their color.
    calculateWeight(node1, node2) {
        console.log("Calculating weight");
        //the weight between two nodes is their difference in brightness 
        var node1Brightness = rgbToLuma(node1.getColorAsRGB());
        var node2Brightness = rgbToLuma(node2.getColorAsRGB());
        var weightOfNodes = (255 + (node1Brightness - node2Brightness)) / 2;
        console.log(weightOfNodes);
        return weightOfNodes;
    }



    getColorAsRGB(){
        //source  : https://stackoverflow./questions/5623838/rgb-to-hex-and-hex-to-rgb
        var result = /^#?([a-f\d]{2})([a-f\dcom]{2})([a-f\d]{2})$/i.exec(this.color);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }


    getReachableNodes(){
        return this.reachableNodes;
    }

    setParent(node){
        this.parent = node;
    }

    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.width);
    }
};


class PriorityQueue{

    constructor(){
        this.items = []; 
    }

    //this is absoloute garbage! - it should be implemented using a binary tree
    enqueue(element, priority)
    {
        // creating object from queue element
        var qElement = new PriorityQueueElement(element, priority);
        var contain = false;
    
        // iterating through the entire
        // item array to add element at the
        // correct location of the Queue
        for (var i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > qElement.priority) {
                // Once the correct location is found it is
                // enqueued
                this.items.splice(i, 0, qElement);
                contain = true;
                break;
            }
        }
    // if the element have the highest priority
    // it is added at the end of the queue
        if (!contain) {
            this.items.push(qElement);
        }
    }

    deleteElement(element)
    {
        for (var i = 0; i < this.items.length;i++){
            if (this.items[i].item.index == element.index){
                this.items.splice(i, 1);
            }
        }
    }

    //completely disregarding runtime at this point... 
    changePriority(element, newPriority){
        this.deleteElement(element);
        this.enqueue(element, newPriority);
    }

    getMinPrio(){
        return this.items.shift();
    }

    isEmpty(){
        return this.items.length == 0;
    }
    

    getPrio(element){
        for (var i = 0; i < this.items.length;i++){
            if (this.items[i].item.index == element.index){
                return this.items[i].priority;
            }
        }
        return 10000;
    }
}

class PriorityQueueElement{
    constructor(item, priority){
        this.item = item;
        this.priority = priority;
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

    var squaresPerRow =  Math.floor((canvas.width - squareSpacing) / (squareWidth + squareSpacing));
    var amountSquareRows = Math.floor((canvas.height - squareSpacing) / (squareWidth + squareSpacing));

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
            if (rows - 1 >= 0){
                node.addNeighbour(grid[rows - 1][columns]);
            }
            if (columns - 1 >= 0){
                node2 = 
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

function changeGridSize(multiplier){
    squareWidth = multiplier * (defaultSquareWidth) + (multiplier - 1) * squareSpacing;
    canvas.width = getDesiredCanvasDimension(originalCanvasWidth);
    canvas.height = getDesiredCanvasDimension(originalCanvasHeight);
    setupGrid();
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
    setupGraph();
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
                neighbourNode.color = queuedColor;
                queue.push(neighbourNode);
            }
        }
        if (currNode.color != startPointColor){
            currNode.color = visited;
        }
    }
}
function isToBeExplored(node){
    if (node.color == defaultNodeColor || node.color == finishPointColor) {
        console.log("Exploring node color : " + node.color);
        return true;
    }    
    console.log("NOT exploring node color : " + node.color);
    return false;
}


pq = new PriorityQueue();
function startDijkstra(){
    
    setupGraph();
    pq = new PriorityQueue();
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

                //if we find a queued node, we check if the distance is now cheaper, if yes, we update it.
                if (neighbourNode.color == queuedColor && 
                    pqElement.priority + currNode.calculateWeight(currNode, neighbourNode) < pq.getPrio(neighbourNode)){
                    neighbourNode.parent = currNode;
                    pq.changePriority(neighbourNode, currNode.calculateWeight(currNode, neighbourNode));
                }
                
                if (isGoalNode(neighbourNode)){
                    //found the goal node, end algorithm
                    finish(neighbourNode);
                }

                neighbourNode.setParent(currNode);
                neighbourNode.color = queuedColor;
                pq.enqueue(neighbourNode, weightToNeighbour + pqElement.priority);
            }
        }
        if (currNode.color != startPointColor){
            currNode.color = visited;
        }
    }
}

function exploreNode(node){
    if (node.color == visited || node.color == startPointColor || node.color == obstacleColor){
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
        finishNode.color = pathColor;
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

function getMousePositionOnCanvas(event){
    var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y

    return {
        x: (event.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (event.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
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

//-----------------------demonstration

var colors = [obstacleColor, "#865e3c", "#e66100", "#2ec27e"];
var nodesAndColors = []; // contians a list of [node, color] which is iterated through by the demo
const maxRadius = Math.floor(grid.length / 3);
var currentStage = 0;

document.querySelector('#startDemo').onclick = function(){
    setupGrid();
    setupGraph();
    //setup demonstration
    demoCentercircle = [Math.floor(grid.length / 2), Math.floor(grid[0].length / 2)];
    //calculate the squares that are supposed to be colored
    radius = colors.length;
    bfsqueue = []
    startingNode = grid[demoCentercircle[0]][demoCentercircle[1]];
    bfsqueue.push(startingNode);
    nodesAndColors.push([startingNode, colors[0]]);
    startingNode.color = visited;
    radiusCounter =0;
    layerCounter = 0;
    while (radiusCounter < radius){
        var currNode = bfsqueue.shift();
        var neighbours = currNode.getReachableNodes();
        for (i = 0; i < neighbours.length; i++){
            neighbourNode = neighbours[i][0];
            if (neighbourNode.color != visited){
                bfsqueue.push(neighbourNode);
                nodesAndColors.push([neighbourNode, colors[radiusCounter]]);
                neighbourNode.color = visited;
                layerCounter++;
            }
        }
        
        
        if (Math.floor(Math.pow(2, radiusCounter)) <= layerCounter){
            layerCounter = 0;
            radiusCounter++;
        }
    }

    //reset their colors to white 
    for (i = 0; i < nodesAndColors.length; i++){
        nodesAndColors[i][0].color = defaultNodeColor;
    }

    runDemo = true;
}

function runDemoStep(){
    
    if (currentStage == 0){
        currNodePair = nodesAndColors.shift();
        currNodePair[0].color = currNodePair[1];
        if (nodesAndColors.length == 0){
            currentStage++;
        }
    }
    if (currentStage == 1){
        //set starting point
        setStartingPosition(new Coordinate(2, 2));
        currentStage++;
    }

    if (currentStage == 2){
        //set finishing point
        setFinishingPosition(new Coordinate(grid[grid.length - 1].length - 1,grid.length - 1));
        currentStage++;
    }

    if (currentStage == 3){
        //start algorithm
        runDemo = false;
    }

    //fill the circle with colors

    //find a starting position 
    //find a finishing posiiton

    //start the algoithm
}
