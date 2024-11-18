// const data = "0BFF16FF21";

// // Ayırma ve decimal'e çevirme işlemi
// const modifiedData = data.split("FF").filter(part => part.length > 0).map(part => parseInt(part, 16));

// console.log(modifiedData);  // Çıktı: [ 11, 22, 33 ]

// 10 baytlık bir veri dizisi (örnek olarak)
let data = "10025525550255200302557090255";

// "255" değerinden ayırarak bir dizi oluştur
let resultArray = data.split("255");

// Sonuç dizisini ekrana yazdır
console.log(resultArray);
