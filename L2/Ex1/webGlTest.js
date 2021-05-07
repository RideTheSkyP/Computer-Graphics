var vertexShaderText =
    [
        "precision mediump float;",
        "attribute vec2 vertPosition;",
        "uniform vec3 meshColor;",
        "void main()",
        "{",
        "   gl_PointSize = 4.0;",
        "   gl_Position = vec4(vertPosition, 0.0, 1.0);",
        "}"
    ].join('\n');

var fragmentShaderText =
    [
        "precision mediump float;",
        "uniform vec3 meshColor;",
        "void main()",
        "{",
        "   gl_FragColor = vec4(meshColor, 1.0);",
        "}"
    ].join("\n");

var color = [1.0, 0.0, 0.0];

var createShader = function(gl, type, source, name) 
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
    {
        console.error("ERROR (", name, "):", gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var createFigure = function(gl, vertex, fragment) 
{
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex, "vertex shader");
    if (!vertexShader) return null;
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment, "fragment shader");
    if (!fragmentShader) return null;

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    return program;
}

var getContext = function(id)
{
    var canvas = document.getElementById(id);
    var gl = canvas.getContext("webgl");

    types.push(gl.POINTS);
    types.push(gl.LINE_STRIP);
    types.push(gl.LINE_LOOP);
    types.push(gl.LINES);
    types.push(gl.TRIANGLE_STRIP);
    types.push(gl.TRIANGLE_FAN);
    types.push(gl.TRIANGLES);

    if (!gl) 
    {
        alert("Your browser does not support WebGL");
    }

    return gl;
};

var draw;
var types = [];

var init = function(index) 
{
    var gl = getContext("game-view");

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var vertices =
        [
            -0.5 , -0.5 ,
            -0.25,  0.5 ,
             0.0 , -0.4 ,
             0.1 ,  0.5 ,
             0.3 , -0.6 ,
             0.5 ,  0.6
        ];

    var program = createFigure(gl, vertexShaderText, fragmentShaderText);
    if (!program) return;

    if (index >= 0) 
    {
        console.log("Binding to:", index);
        gl.bindAttribLocation(program, index, "vertPosition");
    }

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) 
    {
        console.error("ERROR (", "linking", "):", gl.getProgramInfoLog(program));
        return;
    }

    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    var positionAttribLocation = gl.getAttribLocation(program, "vertPosition");
    gl.vertexAttribPointer(
        positionAttribLocation,                 // Attribute location
        2,                                      // Number of elements per attribute
        gl.FLOAT,                               // Type of the elements
        gl.FALSE,                               //
        2 * Float32Array.BYTES_PER_ELEMENT,     // Size of an individual vertex
        0                                       // Offset from the beginning of a single vertex to this attribute
    );
    gl.enableVertexAttribArray(positionAttribLocation);

    gl.useProgram(program);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    draw = function(type, color)
    {
        var colorLocation = gl.getUniformLocation(program, "meshColor");

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniform3f(colorLocation, color[0], color[1], color[2]);
        gl.drawArrays(types[type], 0, 6);

        if (type === 4 || type === 5) 
        {
            gl.uniform3f(colorLocation, 0.0, 0.0, 0.0);
            gl.drawArrays(gl.LINE_STRIP, 0, 6);
        }

        const numAtt = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for (var i = 0; i < numAtt; ++i) 
        {
            const info = gl.getActiveAttrib(program, i);
            console.log("attribute:", info.name, "type:", info.type, "size:", info.size, "location:", gl.getAttribLocation(program, info.name));
        }

        const numUni = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < numUni; ++i) 
        {
            const info = gl.getActiveUniform(program, i);
            console.log("uniform:", info.name, "type:", info.type, "size:", info.size);
        }
    }
};


let colorSelect = document.getElementById("colorChoice")
colorSelect.onchange = function() 
{
    let givenColor = colorSelect.value
    switch (givenColor) 
    {
        case "Red":
            color = [1.0, 0.0, 0.0]
            break
        case "Yellow":
            color = [1.0, 1.0, 0.0]
            break
        case "Blue":
            color = [0.0, 0.0, 1.0]
            break
        case "Green":
            color = [0.0, 1.0, 0.0]
            break
        case "Orange":
            color = [1.0, 0.5, 0.0]
            break
        case "Pink":
            color = [1.0 ,0.0, 1.0]
            break
        case "Random":
            color = [Math.random(), Math.random(), Math.random()];
            break
    }
}

let shapeSelect = document.getElementById("shapeChoice")
shapeSelect.onchange = function () 
{
    let givenColor = shapeSelect.value
    switch (givenColor) 
    {
        case "Points":
            draw(0, color)
            break
        case "Line strip":
            draw(1, color)
            break
        case "Line loop":
            draw(2, color)
            break
        case "Lines":
            draw(3, color)
            break
        case "Triangle strip":
            draw(4, color)
            break
        case "Triangle fan":
            draw(5, color)
            break
        case "Triangles":
            draw(6, color)
            break
    }
}


var bind = function(index) 
{
    init(index);
}