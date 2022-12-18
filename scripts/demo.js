//-----------------------demonstration

/**
 * How it works;
 *      1. Setup the demonstration; what this means is a list of [node, color] is created
 *          This is done bei either the funciton setupDemo() or setupDemoLine(). The difference in these two is
 *          the pattern they create on the grid. 
 *          They also set the starting and endpoint. As of now they do not select an algorithm.
 * 
 *      2. runDemo = true
 *          This means that in the interval, defined in shortestPaths2.js the boolean runDemo == true.
 *          In which case the interval will call the funciton runDemoStep() every loop.
 * 
 *      3. runDemoStep()
 *          See explanation of the method below. Essentially this method r
 */

var colors = [obstacleColor, "#865e3c", "#e66100", "#2ec27e"];
var nodesAndColors = []; // contians a list of [node, color] which is iterated through by the demo
const maxRadius = Math.floor(grid.length / 3);
var currentStage = 0;

var startingPointCoordinates = null;
var finishPointCoordinate = null;


document.querySelector('#startDemo').onclick = function(){


    /*
    //Choose random demo and setupthis way
    demotype = Math.floor(Math.random() * 2);
    switch(demotype){
        case 0:
            setupDemo();
            break;
        case 1:
            setupDemoLine();
            break;
        default:
            setupDemo();
    }

    */
    setupDemoLine();
    document.getElementById("beginningOfVisualization").scrollIntoView({behavior: 'smooth'});
    runDemo = true;
}

function resetDemo(){
    currentStage = 0;
    nodesAndColors = [];
}

function setupDemo(){
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
    radiusCounter = 0;
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
        
        
        if (Math.floor(Math.pow(2, radiusCounter + 1)) <= layerCounter){
            layerCounter = 0;
            radiusCounter++;
        }
    }

    //reset their colors to white 
    for (i = 0; i < nodesAndColors.length; i++){
        nodesAndColors[i][0].color = defaultNodeColor;
    }
    startingPointCoordinates = new Coordinate(2,2);
    finishPointCoordinate = new Coordinate(grid[grid.length - 1].length - 1,grid.length - 1);
}

function setupDemoLine(){
    middleIndex = Math.floor(grid.length / 2);
    startingPointCoordinates = new Coordinate(Math.floor(grid[0].length / 2), 0);
    finishPointCoordinate = new Coordinate(Math.floor(grid[0].length / 2), grid.length - 1);
    squaresPerColor = Math.floor(grid[middleIndex].length / colors.length);
    squaresPerColorCounter = 0;
    counter = 0;
    for (var i = 0; i < grid[middleIndex].length; i++){
        for (j = -1; j <= 1; j++){
            nodesAndColors.push([grid[middleIndex + j][i], colors[counter]]);
            
        }
        console.log("color  : " + colors[counter]);
        squaresPerColorCounter++;
        if (squaresPerColorCounter >= squaresPerColor){
            counter++;
            squaresPerColor = 0;
        }
        if (counter >= colors.length){//this sould never be true but just in case
            counter = 0; squaresPerColorCounter = 0;}
    }
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
        setStartingPosition(startingPointCoordinates);
        currentStage++;
    }

    if (currentStage == 2){
        //set finishing point
        setFinishingPosition(finishPointCoordinate);
        currentStage++;
    }

    if (currentStage == 3){
        //reset demo
        runDemo = false;
        resetDemo();

        //start algorithm
    }



    //fill the circle with colors

    //find a starting position 
    //find a finishing posiiton

    //start the algoithm
}
