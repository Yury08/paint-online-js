import Tool from "./Tools.js";


export default class Brush extends Tool {
    // так как что бы рисвать пользователя надо юудет водить мышкой,
    // то нам надо 3 слушателя события: на нажатие мыши, передвижение мыши и, когда пользователя отпустит мышь
    constructor(canvas, socket, sessionid) {
        super(canvas, socket, sessionid);
        this.listen();
    }

    // когда мы начинаем использовать компонент Brush у нас биндяться 3 слушателя события,
    //  но когда мы перестаем его использовать вызывается функция destroy event
    listen() {
        this.canvas.onmousemove = this.mouseMoveHandler.bind(this);
        this.canvas.onmouseup = this.mouseUpHandler.bind(this);
        this.canvas.onmousedown = this.mouseDownHandler.bind(this);
    }

    // отпускание кнопки
    mouseUpHandler(e) {
        this.mouseDown = false;
        this.socket.send(JSON.stringify({
            method: "draw",
            id: this.sessionid,
            figure: {
                type: 'circle',
                x: this.startX,
                y: this.startY,
                r: this.r,
                color: this.ctx.fillStyle,
                stroke: this.ctx.strokeStyle,
                width: this.ctx.lineWidth
            }
        }))
    }

    // передвижение мыши
    mouseMoveHandler(e) {
        if (this.mouseDown) {
            let currentX = e.pageX - e.target.offsetLeft;
            let currentY = e.pageY - e.target.offsetTop;
            let width = currentX - this.startX;
            let height = currentY - this.startY;
            this.r = Math.sqrt(width ** 2 + height ** 2)
            this.draw(this.startX, this.startY, this.r);
        }
    }

    // нажатие кнопки
    mouseDownHandler(e) {
        this.mouseDown = true;
        // говорит о том, что мы начали рисовать новую линию
        this.ctx.beginPath();
        this.startX = e.pageX - e.target.offsetLeft;
        this.startY = e.pageY - e.target.offsetTop;
        // сохраняем изображение с канваса
        let canvasData = this.canvas.toDataURL()
        this.saved = canvasData

    }

    draw(x, y, r) {
        const img = new Image()
        img.src = this.saved
        img.onload = async function () {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            this.ctx.beginPath()
            this.ctx.arc(x, y, r, 0, 2 * Math.PI)
            this.ctx.fill()
            this.ctx.stroke()
        }.bind(this)
    }

    static staticDraw(ctx, x, y, r, color, stroke, width) {
        ctx.fillStyle = color
        ctx.strokeStyle = stroke
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.arc(x, y, r, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
    }

}