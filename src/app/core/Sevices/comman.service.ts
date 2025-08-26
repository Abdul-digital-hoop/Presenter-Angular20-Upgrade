import { DecimalPipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class CommanService {
  slide: any[] = [];
  staticImageLibrary: any[] = [];
  staticChartDate: any[] = [];
  gridBackGroundImage: any[] = [];
  selectAnswerMusics:any[]=[];
  gridBackGroundImageForDark: any[] = [];
  imageType: any = 'Default';
  RightPanel: any = ' ';
  closeModal: any = false;
  constructor(private _decimalPipe: DecimalPipe) {
    this.setSlides();
    this.SetStaticImageLibrary();
    this.SetDefaultChartDate();
    this.setGridBackground();
    this.setSelectedAnswersMusic();
  }
  transformDecimal(num: any): any {
    return this._decimalPipe.transform(num, '1.0-0');
  }
  getSlideData() {
    return this.slide;
  }
  getChartData() {
    return this.staticChartDate;
  }
  addChartData(data: any) {
    this.staticChartDate.push(data);
    return true;
  }
  updateChartDate(color: any, id: any) {
    this.staticChartDate.find(x => x.id == id).color = color;
    return true;
  }
  setSlides() {
    this.slide.push({
      AboutTheSlide: "IPL",
      YourQuestion: "Who Will Win this IPL",
      LongerDescription: "Who Will Win this IPL",
      Option: [
        {
          Name: "Option 1",
          isAnswer: false,
          Value: 40,
          BackgroundColor: "#ffe0e6",
          BordeColor: "rgba(255, 99, 132, 0.2)",
        },
        {
          Name: "Option 2",
          isAnswer: false,
          Value: 60,
          BackgroundColor: "#fff5dd",
          BordeColor: "rgba(255, 205, 86, 0.2)",
        },
        {
          Name: "Option 3",
          isAnswer: false,
          Value: 65,
          BackgroundColor: "#dbf2f2",
          BordeColor: "rgba(75, 192, 192, 0.2)",
        },
      ],
      ShowCorrectAnswer: true,
      NumberOfParticipants: 10,
      Worddata: [
        { key: "word", value: 10 },
        { key: "words", value: 8 },
        { key: "sprite", value: 7 },
        { key: "placed", value: 5 },
        { key: "layout", value: 4 },
        { key: "algorithm", value: 4 },
        { key: "area", value: 4 },
        { key: "without", value: 3 },
        { key: "step", value: 3 },
        { key: "bounding", value: 3 },
        { key: "retrieve", value: 3 },
        { key: "operation", value: 3 },
        { key: "collision", value: 3 },
        { key: "candidate", value: 3 },
        { key: "32", value: 2 },
        { key: "placement", value: 2 },
        { key: "time", value: 2 },
        { key: "possible", value: 2 },
        { key: "even", value: 2 },
        { key: "simple", value: 2 },
        { key: "starting", value: 2 },
        { key: "previously", value: 2 },
        { key: "move", value: 2 },
        { key: "perform", value: 2 },
        { key: "hierarchical", value: 2 },
        { key: "draw", value: 2 },
        { key: "pixel", value: 2 },
        { key: "data", value: 2 },
        { key: "separately", value: 2 },
        { key: "expensive", value: 2 },
        { key: "pixels", value: 2 },
        { key: "masks", value: 2 },
        { key: "implementation", value: 2 },
        { key: "detection", value: 2 },
        { key: "larger", value: 2 },
        { key: "whole", value: 2 },
        { key: "comparing", value: 2 },
        { key: "box", value: 2 },
        { key: "large", value: 2 },
        { key: "think", value: 2 },
        { key: "version", value: 2 },
        { key: "single", value: 2 },
        { key: "tree", value: 2 },
        { key: "Cloud", value: 1 },
        { key: "Generator", value: 1 },
        { key: "Works", value: 1 },
      ]
    });
  }
  GetStaticImageLibraty(): any {
    return this.staticImageLibrary;
  }
  SetStaticImageLibrary() {
    this.staticImageLibrary.push(
      {
        id: 1,
        Name: "Leaf",
        URL: "/assets/images/image-one.jpg"
      },
      {
        id: 2,
        Name: "light",
        URL: "/assets/images/image-two.jpg"
      },
      {
        id: 3,
        Name: "woodway",
        URL: "/assets/images/image-three.jpg"
      },
      {
        id: 4,
        Name: "grass",
        URL: "/assets/images/image-four.jpg"
      },
      {
        id: 5,
        Name: "grass",
        URL: "/assets/images/image-four.jpg"
      },
      {
        id: 6,
        Name: "woodway",
        URL: "/assets/images/image-three.jpg"
      },
    )
  }
  SetDefaultChartDate() {
    this.staticChartDate = [
      {
        id: 1,
        name: "Option 1",
        color: "#498dde",
        height: 25
      },
      {
        id: 2,
        name: "Option 2",
        color: "#ffcc00",
        height: 40
      },
      {
        id: 3,
        name: "Option 3",
        color: "#ff007e",
        height: 80
      },
      {
        id: 4,
        name: "Option 4",
        color: "#ff5d91",
        height: 40
      },
      {
        id: 5,
        name: "Option 5",
        color: "#7e6abf",
        height: 25
      },
    ]
  }
  //Set Grid background images
  setGridBackground() {
    this.gridBackGroundImage = [
      {
        Name: "blank",
        Type: "default",
        src:"assets/images/blank.svg"
      },
      {
        Name: "2x2",
        Type: "default",
        src:"assets/images/2x2.svg"
      },
      {
        Name: "3x3",
        Type: "default",
        src:"assets/images/3x3.svg"
      },
      {
        Name: "4x4",
        Type: "default",
        src:"assets/images/4x4.svg"
      },
      {
        Name: "boxes",
        Type: "default",
        src:"assets/images/boxes.svg"
      },
      {
        Name: "frames",
        Type: "default",
        src:"assets/images/frames.svg"
      },
      {
        Name: "boxes top",
        Type: "default",
        src:"assets/images/boxes_top.svg"
      },
      {
        Name: "boxes_middle",
        Type: "default",
        src:"assets/images/boxes_middle.svg"
      },
      {
        Name: "vertical",
        Type: "default",
        src:"assets/images/vertical.svg"
      },
      {
        Name: "bcg",
        Type: "default",
        src:"assets/images/bcg.svg"
      },
    ]
    this.gridBackGroundImageForDark = [
      {
        Name: "blank",
        Type: "default",
        src:"assets/images/blank.svg"
      },
      {
        Name: "2x2",
        Type: "default",
        src:"assets/images/2x2_for_dark.svg"
      },
      {
        Name: "3x3",
        Type: "default",
        src:"assets/images/3x3_for_dark.svg"
      },
      {
        Name: "4x4",
        Type: "default",
        src:"assets/images/4x4_for_dark.svg"
      },
      {
        Name: "boxes",
        Type: "default",
        src:"assets/images/boxes_for_dark.svg"
      },
      {
        Name: "frames",
        Type: "default",
        src:"assets/images/frames_for_dark.svg"
      },
      {
        Name: "boxes top",
        Type: "default",
        src:"assets/images/boxes_top_for_dark.svg"
      },
      {
        Name: "boxes_middle",
        Type: "default",
        src:"assets/images/boxes_middle_for_dark.svg"
      },
      {
        Name: "vertical",
        Type: "default",
        src:"assets/images/vertical_for_dark.svg"
      },
      {
        Name: "bcg",
        Type: "default",
        src:"assets/images/bcg_for_dark.svg"
      },
    ]
  }
  // Get Grid Background images
  getGridBackground(){
    return this.gridBackGroundImage;
  }
  getGridBackgroundForDark(){
    return this.gridBackGroundImageForDark;
  }

  //Get contrast color
  getContrastColor(colorCode: any): any {
    var contrastColor:any
    if(colorCode != null && colorCode != undefined){
      if (colorCode?.includes('#')) {
        var hex = colorCode.replace(/^#/, '');
        // Parse the hex values
        const bigint = parseInt(hex, 16);
        // Extract RGB components
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        var rgbColor = `rgb(${r}, ${g}, ${b})`;
        const rgb = rgbColor.substring(4, rgbColor.length - 1)
          .replace(/ /g, '')
          .split(',');
  
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
  
        return contrastColor = brightness >= 128 ? 'black' : 'white';
      }
      else {
        const rgb = colorCode?.substring(4, colorCode.length - 1)
          .replace(/ /g, '')
          .split(',');
  
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
  
        return contrastColor = brightness >= 128 ? 'black' : 'white';
      }
    }
  }

  //Get Hexa color code 
  getHexToRgb(hex:any){
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  
    hex = hex.replace(shorthandRegex, function(m:any,r:any,g:any,b:any){
      return r+r+g+g+b+b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  
    return result ?{
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }: null;
  }
  // Music
  setSelectedAnswersMusic(){
    this.selectAnswerMusics = [
      {
        SongTitle: "Cristian nodal",
        Author: "",
        src:"assets/Music/Cristian nodal.mp3",
        isPlay:false
      },
      {
        SongTitle: "Enchanted chimes",
        Author: "",
        src:"assets/Music/enchanted chimes.mp3",
        isPlay:false
      },
      {
        SongTitle: "Top Flow production",
        Author: "",
        src:"assets/Music/Top Flow production.mp3",
        isPlay:false
      },
      
    ]
  }
  
  getSelectedAnswersMusic(){
    return this.selectAnswerMusics;
  }

  //Workspace Service for demo
  SetSelectLayoutImage(data:any){
    this.imageType = data;
  }

  GetSelectLayoutImage(){
    return this.imageType;
  }

  SetRightPanelHideShow(data:any){
    this.RightPanel = data;
  }

  GetRightPanelHideShow(){
    return this.RightPanel;
  }

  SetCloseModal(data){
    this.closeModal = data;
  }

  GetCloseModal(){
    return this.closeModal;
  }

}