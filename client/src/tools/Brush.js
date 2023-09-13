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
                type: 'finish',
            }
        }))
    }

    // передвижение мыши
    mouseMoveHandler(e) {
        if (this.mouseDown) {
            // this.draw(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);
            this.socket.send(JSON.stringify({
                method: "draw",
                id: this.sessionid,
                figure: {
                    type: 'brush',
                    x: e.pageX - e.target.offsetLeft,
                    y: e.pageY - e.target.offsetTop,
                    color: this.ctx.strokeStyle,
                    width: this.ctx.lineWidth
                }
            }))
        }
    }

    // нажатие кнопки
    mouseDownHandler(e) {
        this.mouseDown = true;
        // говорит о том, что мы начали рисовать новую линию
        this.ctx.beginPath();
        this.ctx.moveTo(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop);

    }

    static draw(ctx, x, y, color, width) {
        ctx.lineWidth = width
        ctx.strokeStyle = color
        ctx.lineTo(x, y);
        ctx.stroke();
    }

}