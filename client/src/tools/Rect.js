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
                type: 'rect',
                x: this.startX,
                y: this.startY,
                width: this.width,
                height: this.height,
                color: this.ctx.fillStyle,
                stroke: this.ctx.strokeStyle,
                lineWidth: this.ctx.lineWidth
            }
        }))
    }

    // передвижение мыши
    mouseMoveHandler(e) {
        if (this.mouseDown) {
            let currentX = e.pageX - e.target.offsetLeft;
            let currentY = e.pageY - e.target.offsetTop;
            this.width = currentX - this.startX;
            this.height = currentY - this.startY;
            this.draw(this.startX, this.startY, this.width, this.height);
        }
    }

    // нажатие кнопки
    mouseDownHandler(e) {
        this.mouseDown = true;
        // говорит о том, что мы начали рисовать новую линию
        let canvasData = this.canvas.toDataURL()
        this.ctx.beginPath();
        this.startX = e.pageX - e.target.offsetLeft;
        this.startY = e.pageY - e.target.offsetTop;
        // сохраняем изображение с канваса
        this.saved = canvasData

    }

    draw(x, y, w, h) {
        const img = new Image()
        img.src = this.saved
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
            this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
            this.ctx.beginPath()
            this.ctx.rect(x, y, w, h)
            this.ctx.fill()
            this.ctx.stroke()
        }
    }

    static staticDraw(ctx, x, y, w, h, color, stroke, width) {
        ctx.fillStyle = color
        ctx.strokeStyle = stroke
        ctx.lineWidth = width
        ctx.beginPath()
        ctx.rect(x, y, w, h)
        ctx.fill()
        ctx.stroke()
    }

}