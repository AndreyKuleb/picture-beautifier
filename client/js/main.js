var colorsys = require('colorsys');
var gaussian = require('gaussian');

const gausMean = 0;
const gausVariance = 0.2;

const template_base1_halfwidth = 20;
const template_base1 = [{
    beg: 0,
    end: 40
}, {
    beg: 180,
    end: 240
}];
// const template_base1_halfwidth = 47;
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

//Возвращает пиксель с минимальным размером дистанции до ближайщей границы
function distanceMin() {
    var minDistance = {
        "distance": 1000,
        "border": 0
    };
    for (var i = 0; i < arguments.length; i++) {
        if (minDistance.distance > arguments[i].distance) {
            minDistance = arguments[i];
        };
    }
    return minDistance;
}

//Возвращает объет данных с ближайшей для пикселя границей и расстоянием до неё
function minBorderDistance(pixel, template) {
    return template.reduce((inf, section) => {
        //если пиксель уже внутри границ, то продолжаем возвращать -1
        if (inf.distance == 0) return {
            "distance": 0,
            "border": 0
        };
        //если пиксель стал внутри границ, начинаем возвращать -1
        if ((section.beg < pixel.h) && (section.end > pixel.h)) {
            return {
                "distance": 0,
                "border": 0
            };
        }
        if ((section.beg < (pixel.h + 360)) && (section.end > (pixel.h + 360))) {
            return {
                "distance": 0,
                "border": 0
            };
        }
        //иначе возвращаем минимальное значение между границами и предыдущим вычисленным значением
        return distanceMin({
            "distance": Math.abs(pixel.h - section.beg),
            "border": section.beg
        }, {
            "distance": Math.abs(pixel.h - section.end),
            "border": section.end
        }, {
            "distance": Math.abs((pixel.h + 360) - section.beg),
            "border": section.beg
        }, {
            "distance": Math.abs((pixel.h + 360) - section.end),
            "border": section.end
        }, {
            "distance": inf.distance,
            "border": inf.border
        });
    }, {
        "distance": 1000,
        "border": 0
    })
}

//Возвращает массив пикселей с новыми значениями h
function getNewdataHSL(dataHSL, template, bestAngle) {
    var newDataHSL = dataHSL;
    newDataHSL = newDataHSL.map((pixel) => {
        //console.log(pixel);
        if (pixel.distance != 0) {
            //console.log("pixel.distance > 0");
            var truePixel;
            if (Math.abs(pixel.h - pixel.border) < Math.abs(pixel.h + 360 - pixel.border)) {
                truePixel = pixel;
            } else {
                truePixel = pixel;
                truePixel.h += 360;
            }

            if (truePixel.h > truePixel.border) {
                truePixel.h = (truePixel.border - template_base1_halfwidth) +
                    template_base1_halfwidth * (1 - gaussian(gausMean, gausVariance).pdf(truePixel.h - truePixel.border));
                    //console.log((truePixel.border - template_base1_halfwidth) + template_base1_halfwidth * (1 - gaussian(gausMean, gausVariance).pdf(truePixel.h - truePixel.border)));
            } else {
                truePixel.h = (truePixel.border + template_base1_halfwidth) -
                    template_base1_halfwidth * (1 - gaussian(gausMean, gausVariance).pdf(truePixel.border - truePixel.h));
               // console.log(truePixel.h = (truePixel.border + template_base1_halfwidth) - template_base1_halfwidth * (1 - gaussian(gausMean, gausVariance).pdf(truePixel.border - truePixel.h)));
            }
            //console.log(truePixel.border);
            //console.log(truePixel.h);
            
            return truePixel;
        }
        else return pixel;
    });
    return newDataHSL;
}

//Поворачивает шаблон на указанный угол
function templateRotate(template_base, angle) {
    return template_base.map((value) => {
        return {
            "beg": value.beg + angle,
            "end": value.end + angle
        };
    })
}

function getImageDataFromDocumentImage(){
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
    return imageData;
}

function dataRGBToHSL(data){
    var dataHSL = [];
    for (var i = 0; i < data.length; i += 4) {
        dataHSL.push(colorsys.rgb_to_hsl({
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
        }));
    };
    return dataHSL;
}

//главная функция программы
window.onload = function () {
    draw();

    function draw() {
        var imageData = getImageDataFromDocumentImage();
        var data = imageData.data;
        var tempHSL, tempRGB;
        //console.log(data.length);
        
        var dataHSL = dataRGBToHSL(data);
        var template = template_base1;
        var minSumDistance = Infinity;
        var bestAngle = 0;
        //перебираем возможные углы поворота шаблона
        for (var angle = 0; angle <= 360; angle += angleStep) {
            
            //поворачиваем шаблон
            template = templateRotate(template_base1, angle);

            //console.log(dataHSL[0]);

            //считаем сумму растояний пикслей до ближайщей границы нового шаблона
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
        template = templateRotate(template_base1, angle);

        //получаем ближайщие границы для пикселей
        dataHSL = dataHSL.map((pixel) => {
            //console.log(minBorderDistance(pixel, template).distance);
            var data = minBorderDistance(pixel, template);
            pixel.distance = data.distance;
            pixel.border = data.border;
            return pixel;
        }, 0);

        // dataHSL.forEach((i) => {
        //     console.log(i.h);
        // });

        console.log(bestAngle);
        //console.log(minBorderDistance({ "h": 50}, template1));
        //console.log(gaussian(gausMean, gausVariance).pdf(0));
        var newdataHSL = getNewdataHSL(dataHSL);

        // newdataHSL.forEach((i) => {
        //     console.log(i.h);
        // });

        var applyColor = function () {
            var i = 0;
            newdataHSL.forEach((pixel) => {
                //console.log(pixel);
                if (pixel.h > 360) pixel.h-=360;
                tempRGB = colorsys.hslToRgb({
                    "h": pixel.h,
                    "s": pixel.s,
                    "l": pixel.l
                });
                // console.log(tempRGB.r);
                // console.log(data[i]);
                // console.log(tempRGB.g);
                // console.log(data[i+1]);
                // console.log(tempRGB.b);
                // console.log(data[i+2]);
                //console.log(colorsys.rotateHue(200, 200));
                data[i] = tempRGB.r //data[i];     // red
                data[i + 1] = tempRGB.g //data[i + 1]; // green
                data[i + 2] = tempRGB.b //data[i + 2]; // blue
                i+=4;
            });

            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            console.log("Программа выполнена успешно!");
        };
        
        applyColor();

    }
}