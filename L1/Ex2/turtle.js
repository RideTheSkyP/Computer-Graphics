var showTurtle = false;
var pendown = true;

function modelToView(x, y) 
{
    var xx = sizes.w * (x - sizes.xMin) / (sizes.xMax - sizes.xMin);
    var yy = sizes.h * (y - sizes.yMin) / (sizes.yMax - sizes.yMin);
    return [xx, yy];
}

function drawTurtle() 
{
    if (showTurtle) 
    {
        var center = modelToView(transform.x, transform.y);
        view.beginPath();
        view.arc(center[0], center[1], 4, 0, 2 * Math.PI);
        view.fill();
    }
}

function forward(distance) 
{
    var xx = transform.x + distance * Math.cos((Math.PI / 180) * (-transform.angle));
    var yy = transform.y + distance * Math.sin((Math.PI / 180) * (-transform.angle));
    var oldPos = modelToView(transform.x, transform.y);
    var newPos = modelToView(xx, yy);
    if (pendown)
    {
        view.beginPath();
        view.moveTo(oldPos[0], oldPos[1]);
        view.lineTo(newPos[0], newPos[1]);
        view.stroke();
    }
    transform.x = xx;
    transform.y = yy;
}

function back(distance)
{
    forward(-distance);
}

function rotate(angle, direction) 
{
    if (direction === true)
    {
        transform.angle += angle;
        transform.angle %= 360;
    }
    else
    {
        transform.angle -= angle;
        transform.angle %= 360;
    }
}

function clearField() 
{
    view.fillStyle = "#FFF";
    view.fillRect(0, 0, view.canvas.width, view.canvas.height);
}

function executeCommand(command, value) 
{
    if (command === "forward" || command === "fw") 
    {
        forward(parseFloat(value));
    }
    else if (command === "back" || command === "bk") 
    {
        back(parseFloat(value));
    }
    else if (command === "left" || command === "lt") 
    {
        rotate(parseFloat(value), true);
    }
    else if (command === "right" || command === "rt")
    {
        rotate(parseFloat(value), false);
    }
    else if (command === "reset")
    {
        reset();
    }
}

function execute(command)
{
    var commands = command.split("\n");
    var iters = 1;
    for (var j = 0; j < iters; j = j + 1) 
    {
        var i = 1;

        if (j === 0) 
        {
            i = 0;
        }

        for (; i < commands.length; i = i + 1) 
        {
            var command = commands[i].split(" ");
            if (command.length == 2)
            {
                var instruction = command[0].trim();
                var value = command[1].trim();

                if (i === 0 && instruction === "repeat") 
                {
                    iters = parseInt(value);
                }
                executeCommand(instruction, value);
            }
        }
    }
}

function snowflake(length, levels)
{
    if (levels === 0)
    {
        forward(length);
        return;
    }
    snowflake(length, levels-1);
    rotate(parseFloat(60), true);
    snowflake(length, levels-1);
    rotate(parseFloat(120), false);
    snowflake(length, levels-1);
    rotate(parseFloat(60), true);
    snowflake(length, levels-1);
}

function snowflakeKoch(levels)
{
    var length = 1 / (levels * 2);
    rotate(parseFloat(30), false);
    pendown = false;
    back(2*levels);
    pendown = true;
    rotate(parseFloat(30), true);
    for (const i of Array(3).keys()) 
    {
        snowflake(length, levels);
        rotate(parseFloat(120), false);
    }
}

function reset() 
{
    transform = {"x" : 0.0, "y" : 0.0, "angle" : 90};
    var startPos = modelToView(0, 0);
    view.moveTo(startPos[0], startPos[1]);
    drawTurtle();
}

var viewElement = document.getElementById("field");
var view = viewElement.getContext("2d");
var sizes = 
{
    "w" : view.canvas.width,
    "h" : view.canvas.height,
    "xMin" : -10,
    "xMax" : 10,
    "yMin" : -10,
    "yMax" : 10
};
console.log(sizes);
var transform;
reset();
