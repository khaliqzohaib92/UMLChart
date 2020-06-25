import { SHAPES } from "../util/constants";
import paper, { Project, Path, Group, PointText, tool, Tool, Rectangle, Point } from 'paper';
import Modal from "../modal/modal";

import {getAngleDeg} from '../util/util';

const boundsIdentifierObj = {
  1: 'topLeft', 2: 'topRight', 3: 'bottomRight', 0: 'bottomLeft'
}
const LINE = 'line'; 

class MyCanvas {
  constructor(canvasElement) {
    this.canvasElement =  canvasElement;
    this.centerPosition = this.getCenterPosition();
    this.strokeColor = 'black';
    this.fillColor = "white";
    this.defaultSize = [100,100];
    this.currentActiveItem = null;
    this.strokeSize = 3;

    // sets up paper js on canvas
    paper.setup(canvasElement);

    //creates new project in paper
    this.project = new Project(canvasElement)

    //creating tool
    this.tool = new Tool();
    // has moved at least 10 points:
    tool.minDistance = 2;

    //binds methods
    //shapes method binding
    this.drawShapes = this.drawShapes.bind(this);
    this.drawClassShape = this.drawClassShape.bind(this);
    this.drawLineShape = this.drawLineShape.bind(this);
    this.drawObjectShape = this.drawObjectShape.bind(this);
    this.drawTextShape = this.drawTextShape.bind(this);
    this.drawUserCaseShape = this.drawUseCaseShape.bind(this);

    //general method binding
    this.getCenterPosition = this.getCenterPosition.bind(this);

    //user interaction method binding
    this.onToolDoubleClick = this.onToolDoubleClick.bind(this);
    this.onToolMouseDown = this.onToolMouseDown.bind(this);
    this.setOneItemSelected = this.setOneItemSelected.bind(this);
    this.onToolDrag = this.onToolDrag.bind(this);
    this.onToolKeyDown = this.onToolKeyDown.bind(this);

    //tool level clicklistener
    this.tool.onMouseDown = this.onToolMouseDown;
    this.tool.onMouseUp = this.onToolMouseUp;
    this.tool.onMouseDrag = this.onToolDrag;
    this.tool.onKeyDown = this.onToolKeyDown;

     //add double click listener on canvas because tool have no double click listener
    this.canvasElement.addEventListener("dblclick", this.onToolDoubleClick);

  }

  //shape draw distributor
  drawShapes(shapeName){

    switch (shapeName) {
      case SHAPES.CLASS:
        this.drawClassShape();
        break;
      case SHAPES.AGGREGATION:
      case SHAPES.COMPOSITION:
      case SHAPES.DIVIDER:  
      case SHAPES.ASSOCIATION:  
        let startPoint = new Point(this.centerPosition.x-50, this.centerPosition.y);
        let endPoint = new Point(this.centerPosition.x+50, this.centerPosition.y);
        this.drawLineShape(startPoint, endPoint, shapeName);
        break;
      case SHAPES.SQUARE:
      case SHAPES.OBJECT:
      case SHAPES.INTERFACE:
          this.drawObjectShape(shapeName);
        break;
      case SHAPES.TITLE:
        startPoint = new Point(this.centerPosition.x-25, this.centerPosition.y-25);
        this.drawTextShape(startPoint, "Add Text");
        break;
      case SHAPES.CIRCLE:
      case SHAPES.USECASE:
        this.drawUseCaseShape(shapeName);
        break;
      default:
        break;
    }

  }

  // Creates three rectangle to make a class UML
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

