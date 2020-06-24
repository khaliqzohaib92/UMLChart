import { SHAPES } from "../util/constants";
import paper, { Project, Path, Group, PointText, tool } from 'paper';
import Modal from "../modal/modal";
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
    tool.onDoubleClick = this.onToolDoubleClick;
    tool.onMouseDown = this.onToolMouseDown;
    tool.onItemDrag = this.onItemDrag;
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
  }

  

  onItemDrag(e){
    if(this.currentActiveItem == null) return;

    this.currentActiveItem.position = e.point;  
  }

  //on tool double click
  onToolDoubleClick(e){
    if(e.ctrlKey) {
      this.drawTextShape({x: e.layerX,y: e.layerY}, "Add Text");
    }
  }

  //on tool click
  onToolMouseDown(e){
    this.setOneItemSelected(e);
  }

  //toggle item selecteion and saving currentActiveItem
  setOneItemSelected(e){

    const position = {x: e.layerX, y: e.layerY};
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

    //select the latest item added
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
