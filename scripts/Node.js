

class Node {
    constructor(x, y, index, width=squareWidth, color=defaultNodeColor){
        this.x = x;
        this.y = y;
        this.index = index;
        this.width = width;
        this.color = color;
        this.reachableNodes = [];
        this.parent = null;
        this.currSmallestDistance = 0;

        this.visited = false;
        this.queued = false;
        this.isPathNode = false;

        this.circleCenter = this.calcCircleCenter(); //[x, y]
        this.circleRadius = Math.floor(this.width / 2) - 2;
        
    }

    calcCircleCenter(){
        x = this.x + Math.floor(this.width / 2);
        y = this.y + Math.floor(this.width / 2);
        return [x, y];
    }

    setColor(color){
        this.color = color;
    }

    addNeighbour(node){
        this.reachableNodes.push([node, this.calculateWeight(this, node)]);       
    }

    resetReachbleNodes(){
        this.reachableNodes = [];
    }

    setQueued(boolean){
        this.visited = false;
        this.queued = boolean;
        this.isPathNode = false;
    }

    setVisited(boolean){
        this.visited = boolean;
        this.queued = false;
        this.isPathNode = false;
    }

    setPathNode(boolean){
        this.visited = false;
        this.queued = false;
        this.isPathNode = boolean;
    }


    //calculates the weight of the edge between node1 and node 2 based on their color.
    calculateWeight(node1, node2) {
        
        console.log("Calculating weight");
        //the weight between two nodes is their difference in brightness 
        var node1Brightness = rgbToLuma(node1.getColorAsRGB());
        var node2Brightness = rgbToLuma(node2.getColorAsRGB());
        /*
        var weightOfNodes = (255 + (node1Brightness - node2Brightness)) / 2;
        console.log(weightOfNodes);
        return weightOfNodes;
        */
       return node1Brightness - node2Brightness;
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

    drawCiricle(color){
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(this.circleCenter[0], this.circleCenter[1], this.circleRadius, 0, 2*Math.PI, false);
        ctx.stroke();
        ctx.fill();
    }

    draw(){



        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.width);

        if (this.visited){
            this.drawCiricle(visited);
        }
        if (this.queued){
            this.drawCiricle(queuedColor);
        }
        if(this.isPathNode){
            this.drawCiricle(pathColor);
        }

    }
};