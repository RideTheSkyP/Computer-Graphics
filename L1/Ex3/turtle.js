function rotate(firstPoint, secondPoint, angle)
{
    var radians = (Math.PI / 180) * angle;
    cos = Math.cos(radians);
    sin = Math.sin(radians);
    x = (cos * (secondPoint[0] - firstPoint[0])) + (sin * (secondPoint[1] - firstPoint[1])) + firstPoint[0];
    y = (cos * (secondPoint[1] - firstPoint[1])) - (sin * (secondPoint[0] - firstPoint[0])) + firstPoint[1];
    return [x, y];
}

function newPoints(points, index)
{
    var start = points[index];
    var end = points[(index + 1) % points.length];
    var firstPoint = [(2 * start.x + end.x) / 3, (2 * start.y + end.y) / 3];
    var secondPoint = [(start.x + 2 * end.x) / 3, (start.y + 2 * end.y) / 3];
    var thirdPoint = rotate(firstPoint, secondPoint, 60);

    points.splice(index + 1, 0, {"x" : firstPoint[0], "y" : firstPoint[1]});
    points.splice(index + 2, 0, {"x" : thirdPoint[0], "y" : thirdPoint[1]});
    points.splice(index + 3, 0, {"x" : secondPoint[0], "y" : secondPoint[1]});
}

function generate(depth)
{
    var points = [];
    var size = Math.sqrt(3) * width / 2;
    var delta = width * (1.0 - Math.sqrt(3) / 2.0) / 2.0;
    points.push({"x" : width / 2, "y" : 0});
    points.push({"x" : (width + size) / 2, "y" : Math.sqrt(3) * size / 2.0});
    points.push({"x" : (width - size) / 2, "y" : Math.sqrt(3) * size / 2.0});

    for (var i = 1; i <= depth - 1; i++)
    {
        for (var j = 0; j < 3 * Math.pow(4, i - 1); j++)
        {
            newPoints(points, j * 4);
        }
    }
    return points;
}

function drawSnowflake(points)
{
    clearField();
    for (const i of Array(points.length).keys())
    {
        shape += `${points[i].x},${points[i].y} `;
    }
    field.innerHTML = `<polygon points = "${shape}"/>`;
}

function clearField()
{
    shape = "";
    while (field.lastChild)
    {
        field.removeChild(field.lastChild);
    }
}

function snowflakeKoch(depth)
{
    depth = parseInt(depth);
    var points = generate(depth);
    drawSnowflake(points);
}

var field = document.getElementById("field");
var width = field.getBoundingClientRect().width;
var height = field.getBoundingClientRect().height;
var shape = "";

var sin30 = Math.pow(3, 1/2)/2;
var cos30 = .5;

function addTriangle(x, y, r, depth)
{
    if (depth > 0)
    {
        addTriangle(x, y-r/2, r/2, depth-1);
        addTriangle(x-r*sin30/2, y+r*cos30/2, r/2, depth-1);
        addTriangle(x+r*sin30/2, y+r*cos30/2, r/2, depth-1);
        shape = `${x},${y-r} ${x-r*sin30},${y+r*cos30} ${x+r*sin30},${y+r*cos30} `;
        field.innerHTML += `<polygon points = "${shape}"/>`;
    }
    else
    {
        return;
    }
}

function triangleSierpinski(depth)
{
    var size =  Math.min(height, width);
    clearField();
    addTriangle(width/2, height*2/3, size*.55, depth);
    console.log(field)
}