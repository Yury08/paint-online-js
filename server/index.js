const express = require("express");
const app = express();
const WSSserver = require("express-ws")(app);
const aWss = WSSserver.getWss();
const cors = require('cors');
const PORT = process.env.PORT || 5000;
const fs = require('fs');
const path = require('path');

app.use(cors());
app.use(express.json());

app.ws('/', (ws, req) => {
    console.log("ПОДКЛЮЧЕНИЕ УСТАНОВЛЕННО");
    // пепеводим данные, которые прищли в строке в json
    ws.on('message', (msg) => {
        msg = JSON.parse(msg);
        switch (msg.method) {
            case "connection":
                connectionHandler(ws, msg)
                break
            case "draw":
                connectionHandler(ws, msg)
                break
        }
    })
})

app.listen(PORT, () => console.log(`server start successful on PORT ${PORT}`));

const connectionHandler = (ws, msg) => {
    // присваеваем id каждому websoket'у что бы отделить сессии,
    // что бы у каждой сессии был свой id
    ws.id = msg.id;
    broadcastConnection(ws, msg);
}


// функция делает широко-вещательную рассылку
// что бы если user подключился все пользователи в сессии узнали об этом
const broadcastConnection = (ws, msg) => {
    // в clients хроняться все открытые web soket'ы на данный момент
    aWss.clients.forEach(client => {
        if (client.id === msg.id) {
            client.send(JSON.stringify(msg))
        }
    })
}


app.post('/image', (req, res) => {
    try {
        const data = req.body.img.replace('data:image/png;base64,', '')
        fs.writeFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`), data, 'base64')
        return res.status(200).json('ok')
    } catch (e) {
        console.log(e)
        return res.status(500).json('error')
    }
})


app.get('/image', (req, res) => {
    try {
        const file = fs.readFileSync(path.resolve(__dirname, 'files', `${req.query.id}.jpg`));
        const data = 'data:image/png;base64,' + file.toString('base64');
        res.json(data);
    } catch (e) {
        console.log(e)
        return res.status(500).json('error')
    }
})
