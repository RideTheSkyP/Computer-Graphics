const field = document.getElementById("field");
const context = field.getContext("2d");
const executionButton = document.getElementById("execButton");
const input = document.getElementById("inp");
const info = document.getElementById("info");

const dx = field.width / 2;
const dy = field.height / 2;
const perspective = 200;

const pressedKey = {};
const speedUp = 0.3;
const slowDown = 0.2;
const maxSpeed = 50;
let previousTimestamp = 0;
let vx = 0;
let vy = 0;
let vz = 0;
let drag = false;

let currentAlpha = 180;
let currentBeta = 30;
let pendown = true;

let fig = [];

let Vertex2D = function (x, y) 
{
    this.x = parseFloat(x);
    this.y = parseFloat(y);
};

let Line = function (start, end, draw) 
{
    this.start = start;
    this.end = end;
    this.draw = draw
}

function project(line) 
{
    let d = perspective;
    if (line.start.z <= -d && line.end.z <= -d) 
    {
        return [];
    }

    return new Line(new Vertex2D(d * line.start.x / Math.max(d + line.start.z, 0.01), d * line.start.y / Math.max(d + line.start.z, 0.01)), new Vertex2D(d * line.end.x / Math.max(d + line.end.z, 0.01), d * line.end.y / Math.max(d + line.end.z, 0.01)));
}

function rotateY(angle) 
{
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    fig.forEach(obj => {
        [obj.start, obj.end].forEach(vertex => {
            let x = vertex.x;
            let y = vertex.y;
            let z = vertex.z + perspective;
            vertex.x = x * cos + z * sin;
            vertex.y = y;
            vertex.z = z * cos - x * sin - perspective;
        });
    });
}

function rotateX(angle) 
{
    let sin = Math.sin(angle);
    let cos = Math.cos(angle);

    fig.forEach(obj => {
        [obj.start, obj.end].forEach(vertex => {
            let x = vertex.x;
            let y = vertex.y;
            let z = vertex.z + perspective;
            vertex.x = x;
            vertex.y = y * cos - z * sin;
            vertex.z = z * cos + y * sin - perspective;
        });
    });
}

function render(fig, dx, dy) 
{
    // clearing previous frame
    context.clearRect(0, 0, 2 * dx, 2 * dy);


    for (let i = 0; i < fig.length; i++) 
    {
        if (fig[i].draw) 
        {
            let line = project(fig[i]);
            if (line.start === undefined) 
            {
                continue;
            }
            context.beginPath();
            context.moveTo(line.start.x + dx, line.start.y + dy);
            context.lineTo(line.end.x + dx, line.end.y + dy);
            context.closePath();
            context.stroke();
        }
    }
}

function move(dx = 0, dy = 0, dz = 0)
 {
    fig.forEach(obj => {
        [obj.start, obj.end].forEach(vertex => {
            vertex.x += dx;
            vertex.y += dy;
            vertex.z += dz;
        });
    });
}

let draw = (timestamp) => {
    let timeFactor = timestamp - previousTimestamp;

    if (pressedKey["w"]) 
    {
        vz = Math.max(vz - speedUp * timeFactor, -maxSpeed);
    } 
    else if (pressedKey["s"]) 
    {
        vz = Math.min(vz + speedUp * timeFactor, maxSpeed);
    }

    if (pressedKey["d"]) 
    {
        vx = Math.max(vx - speedUp * timeFactor, -maxSpeed);
    } 
    else if (pressedKey["a"]) 
    {
        vx = Math.min(vx + speedUp * timeFactor, maxSpeed);
    }

    if (pressedKey["q"])
     {
        vy = Math.max(vy - speedUp * timeFactor, -maxSpeed);
    } 
    else if (pressedKey["e"]) 
    {
        vy = Math.min(vy + speedUp * timeFactor, maxSpeed);
    }


    if (vy > 0) 
    {
        vy -= Math.min(slowDown * timeFactor, vy);
    } 
    else 
    {
        vy -= Math.max(-slowDown * timeFactor, vy);
    }

	if (vx > 0)
	{
		vx -= Math.min(slowDown * timeFactor, vx);
    }
     else 
	{
		vx -= Math.max(-slowDown * timeFactor, vx);
	}

    if (vz > 0) 
    {
        vz -= Math.min(slowDown * timeFactor, vz);
    } 
    else 
    {
        vz -= Math.max(-slowDown * timeFactor, vz);
    }
    move(vx, vy, vz);
    render(fig, dx, dy);
    previousTimestamp = timestamp;
    window.requestAnimationFrame(draw);
};

function forward(dist) 
{
    let oldX = fig[fig.length - 1].end.x;
    let oldY = fig[fig.length - 1].end.y;
    let oldZ = fig[fig.length - 1].end.z;

    const start = { x: oldX, y: oldY, z: oldZ };

    oldX += dist * Math.sin(currentAlpha * Math.PI / 180) * Math.cos(currentBeta * Math.PI / 180)
    oldY += dist * Math.cos(currentAlpha * Math.PI / 180) * Math.sin(currentBeta * Math.PI / 180)
    oldZ += dist * Math.cos(currentAlpha * Math.PI / 180) * Math.cos(currentBeta * Math.PI / 180)
    fig.push(new Line(start, {x: oldX, y: oldY, z: oldZ}, pendown));
}

function changeAlpha(angle) 
{
    currentAlpha = ((currentAlpha + angle) % 360 + 360) % 360;
}

function changeBeta(angle) 
{
    currentBeta = (currentBeta + angle) % 360;
}

function parseCommand(command) 
{
    const parsed = command.split(" ");

    switch (parsed[0])
     {
        case "forward": 
        {
            forward(parseInt(parsed[1]));
            break;
        }
        case "alpha":
        {
            changeAlpha(parseInt(parsed[1]));
            break;
        }
        case "beta": 
        {
            changeBeta(parseInt(parsed[1]));
            break;
        }
        case "pendown": 
        {
            pendown = true;
            break;
        }
        case "penup": 
        {
            pendown = false;
            break;
        }
        case "clear": 
        {
            context.clearRect(0, 0, 2 * dx, 2 * dy);
            fig = [new Line({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }, false)];
            break;
        }
        case "example":
        {
            example();
            break;
        }
        default: 
        {
            console.log("Wrong commnad: ", parsed);
            break;
        }
    }
}

executionButton.addEventListener("click", function () 
{
    input.value.split("\n").forEach(parseCommand);
    render(fig, dx, dy);
});

fig.push(new Line({x:0, y:0, z:0}, {x:0, y:0, z:0}, false));

function example() 
{
    for (let i = 0; i < 50; i++) 
    {
        forward(100);
        changeAlpha(120);
        forward(100);
        changeAlpha(120);
        forward(100);
        changeAlpha(120);
        changeBeta(30);
    }
}

render(fig, dx, dy);

field.addEventListener("mousedown", () => drag = true);
document.addEventListener("mouseup", () => drag = false);
window.addEventListener("keydown", event => pressedKey[event.key] = true);
window.addEventListener("keyup", event => pressedKey[event.key] = false);
field.addEventListener("mousemove", event => {
    if (drag) 
    {
        let changeAlpha = -event.movementX * Math.PI / 360;
        let changeBeta = event.movementY * Math.PI / 180;
        rotateY(changeAlpha);
        rotateX(changeBeta);
    }
});

window.requestAnimationFrame(draw);
