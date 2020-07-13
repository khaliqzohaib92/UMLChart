## UMLChart

## Version 1.0.0 - [Live](https://khaliqzohaib92.github.io/UMLChart/)

## Contents
- [Introduction](#introduction)
- [Technologies](#technologies)
- [Setup](#setup)
- [Interactions](#interactions)
- [Features](#features)
  - [Shapes Resizing](#shapes-resizing)
  - [Rotating Line Shapes](#rotating-line-shapes)
  - [Opening a Saved File](#opening-a-saved-file)
  
## Introduction
UMLChart is a canvas based UML diagram making tool. This will allow you to draw classes/modules, represent variables/methods and show connections. It is build using basic JavaScript and Paper.js. Please checkout live link here: [Live](https://khaliqzohaib92.github.io/UMLChart/)

## Built With
* HTML5
* SCSS 
* JavaScript
* Paper.js
* Webpack

## Setup
To run this project, clone it to your local machine and then run:
```
npm install
```
Tt will install all the front end dependencies. Then run:
```
npm start
```
This will run the node server and you can navigate to http://localhost:8080/ to view the web application locally.

## Interactions
Select a shape from side bar and add text by pressing 'Ctrl + Mouse Double Click', use mouse/keyboard to move shapes around in the canvas. Use different lines to join the shapes and build a UML. You can also save a project and import it to continue working on the same.  

<h1 align="center">
  <img src="https://github.com/khaliqzohaib92/UMLChart/blob/master/project_gif/umlchart.gif" width="600" height="auto" align="center"/>
</h1>

## Features

### Shapes Resizing
<h1 align="center">
  <img src="https://github.com/khaliqzohaib92/UMLChart/blob/master/project_gif/umlchart_resize.gif" width="600" height="auto" align="center"/>
</h1>

After selecting a shape form the sidebar user can resize the shape by dragging the it from any corner.

To implement this feature the directions were:

* Identifying the shape user is currently interacting with.
* Get the corner of the shape from where to resize.
* Resize the shape as user drag the mouse.

```javascript

class MyCanvas {

  //on item click
  onToolMouseDown(e){
    //checks if user hit any corner of the item
    if(this.currentActiveItem.hitTest(e.point, {bounds: true, tolerance: 5})){
      //get bounds of the item
      const bounds = this.currentActiveItem.bounds;

      //itrating to find the exact bound point hit by the user
      for(let[key, value] of Object.entries(boundsIdentifierObj)){
        if(bounds[value].isClose(e.point, 5)){
          const oppositeBound = bounds[boundsIdentifierObj[(parseInt(key) + 2) % 4]];
          //get opposite bound point
          const oppositePoint = new Point(oppositeBound.x,oppositeBound.y);
          //get current bound point which user hit
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
  onToolDrag(e){
    if(this.currentActiveItem.data.state === 'resize'){
      //resize the shape as user drag around
      this.currentActiveItem.bounds = new Rectangle(
      this.currentActiveItem.data.from,e.point);
    } 
  }

```


### Rotating Line Shapes
<h1 align="center">
  <img src="https://github.com/khaliqzohaib92/UMLChart/blob/master/project_gif/umlchart_line_rotate.gif" width="600" height="auto" align="center"/>
</h1>

Rotating the lines head with a precise angle as user drag it around was challanging. 

Approach to solve this was:

* Add small circles to three different points in the line shape to detect user interaction.
* Rerendering line at each rotation and finding a precise angle using JavaScipt's `Math.atan2` method. 

```javascript
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
    headShape.strokeWidth = this.strokeWidth;

    let arrowCenter = endPoint;

    const leftEdge = new Point(arrowCenter.x-10, arrowCenter.y-10);
    const rightEdge = new Point(arrowCenter.x-10, arrowCenter.y+10);
    headShape.add(leftEdge);
    headShape.add(arrowCenter);
    headShape.add(rightEdge);

    //rotate the head shape
    if(lineType !== SHAPES.DIVIDER)
      headShape.rotate(
        getAngleDeg(endPoint.x, endPoint.y,startPoint.x, startPoint.y), 
        arrowCenter);

    
    //add group to main group
    mainGroup.addChild(group);
    mainGroup.addChild(headShape);
    mainGroup.data.type = LINE;
    mainGroup.data.lineType = lineType;

    return mainGroup;
  }


//item drag listener
  onToolDrag(e){
    if(this.currentActiveItem.data.state === 'resize'){
      if(this.currentActiveItem.data.type === LINE){
        //re-rendering line on each user move
        const lineStartPoint = this.currentActiveItem.firstChild.firstChild.segments[0].point;
        const lineType = this.currentActiveItem.data.lineType;
        this.currentActiveItem.remove();
        this.currentActiveItem =  this.drawLineShape(lineStartPoint, e.point, lineType);
        this.currentActiveItem.data.state = 'resize'
      }
    } 
  }
```


### Opening a Saved File

<h1 align="center">
  <img src="https://github.com/khaliqzohaib92/UMLChart/blob/master/project_gif/umlchart_open_file.gif" width="600" height="auto" align="center"/>
</h1>


Next challange was to open the saved umlchart file in such a way that edit it.


```javascript
//read file using Paper.js importSVG method and then add items individually
this.project.importSVG(URL.createObjectURL(input.files[0]),(group, svg)=>{
    this.project.clear();
    //used while loop because in paper.js addChild method removes item from the array as well
    while(group.children[1].children.length > 0){
      this.project.activeLayer.addChild(group.children[1].children[0]);
    }
})
```
