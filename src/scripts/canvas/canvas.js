import { SHAPES } from "../util/constants";
import paper, { Project, Path, Group, PointText, tool, Tool, Rectangle, Point } from 'paper';
import Modal from "../modal/modal";

const boundsIdentifierObj = {
  1: 'topLeft', 2: 'topRight', 3: 'bottomRight', 4: 'bottomLeft'
}
class MyCanvas {
  constructor(canvasElement) {
    this.canvasElement =  canvasElement;
    this.centerPosition = this.getCenterPosition();
    this.strokeColor = 'black';
    this.fillColor = "white";
    this.defaultSize = [100,100];
    this.currentActiveItem = null;

    // sets up paper js on canvas
    paper.setup(canvasElement);

    //creates new project in paper
    this.project = new Project(canvasElement)

    //creating tool
    this.tool = new Tool();
    // has moved at least 10 points:
    tool.minDistance = 10;

    //binds methods
    this.drawShapes = this.drawShapes.bind(this);
    this.drawClassShape = this.drawClassShape.bind(this);
    this.getCenterPosition = this.getCenterPosition.bind(this);
    this.drawTextShape = this.drawTextShape.bind(this);
    this.onToolDoubleClick = this.onToolDoubleClick.bind(this);
    this.onToolMouseDown = this.onToolMouseDown.bind(this);
    this.setOneItemSelected = this.setOneItemSelected.bind(this);
    this.onItemDrag = this.onItemDrag.bind(this);

    //tool level clicklistener
    this.tool.onMouseDown = this.onToolMouseDown;
    this.tool.onMouseDrag = this.onItemDrag;

    //add double click listener on canvas because tool have no double click listener
    this.canvasElement.addEventListener("dblclick", this.onToolDoubleClick);

  }

  drawShapes(shapeName){

    switch (shapeName) {
      case SHAPES.CLASS:
        this.drawClassShape();
        break;
      default:
        break;
    }

  }

  // Creates three rectangle to make a class UML
  // First for class name
  // Second for variable name
  // third for method name
  drawClassShape(){
    //creates group and add shapes

    //create class rectangle
    const groupClass = new Group();
    const firstRectX = this.centerPosition.x-50;
    const firstRectY = this.centerPosition.y-50;
    const firstRectHeight = 20;
    const fristRectWidth = this.defaultSize[1];
    const classNameRectangle = new Path.Rectangle(firstRectX, firstRectY, fristRectWidth, firstRectHeight);
    this.setStrokeAndFill(classNameRectangle);
    groupClass.addChild(classNameRectangle);

    // classNameRectangle.onDoubleClick=(e)=>{
    //   e.stopPropagation();
    //   groupClass.addChild(this.drawTextShape(e.point, 'Add Text'));
    // }


    //create varaible rectangle
    const secRectX = firstRectX;
    const secRectY = firstRectY + firstRectHeight;
    const secRectHeight = 50;
    const secRectWidth = this.defaultSize[1];
    const variableNameRectangle = new Path.Rectangle(secRectX, secRectY, secRectWidth, secRectHeight);
    this.setStrokeAndFill(variableNameRectangle);
    groupClass.addChild(variableNameRectangle);


    //create method rectangle
    const thirdRectX = firstRectX;
    const thirdRectY = secRectY + secRectHeight;
    const thirdRectHeight = 30;
    const thirdRectWidth = this.defaultSize[1];
    const methodNameRectangle = new Path.Rectangle(thirdRectX, thirdRectY, thirdRectWidth, thirdRectHeight);
    this.setStrokeAndFill(methodNameRectangle);
    groupClass.addChild(methodNameRectangle);

  }

  // adds text to the clicked area
  drawTextShape(position, text){
    //create text shape
    let textShape = new PointText(position);
    textShape.fillColor = this.strokeColor;
    textShape.content = text;

    //adds doubleclick listner to text
    textShape.onDoubleClick = (e)=>{
      //show modal to update text
      if(textShape.selected){
        new Modal((updatedText)=>{
          textShape.content = updatedText;
        }).show();
      }
    }

    return textShape
  }

  
  //on tool click
  onToolMouseDown(e){
    //toggle item selected
    this.setOneItemSelected(e);

    //return if no currentActiveItem
    if(!this.currentActiveItem) return;

    //clearing currentActiveItem data to fix the issue of unintended moves
    this.currentActiveItem.data = null;

    if(this.currentActiveItem.contains(e.point)){
      this.currentActiveItem.data.state = 'move'
    }

    //set items data based on item mouseDown point
    if(this.currentActiveItem.hitTest(e.point, {bounds: true, tolerance: 5})){
      //get bounds of the shape
      const bounds = this.currentActiveItem.bounds;

      //itrating to find the exact bound point
      for(let[key, value] of Object.entries(boundsIdentifierObj)){
        if(bounds[value].isClose(e.point, 5)){
          const oppositeBound = bounds[boundsIdentifierObj[(parseInt(key) + 2) % 4]];

          //get opposite bound point
          const oppositePoint = new Point(oppositeBound.x,oppositeBound.y);
          //get current bound point
          const currentPoint = new Point(bounds[value].x, bounds[value].y);

          //set shape data to be used for resizing later
          this.currentActiveItem.data.state = 'resize'
          this.currentActiveItem.data.from = oppositePoint;
          this.currentActiveItem.data.to = currentPoint;
          break;
        }
      }
    }
  }

  //item drag listener
  onItemDrag(e){
    if(this.currentActiveItem == null) return;

    if(this.currentActiveItem.data.state === 'move'){
      this.currentActiveItem.position = e.point;  
    }else
    if(this.currentActiveItem.data.state === 'resize'){
      this.currentActiveItem.selected = true
      this.currentActiveItem.bounds = new Rectangle(this.currentActiveItem.data.from, e.point);
    }
  }

  //on tool double click
  onToolDoubleClick(e){
    if(e.ctrlKey) {
      this.drawTextShape({x: e.layerX, y: e.layerY}, "Add Text");
    }
  }

  

  //toggle item selecteion and saving currentActiveItem
  setOneItemSelected(e){

    const position = e.point;
    let clickedItems = []
    this.project.activeLayer.children.forEach(child=>{
      if(child.contains(position)){
        clickedItems.push(child);
      } else {
        child.selected =  false;
      }
    })
    //return if no item is selected
    if(clickedItems.length === 0) return;

    //select the clicked item
    let latestItem = clickedItems[0];
    for (let i = 0; i < clickedItems.length; i++) {
      if(latestItem.id < clickedItems[i].id){
        latestItem = clickedItems[i];
      }else
      {
        clickedItems[i].selected = false;
      }
    }
    this.currentActiveItem = latestItem;
    latestItem.selected = true;
  }


  //----------------------- general methods --------------------------------------
  // return center position of canvas
  getCenterPosition(){
    return {x: this.canvasElement.clientWidth/2, y:this.canvasElement.clientHeight/2};
  }

  // helper to set stroke and fill
  setStrokeAndFill(item){
    item.strokeColor = this.strokeColor;
    item.fillColor = this.fillColor;
  }
}

export default MyCanvas;
