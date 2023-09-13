import { makeAutoObservable } from "mobx";

class CanvasState {
    canvas = null
    // будет сожеражть все дейстивя которые мы когда либо делали
    undoList = [];
    // будет сожеражть все дейстивя которые мы отмеили
    redoList = [];
    username = "";
    socket = null;
    sessionid = null;

    constructor() {
        makeAutoObservable(this)
    }

    setCanvas(canvas) {
        this.canvas = canvas;
    }

    setSessionid(id) {
        this.sessionid = id;
    }

    setSocket(socket) {
        this.socket = socket;
    }

    pushToUndo(data) {
        this.undoList.push(data);
    }

    pushToRedo(data) {
        this.redoList.push(data);
    }

    setUsername(username) {
        this.username = username
    }

    undo() {
        let ctx = this.canvas.getContext('2d');
        if (this.undoList.length > 0) {
            let dataUrl = this.undoList.pop();
            // сохроняем действие котороем мы отменяем, что бы потом могли его вернуть
            this.redoList.push(this.canvas.toDataURL());
            let img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            }
        } else {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    redo() {
        let ctx = this.canvas.getContext('2d');
        if (this.redoList.length > 0) {
            let dataUrl = this.redoList.pop();
            this.undoList.push(this.canvas.toDataURL());
            let img = new Image();
            img.src = dataUrl;
            img.onload = () => {
                ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
}


export default new CanvasState();