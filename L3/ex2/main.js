window.onload = function main()
{
    const canvas = document.getElementById("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl)
    {
        return;
    }

    let pressedKeys = {};
    window.addEventListener("keydown", event => pressedKeys[event.key] = true);
    window.addEventListener("keyup", event => pressedKeys[event.key] = false);

    let actions = new Actions(gl);

    function render()
    {
        if (pressedKeys["ArrowUp"])
        {
            actions.plot.rotation[0] -= 0.01;
        }
        if (pressedKeys["ArrowDown"])
        {
            actions.plot.rotation[0] += 0.01;
        }
        if (pressedKeys["ArrowRight"])
        {
            actions.plot.rotation[1] += 0.01;
        }
        if (pressedKeys["ArrowLeft"])
        {
            actions.plot.rotation[1] -= 0.01;
        }
        if (pressedKeys["e"])
        {
            actions.plot.translation[2] += 10;
        }
        if (pressedKeys["q"])
        {
            actions.plot.translation[2] -= 10;
        }
        if (pressedKeys["d"])
        {
            actions.plot.translation[0] -= 10;
        }
        if (pressedKeys["a"])
        {
            actions.plot.translation[0] += 10;
        }
        if (pressedKeys["s"])
        {
            actions.plot.translation[1] += 10;
        }
        if (pressedKeys["w"])
        {
            actions.plot.translation[1] -= 10;
        }
        actions.drawScene(false);
        requestAnimationFrame(render);
    }
    render();
}
