var colorsys = require('colorsys');
const template1 = [{beg: 0, end: 94}, {beg: 180, end: 274} ];
const angleStep = 10;

/* 
    result -1 - внутри границы;
    result >=0 - вне границы;
*/
// function minBorderDistance(pixel, template){
//     return template.reduce((distance, section)=>{
//         //если пиксель уже внутри границ, то продолжаем возвращать -1
//         if (distance == 0) return 0;
//         //если пиксель стал внутри границ, начинаем возвращать -1
//         if ((section.beg < pixel.h) && (section.end > pixel.h)){
//             return 0;
//         }
//         if ((section.beg < (pixel.h + 360)) && (section.end > (pixel.h + 360))){
//             return 0;
//         }
//         //иначе возвращаем минимальное значение между границами и предыдущим вычисленным значением
//         return Math.min(Math.abs(pixel.h - section.beg),
//                         Math.abs(pixel.h - section.end),
//                         Math.abs((pixel.h + 360) - section.beg),
//                         Math.abs((pixel.h + 360) - section.end),
//                         distance
//                      );
//     }, 1000);
// }
function distanceMin(){
    var minDistance = {"distance": 1000, "border": 0};
    for (var i = 0; i < arguments.length; i++) {
        if (minDistance.distance > arguments[i].distance) {
            minDistance = arguments[i];
        };
      }
    return minDistance;
}

function minBorderDistance(pixel, template){
    return template.reduce((inf, section)=>{
        //если пиксель уже внутри границ, то продолжаем возвращать -1
        if (inf.distance == 0) return {"distance": 0, "border": 0};
        //если пиксель стал внутри границ, начинаем возвращать -1
        if ((section.beg < pixel.h) && (section.end > pixel.h)){
            return {"distance": 0, "border": 0};
        }
        if ((section.beg < (pixel.h + 360)) && (section.end > (pixel.h + 360))){
            return {"distance": 0, "border": 0};
        }
        //иначе возвращаем минимальное значение между границами и предыдущим вычисленным значением
        return distanceMin({"distance": Math.abs(pixel.h - section.beg), "border": section.beg},
                            {"distance": Math.abs(pixel.h - section.end), "border": section.end},
                            {"distance": Math.abs((pixel.h + 360) - section.beg), "border": section.beg},
                            {"distance": Math.abs((pixel.h + 360) - section.end), "border": section.end},
                            {"distance": inf.distance, "border": 0});
    }, {"distance": 1000, "border": 0})
}

// function getNewdataHSL(dataHSL, template, bestAngle){
//     var newDataHSL = dataHSL;
//     newDataHSL = newDataHSL.map((pixel) => {
//         //console.log(minBorderDistance(pixel, template).distance);
//         pixel.
//         return pixel;
//     }, 0);
// }

function templateRotate(template, angle){
    return template.map((value) => {
        return {"beg": value.beg+angle, "end": value.end+angle};
    })
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
            // template = template1.map((value) => {
            //     return {"beg": value.beg+angle, "end": value.end+angle};
            // })

            template = templateRotate(template1, angle);
            //считаем сумму растояний пикслей до ближайщей границы нового шаблона
            //console.log(dataHSL[0]);


            var sum = dataHSL.reduce((sum, pixel) => {
                //console.log(sum);
                return sum + minBorderDistance(pixel, template).distance;
            }, 0);
            // dataHSL.forEach((pixel) => {
            //     //console.log(sum);
            //     console.log(minBorderDistance(pixel, template));
            // });
            
            //если сумма стала меньше, чем для предыдущих шаблонов - запоминаем этот шаблон
            // console.log("minSumDistance: " + minSumDistance);
            // console.log("sum: " + sum);
            if (minSumDistance > sum) {
                bestAngle = angle;
                //console.log(angle);
            }
            minSumDistance = Math.min(minSumDistance, sum);
        }

        //получем секции идеального шаблона
        // template = template1.map((value) => {
        //     return {"beg": value.beg+bestAngle, "end": value.end+bestAngle};
        // })
        template = templateRotate(template1, angle);

        //получаем ближайщие границы для пикселей
        dataHSL = dataHSL.map((pixel) => {
            //console.log(minBorderDistance(pixel, template).distance);
            var data = minBorderDistance(pixel, template);
            pixel.distance = data.distance; 
            pixel.border = data.border;
            return pixel;
        }, 0);

        // dataHSL.forEach((i) => {
        //     console.log(i.border);
        // });

        console.log(bestAngle);
        //console.log(minBorderDistance({ "h": 50}, template1));

        //var newdataHSL = getNewdataHSL(dataHSL);
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