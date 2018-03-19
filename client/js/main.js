

window.onload = function(){
    draw();

    function draw(){
        img = document.getElementsByTagName("img")[0];
        img.crossOrigin = "Anonymous";
        img.setAttribute('crossOrigin', '')
        console.log(img);
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        //img.style.display = 'none';

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
           
        var invert = function() {
            for (var i = 0; i < data.length; i += 4) {
            data[i]     = 256 - data[i];     // red
            data[i + 1] = 256 - data[i + 1]; // green
            data[i + 2] = 256 - data[i + 2]; // blue
            }
            //img.style.display = '';
            ctx.putImageData(imageData, 0, 0);
        };
        invert(); 
    }
}