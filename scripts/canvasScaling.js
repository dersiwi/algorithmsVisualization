const defaultSquareWidth = 10;
var squareSpacing = 1;
var squareWidth = defaultSquareWidth;


const maxCanvasDimension = 900;
const canvas = document.querySelector('#canvas');
const originalCanvasHeight = canvas.height;
const originalCanvasWidth = canvas.width;

canvas.width = getDesiredCanvasDimension(originalCanvasWidth);
canvas.height = getDesiredCanvasDimension(originalCanvasHeight);


const ctx = canvas.getContext('2d');
var ratio = 1;
render();


console.log("Rendering ratio : " + ratio);


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

function getMousePositionOnCanvas(event){
    
    var rect = canvas.getBoundingClientRect(), // abs. size of element
    scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for x
    scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for y
    //console.log("ScaleX, Scale Y : " + (canvas.width / rect.width) + " , " + (canvas.height / rect.height));
    calcX = (event.clientX  - rect.left) * scaleX / ratio;
    calcY = (event.clientY - rect.top) * scaleY / ratio;
    //console.log("x : " + calcX + "\n" + "y : " + calcY);
    return {
        x: calcX ,   // scale mouse coordinates after they have
        y: calcY    // been adjusted to be relative to element
    }
    /*
    var rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX * ratio - rect.left,
      y: event.clientY * ratio - rect.top
    };
    */
}


function changeGridSize(multiplier){
    squareWidth = multiplier * (defaultSquareWidth) + (multiplier - 1) * squareSpacing;
    canvas.width = getDesiredCanvasDimension(originalCanvasWidth);
    canvas.height = getDesiredCanvasDimension(originalCanvasHeight);
    render();
    setupGrid();
}



function render() {
    oWidth = canvas.width; oHeight = canvas.height;
    let dimensions = getObjectFitSize(
        true,
        canvas.clientWidth,
        canvas.clientHeight,
        canvas.width,
        canvas.height
    );
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    ratio = Math.min(
        canvas.clientWidth / oWidth,
        canvas.clientHeight / oHeight
    );
    ctx.scale(ratio, ratio); //adjust this!
}

// adapted from: https://www.npmjs.com/package/intrinsic-scale
function getObjectFitSize(
  contains /* true = contain, false = cover */,
  containerWidth,
  containerHeight,
  width,
  height
) {
  var doRatio = width / height;
  var cRatio = containerWidth / containerHeight;
  var targetWidth = 0;
  var targetHeight = 0;
  var test = contains ? doRatio > cRatio : doRatio < cRatio;

  if (test) {
    targetWidth = containerWidth;
    targetHeight = targetWidth / doRatio;
  } else {
    targetHeight = containerHeight;
    targetWidth = targetHeight * doRatio;
  }

  return {
    width: targetWidth,
    height: targetHeight,
    x: (containerWidth - targetWidth) / 2,
    y: (containerHeight - targetHeight) / 2
  };
}