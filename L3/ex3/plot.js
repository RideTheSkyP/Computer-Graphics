class Plot
{
    constructor(gl)
    {
        this.size = 1000;
        this.accuracy = 50;
        this.positions = this.generatePlot([-5, 5], [-5, 5], (x, y) => Math.sin(x) * Math.cos(y), false);
        this.positionBuffer = initBuffers(gl, this.positions);
        this.color = [1, 0, 0, 1];
        this.translation = [0, 0, -2000];
        this.rotation = [0, 0, 0];
    }

    // Rysowanie grafiku
    generatePlot(xRange, yRange, func, isTriangles)
    {
        let plot = [];
        for (let x = 0; x < this.accuracy; x++)
        {
            for (let y = 0; y < this.accuracy; y++)
            {
                let value = func(
                    xRange[0] + x * (xRange[1] - xRange[0]) / this.accuracy,
                    yRange[0] + y * (yRange[1] - yRange[0]) / this.accuracy
                );

                if (isTriangles)
                {
                    let nextY = null;
                    let nextX = null;
                    let nextYX = null;
                    if (y !== this.accuracy - 1)
                    {
                        nextY = func(
                            xRange[0] + x * (xRange[1] - xRange[0]) / this.accuracy,
                            yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.accuracy
                        );
                    }
                    if (x !== this.accuracy - 1)
                    {
                        nextX = func(
                            xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.accuracy,
                            yRange[0] + y * (yRange[1] - yRange[0]) / this.accuracy
                        );
                    }
                    if (x !== this.accuracy - 1 && y !== this.accuracy - 1)
                    {
                        nextYX = func(
                            xRange[0] + (x + 1) * (xRange[1] - xRange[0]) / this.accuracy,
                            yRange[0] + (y + 1) * (yRange[1] - yRange[0]) / this.accuracy
                        );
                    }

                    if (nextX !== null && nextY !== null && nextYX !== null)
                    {
                        plot.push(
                            x * this.size / this.accuracy - this.size / 2,
                            y * this.size / this.accuracy - this.size / 2,
                            value,
                            (x + 1) * this.size / this.accuracy - this.size / 2,
                            y * this.size / this.accuracy - this.size / 2,
                            nextX,
                            x * this.size / this.accuracy - this.size / 2,
                            (y + 1) * this.size / this.accuracy - this.size / 2,
                            nextY,
                            (x + 1) * this.size / this.accuracy - this.size / 2,
                            (y + 1) * this.size / this.accuracy - this.size / 2,
                            nextYX,
                            (x + 1) * this.size / this.accuracy - this.size / 2,
                            y * this.size / this.accuracy - this.size / 2,
                            nextX,
                            x * this.size / this.accuracy - this.size / 2,
                            (y + 1) * this.size / this.accuracy - this.size / 2,
                            nextY
                        );
                    }
                }
                else
                {
                    plot.push(
                        x * this.size / this.accuracy - this.size / 2,
                        y * this.size / this.accuracy - this.size / 2,
                        value);
                }
            }
        }
        const scaleFactor = this.size / Math.abs(xRange[1] - xRange[0]);
        return plot.map((p, i) => i % 3 === 2 ? p * scaleFactor : p);
    }
}

class Actions
{
    constructor(gl)
    {
        this.gl = gl;
        this.program = Utils.initShaderProgram(this.gl, vsSource, fsSource);

        // Tworzenie shader??w
        this.uniforms = {
            uMatrix: gl.getUniformLocation(this.program, "uMatrix"),
            uPerspective: gl.getUniformLocation(this.program, 'uPerspective')
        };
        this.attribs = {
            aPosition: gl.getAttribLocation(this.program, 'aPosition')
        };
        // Tworzenie grafiku
        this.plot = new Plot(this.gl);
        this.objectsToDraw = [this.plot];
    }

    drawScene(isTriangles)
    {
        Utils.resizeCanvas(this.gl.canvas);
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.enable(this.gl.DEPTH_TEST);
        // Czyszczenie strony
        this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.program);

        this.objectsToDraw.forEach(object => {
            // Inicjalizacja u??ytkownika
            this.gl.enableVertexAttribArray(this.attribs.aPosition);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, object.positionBuffer);
            this.gl.vertexAttribPointer(this.attribs.aPosition, 3, this.gl.FLOAT, false, 0, 0);

            let pointOfView = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;
            let fieldOfView = Math.PI / 4;

            // Budowanie matrycy kt??r?? wy??wietlami
            let matrix = m4.identity();
            matrix = m4.xRotate(matrix, object.rotation[0]);
            matrix = m4.yRotate(matrix, object.rotation[1]);
            matrix = m4.translate(matrix, object.translation[0], object.translation[1], object.translation[2]);
            let perspective = m4.perspective(fieldOfView, pointOfView, 1, 10000);
            this.gl.uniformMatrix4fv(this.uniforms.uPerspective, false, perspective);
            this.gl.uniformMatrix4fv(this.uniforms.uMatrix, false, matrix);
            // Rysowanie na stronie w trybie tr??jk??ta lub punkt??warn
            if (isTriangles)
            {
                this.gl.drawArrays(this.gl.TRIANGLES, 0, object.positions.length / 3);
            }
            else
            {
                this.gl.drawArrays(this.gl.POINTS, 0, object.positions.length / 3);
            }
        });
    }
}

function initBuffers(gl, positions)
{
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    return positionBuffer;
}
