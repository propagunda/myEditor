const {electron, app, ipcRenderer, contextBridge, dialog} = require('electron');

const { fs, fsPromises, path } = {
    fs: require('fs'),
    fsPromises: require('fs'),
    path: require('path')
};


const Frame = document.querySelector("#Frame")
const Dir = document.querySelector("#Dir")
const main = document.querySelector("#Main")
const Mod = document.querySelector("#Mod")
const horizontalResizableFrame = document.querySelector(".horizontalResizableFrame")
const verticalResizableFrame = document.querySelector(".verticalResizableFrame")
const horizontalResizable = document.querySelector(".horizontalResizable")
const verticalResizable = document.querySelector(".verticalResizable")
