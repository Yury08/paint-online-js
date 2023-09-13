import React, { useEffect, useRef, useState } from 'react';
import "../styles/canvas.scss";
import { observer } from 'mobx-react-lite';
import canvasState from "../store/canvasState";
import toolState from "../store/toolState";
import Brush from '../tools/Brush';
import Rect from '../tools/Rect';
import Circle from '../tools/Circle';
import Eraser from '../tools/Eraser';
import { Modal, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import axios from 'axios';




const Canvas = observer(() => {
    // с помощью этого хука и свойства ref получаем доступ к DOM элументу canvas
    const canvasRef = useRef();
    const usernameRef = useRef();
    const [modal, setModal] = useState(true);
    const params = useParams();

    useEffect(() => {
        canvasState.setCanvas(canvasRef.current);
        let ctx = canvasRef.current.getContext('2d')
        axios.get(`http://localhost:5000/image?id=${params.id}`)
            .then(res => {
                const img = new Image()
                img.src = res.data
                img.onload = () => {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
                    ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height)
                }
            })
    }, [])

    // устанавлиеваем соединение по ws протоколу
    useEffect(() => {
        if (canvasState.username) {
            const socket = new WebSocket(`ws://localhost:5000/`);
            canvasState.setSocket(socket);
            canvasState.setSessionid(params.id);
            toolState.setTool(new Brush(canvasRef.current, socket, params.id))
            socket.onopen = () => {
                console.log("Подключение установленно");
                socket.send(JSON.stringify({
                    id: params.id,
                    username: canvasState.username,
                    method: "connection"
                }))
            }
            socket.onmessage = (e) => {
                let msg = JSON.parse(e.data);
                // eslint-disable-next-line default-case
                switch (msg.method) {
                    case "connection":
                        console.log(`пользователь ${msg.username} подключился`)
                        break
                    case "draw":
                        drawHandler(msg)
                        break
                }
            }
        }
        // устанавливаем соединение, когда изменяеться username в модальном окне
    }, [canvasState.username])

    const drawHandler = (msg) => {
        const figure = msg.figure;
        const ctx = canvasRef.current.getContext('2d')
        // eslint-disable-next-line default-case
        switch (figure.type) {
            case "brush":
                Brush.draw(ctx, figure.x, figure.y, figure.color, figure.width)
                break;
            case "rect":
                Rect.staticDraw(ctx, figure.x, figure.y, figure.width, figure.height, figure.color, figure.stroke, figure.lineWidth)
                break;
            case "circle":
                Circle.staticDraw(ctx, figure.x, figure.y, figure.r, figure.color, figure.stroke, figure.width)
                break;
            case "eraser":
                Eraser.draw(ctx, figure.x, figure.y, figure.width)
                break;
            case "finish":
                // наичнаем новую линию
                ctx.beginPath();
                break;
        }
    }

    const mouseDownHandler = () => {
        canvasState.pushToUndo(canvasRef.current.toDataURL());
        axios.post(`http://localhost:5000/image?id=${params.id}`, { img: canvasRef.current.toDataURL() })
            .then(res => console.log(res.data));
    }

    const connectionHandler = () => {
        canvasState.setUsername(usernameRef.current.value)
        setModal(false);
    }

    return (
        <div className='canvas'>
            <Modal show={modal} onHide={() => { }}>
                <Modal.Header>
                    <Modal.Title>Введите ваше имя</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <input type="text" ref={usernameRef} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => connectionHandler()}>
                        Войти
                    </Button>
                </Modal.Footer>
            </Modal>
            <canvas onMouseDown={() => mouseDownHandler()} ref={canvasRef} width={600} height={400} />
        </div>
    )
})

export default Canvas
