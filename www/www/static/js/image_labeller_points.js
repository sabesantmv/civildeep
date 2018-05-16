    var Points = [];
    var is_pathComplete = false;

    $(document).ready(function() {
        var canvas = document.getElementById('canvas') 
        var ctx = canvas.getContext('2d');
        var img = new Image()
        img.src = STATIC_URL + 'assets/640px-Hallstatt.jpg';
        img.onload = function () {
            ctx.drawImage(img, 0, 0);
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;

        };
        initDraw(canvas);
    });

    function initDraw(canvas) {

        function drawPoints(ctx, pos){
            var pointSize = 3; // Change according to the size of the point.
            ctx.fillStyle = "#ff2626"; // Red color

            ctx.beginPath(); //Start path
            ctx.arc(pos.x, pos.y, pointSize, 0, Math.PI * 2, true); // Draw a point using the arc 
            ctx.fill(); // Close the path and fill.

        }

        function drawLins(ctx, pos1, pos2){
            ctx.strokeStyle = 'white';
            ctx.beginPath(); //Start path
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y, 6);
            ctx.stroke();
        }

        canvas.onclick = function (e) {
            if(!is_pathComplete)
            {
                var ctx = canvas.getContext('2d');
                var c_pos = {x:0, y:0};
                // c_pos.x = getMousePosition(e).x - this.offsetLeft;
                // c_pos.y = getMousePosition(e).y - this.offsetTop;

                var rect = canvas.getBoundingClientRect();
                c_pos.x = e.clientX - rect.left; // x == the location of the click in the document - the location (relative to the left) of the canvas in the document
                c_pos.y = e.clientY - rect.top; // y == the location of the click in the document - the location (relative to the top) of the canvas in the document
                // This method will handle the coordinates and will draw them in the canvas.
     
                Points.push(c_pos);                
                if (Points.length > 1) {
                    var f_pos = Points[0]
                    var dist = Math.hypot(c_pos.x - f_pos.x, c_pos.y - f_pos.y);
                    if(dist < 20)
                    {
                        Points[Points.length-1] = f_pos;
                        is_pathComplete = true;
                    }
                    else
                        drawPoints(ctx, c_pos)
                    drawLins(ctx, Points[Points.length-2], Points[Points.length-1])
                }
                else{
                    drawPoints(ctx, c_pos)
                }

            }
        }
    }