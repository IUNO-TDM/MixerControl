var randomColor = require('randomcolor');

var VibrantService = function () {

};

VibrantService.calculate = function (imageBuffer) {
    return new Promise((resolve, reject) => {
        // var Vibrant = require('node-vibrant');
        // const svg2png = require("svg2png");

        resolve(randomColor({luminosity: "bright", count: 1})[0]);


        // svg2png(imageBuffer,{width:300,height:300}).then(buffer=>{
        //   var v = new Vibrant(buffer);
        //   v.getPalette((err, palette)=>{
        //     if(err){
        //       reject(err);
        //     }else{
        //       if (palette.LightVibrant){
        //         resolve(palette.LightVibrant.getHex())
        //       }else if (palette.DarkVibrant){
        //         resolve(palette.DarkVibrant.getHex())
        //       }else if (palette.Vibrant){
        //         resolve(palette.Vibrant.getHex())
        //       }else if(palette.LightMuted){
        //         resolve(palette.LightMuted.getHex())
        //       }else if (palette.Muted){
        //         resolve(palette.Muted.getHex())
        //       }else if (palette.DarkMuted){
        //         resolve(palette.DarkMuted.getHex())
        //       }else{
        //         reject(err);
        //       }
        //
        //     }
        //   })
        // });


    })
};

module.exports = VibrantService;
