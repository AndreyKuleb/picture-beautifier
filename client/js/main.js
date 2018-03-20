var colorsys = require('colorsys');
const template1 = [{beg: 0, end: 94}, {beg: 180, end: 274} ];
const angleStep = 10;

/* 
    result -1 - внутри границы;
    result >=0 - вне границы;
*/
function minBorderDistance(pixel, template){
    return template.reduce((distance, section)=>{
        //если пиксель уже внутри границ, то продолжаем возвращать -1
        if (distance == 0) return 0;
        //если пиксель стал внутри границ, начинаем возвращать -1
        if ((section.beg < pixel.h) && (section.end > pixel.h)){
            return 0;
        }
        if ((section.beg < (pixel.h + 360)) && (section.end > (pixel.h + 360))){
            return 0;
        }
        //иначе возвращаем минимальное значение между границами и предыдущим вычисленным значением
        return Math.min(Math.abs(pixel.h - section.beg),
                        Math.abs(pixel.h - section.end),
                        Math.abs((pixel.h + 360) - section.beg),
                        Math.abs((pixel.h + 360) - section.end),
                        distance
                     );
    }, 1000);
}

window.onload = function(){
    draw();

    function draw(){
        var img = document.getElementsByTagName("img")[0];
        img.crossOrigin = "Anonymous";
        img.setAttribute('crossOrigin', '')
        //console.log(img);
        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        //img.style.display = 'none';

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var data = imageData.data;
        var tempHSL, tempRGB;   
        //console.log(data.length);
        var dataHSL = [];
        for (var i = 0; i < data.length; i += 4) {
            dataHSL.push(colorsys.rgb_to_hsl({ r: data[i], g: data[i + 1], b: data[i + 2] }));
        };

        var template = template1;
        var minSumDistance = Infinity;
        var bestAngle = 0;
        //перебираем возможные углы поворота шаблона
        for (var angle = 0; angle<=360; angle+=angleStep){
            //поворачиваем шаблон
            template.map((value) => {
                return {"beg": value+angleStep, "end": value+angleStep};
            })
            //считаем сумму растояний пикслей до ближайщей границы нового шаблона
            var sum = dataHSL.reduce((pixel) => {
                return minBorderDistance(pixel, template)
            });
            //если сумма стала меньше, чем для предыдущих шаблонов - запоминаем этот шаблон
            if (minSumDistance - sum) bestAngle = angle;
            minSumDistance = Math.min(minSumDistance, sum);
        }

        console.log(bestAngle);
        //console.log(minBorderDistance({ "h": 50}, template1));

        var invert = function() {
            for (var i = 0; i < data.length; i += 4) {
            tempHSL = colorsys.rgb_to_hsl({ r: data[i], g: data[i + 1], b: data[i + 2] });
            //console.log(tempHSL);
            tempRGB = colorsys.hslToRgb({ h: tempHSL.h, s: tempHSL.s, l: tempHSL.l});
            //console.log(colorsys.rotateHue(200, 200));
            data[i]     = 256 - tempRGB.r//data[i];     // red
            data[i + 1] = 256 - tempRGB.g//data[i + 1]; // green
            data[i + 2] = 256 - tempRGB.b//data[i + 2]; // blue
            }
            //img.style.display = '';
            ctx.putImageData(imageData, 0, 0);
        };
        //invert(); 
    }
}