    return textShape
  }

  //add Divider/Association/Compositioin/Aggregation with head shape and three circles (to aid movement and drag)
  drawLineShape(startPoint, endPoint, lineType){
    

    let mainGroup = new Group();
    let group =  new Group();
    
    //draw line
    const line = new Path.Line(startPoint, endPoint);
    this.setStrokeAndFill(line);

    // draw head circle
    const headCircle = new Path.Circle(endPoint, 5);
    headCircle.fillColor = 'black';
    headCircle.strokeWidth = 1;

    //draw middle circle
    const midPoint = new Point((startPoint.x+endPoint.x)/2, (startPoint.y+endPoint.y)/2)
    const midCircle = new Path.Circle(midPoint, 4);
    midCircle.fillColor = 'black';
    midCircle.strokeWidth = 1;


    //draw tail circle
    const tailCircle = new Path.Circle(startPoint, 5);
    tailCircle.fillColor = 'black';
    tailCircle.strokeWidth = 1;


    //add circles and line to group
    group.addChild(line);
    group.addChild(tailCircle);
    group.addChild(midCircle);
    group.addChild(headCircle);

    //draw arrow shape
    const headShape = new Path();
    headShape.strokeColor= this.strokeColor;
    headShape.strokeWidth = this.strokeSize;

    let arrowCenter = endPoint;

    //based on line type draw shape
    if(lineType !== SHAPES.DIVIDER){
      const leftEdge = new Point(arrowCenter.x-10, arrowCenter.y-10);
      const rightEdge = new Point(arrowCenter.x-10, arrowCenter.y+10);
      headShape.add(leftEdge);
      headShape.add(arrowCenter);
      headShape.add(rightEdge);

      if(lineType === SHAPES.AGGREGATION || lineType ===  SHAPES.COMPOSITION){
        const bottomRightEdge = new Point(arrowCenter.x-20, arrowCenter.y);
        const bottomLeftEdge = leftEdge;
        headShape.add(bottomRightEdge);
        headShape.add(bottomLeftEdge);

        if(lineType === SHAPES.AGGREGATION){
          headShape.strokeColor = 'white';
          headShape.fillColor = 'white';
          headShape.shadowColor = 'gray';
          headShape.shadowOffset=1;
        }

        if(lineType === SHAPES.COMPOSITION){
          headShape.fillColor = 'black';
        }
      }
    }

    

    //rotate the head shape
    if(lineType !== SHAPES.DIVIDER)
      headShape.rotate(
        getAngleDeg(endPoint.x, endPoint.y,startPoint.x, startPoint.y), 
        arrowCenter);

    
    //add group to main group
    mainGroup.addChild(group);
    if(lineType !== SHAPES.DIVIDER)
      mainGroup.addChild(headShape);
    mainGroup.data.type = LINE;
    mainGroup.data.lineType = lineType;

    return mainGroup;
  }

  //add Object/Interface shape
  drawObjectShape(type){
    //creates object rectangle
    const startPoint = new Point(this.centerPosition.x-50, this.centerPosition.y-25)
    const objectShape = new Path.Rectangle(startPoint.x, startPoint.y, this.defaultSize[0], this.defaultSize[0]/2);
    this.setStrokeAndFill(objectShape);



    //create textshape
    if(type !== SHAPES.SQUARE){
      const textShapeStartPoint = new Point(startPoint.x+30, startPoint.y+30);
      const textShape = this.drawTextShape(textShapeStartPoint, type);

      //creates group and object shape and text shape
      // const group = new Group();
      // group.addChild(objectShape);
      // if(type !== SHAPES.SQUARE)
      //   group.addChild(textShape);
    }

   
  }

  //add Usecase/Activity shape
  drawUseCaseShape(type){
    //draw circle
    let circlePath = new Path.Circle(this.centerPosition, 25);
    circlePath.scale(2,1.2);
    
    //scale to make it an oval
    this.setStrokeAndFill(circlePath)

    if(type === SHAPES.USECASE){
      //add Text
      const textShape = this.drawTextShape(new Point(this.centerPosition.x-25, this.centerPosition.y+5), type);
    }
  }
  
  //on tool click
  onToolMouseDown(e){
    //toggle item selected
    this.setOneItemSelected(e);

    //return if no currentActiveItem
    if(!this.currentActiveItem) return;

    //clearing currentActiveItem data to fix the issue of unintended moves
    this.currentActiveItem.data.state = null;

    if(this.currentActiveItem.contains(e.point)){
      this.currentActiveItem.data.state = 'move'
    }
    //set items data based on item mouseDown point
    if(this.currentActiveItem.data.type !== LINE){
      debugger
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
    } else {
      //only for shapes with type LINE
      const headCircleItem = this.currentActiveItem.firstChild.children[3];
      if(headCircleItem.contains(e.point)){
        this.currentActiveItem.data.state = 'resize'
      }
    }
  }


  //item drag listener
  onToolDrag(e){
    // debugger
    if(this.currentActiveItem == null) return;

    if(this.currentActiveItem.data.state === 'move'){
      this.currentActiveItem.position = e.point;  
    } else
    if(this.currentActiveItem.data.state === 'resize'){
      if(this.currentActiveItem.data.type === LINE){
        //shapes with type line, re-rendering line on each user move
        const lineStartPoint = this.currentActiveItem.firstChild.firstChild.segments[0].point;
        const lineType = this.currentActiveItem.data.lineType;
        this.currentActiveItem.remove();
        this.currentActiveItem =  this.drawLineShape(lineStartPoint, e.point, lineType);
        this.currentActiveItem.data.state = 'resize'
      }else{
        //shapes other than line, updating the bounds
        this.currentActiveItem.bounds = new Rectangle(
          this.currentActiveItem.data.from,e.point);
      }
      this.currentActiveItem.selected = true
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


  // keyboard intraction to move shapes
  onToolKeyDown(e){
    if(!this.currentActiveItem) return;

    const position = this.currentActiveItem.position;
    const step = 5;
    switch(e.key){
      case 'left':
        position.x -= step;
        break;
      case 'right':
        position.x += step;
        break;
      case 'up':
        position.y -= step;
        break;
      case 'down':
        position.y += step;
        break; 
    }
    this.currentActiveItem.position = position;
  }


  //----------------------- general methods --------------------------------------
  // return center position of canvas
  getCenterPosition(){
    return new Point({x: this.canvasElement.clientWidth/2, y:this.canvasElement.clientHeight/2});
  }

  // helper to set stroke and fill
  setStrokeAndFill(item){
    item.strokeWidth = this.strokeSize;
    item.strokeColor = this.strokeColor;
    item.fillColor = this.fillColor;
  }
}

export default MyCanvas;
