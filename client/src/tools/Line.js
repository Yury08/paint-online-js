import Tool from "./Tools.js";


export default class Line extends Tool {
    constructor(canvas, socket, sessionid) {
        super(canvas, socket, sessionid);
        this.listen()
        this.name = 'Line'
    }

    listen() {
        this.canvas.onmousedown = this.mouseDownHandler.bind(this)
        this.canvas.onmouseup = this.mouseUpHandler.bind(this)
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this)
    }

    mouseDownHandler(e) {
        this.mouseDown = true
        this.currentX = e.pageX - e.target.offsetLeft
        this.currentY = e.pageY - e.target.offsetTop
        this.ctx.beginPath()
        this.ctx.moveTo(this.currentX, this.currentY)
        this.saved = this.canvas.toDataURL()
    }

    mouseUpHandler(e) {
        this.mouseDown = false;
        this.socket.send(JSON.stringify({
            method: "draw",
            id: this.sessionid,
            figure: {
                type: 'finish',
            }
        }))
    }

    mouseMoveHandler(e) {
        if (this.mouseDown) {
            // this.draw(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
            this.socket.send(JSON.stringify({
                method: "draw",
                id: this.sessionid,
                figure: {
                    type: 'line',
                    x: e.pageX - e.target.offsetLeft,
                    y: e.pageY - e.target.offsetTop
                }
            }))
        }
    }


    static draw(ctx, x, y) {
        ctx.beginPath()
        ctx.moveTo(this.currentX, this.currentY)
        ctx.lineTo(x, y)
        ctx.stroke()
    }
}