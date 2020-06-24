import "./styles/index.scss";
import paper, { Rectangle, Path, Point, Tool, PointText } from 'paper';
import Sidebar from './scripts/sidebar/sidebar';
import sidebarData from './scripts/util/sidebar_data'
import MyCanvas from "./scripts/canvas/canvas";
import Modal from "./scripts/modal/modal";
window.addEventListener("DOMContentLoaded", main =>{
    // canvas
    const canvasElement = document.getElementById('myCanvas');
    const myCanvas = new MyCanvas(canvasElement);

   

    //sidebar
    const sidebarElement = document.getElementById('section-content-sidebar');
    const sidebar = new Sidebar(
        sidebarData[0], 
        sidebarElement,
        myCanvas.drawShapes);
});


