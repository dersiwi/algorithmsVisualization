
class PriorityQueue{

    constructor(){
        this.items = []; 
    }

    //this is absoloute garbage - it should be implemented using a binary tree
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