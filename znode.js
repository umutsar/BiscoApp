
const data = "1838FF2FDFF2D0FF0FFEF6FF40FF41FF40FF40FF41FF0FFEF3FFEF4FFEF6FFEF4FFEF4FFEF3FFEF6FFEF3FFEEEFFEEFFFEEFFFEF1FFEF1FFEF1FFEF2FFEF3FFEF3FFEF3FFEF3FFEF"





const fullData = "38 ff 18 ff 02 ff e7 ff 02 ff 8a ff 00 ff 00 ff 0e ff 86 ff 41 ff 41 ff 41 ff 40 ff 00 ff 00 ff 00 ff 0e ff 84 ff 0e ff 85 ff 0e ff 85 ff 0e ff 85 ff 0e ff 85 ff 0e ff 85 ff 0e ff 86 ff 0e ff 85 ff 0e ff 7e ff 0e ff 7f ff 0e ff 80 ff 0e ff 80 ff 0e ff 81 ff 00 ff 80 ff 56 ff 00 ff 08 ff 00 ff 00 ff 00 ff 00 ff 31 ff 01 ff 00 ff 08 ff d1"

const yeniData = "FF12FF34FF"

console.log("Son iki değer: ");
if (yeniData[yeniData.length - 1] + yeniData[yeniData.length - 2] == "FF") {
    console.log("mal")
}

const modifiedData = yeniData.split("FF").filter(part => part.length > 0).map(part => parseInt(part, 16));

console.log(modifiedData)

let previousTime = new Date();

setTimeout(() => {
    if(new Date - previousTime > 1,99) {
        console.log("AAAAAAAAAAAAAAAAA")
    }
}, 5);