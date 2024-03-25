
const readline = require('readline');
const fs = require('fs');
const brain = require("brain.js");
const IJS = require("image-js")
let net = null;
let train_data = [];
let testing_data = [];
net = new brain.NeuralNetwork();

async function loadImagesForTesting() {
    
    const promises = [];

        for(let i = 0; i <= 9; i++){

            let files = fs.readdirSync(`testing/${i}`);
            for(let j = 0; j < files.length;j++){
                let imagePath = `testing/${i}/${files[j]}`;
                const promise = getImage(imagePath)
                 .then(img => {
                     if (img) { 
                        testing_data.push({
                            Path: imagePath,
                             data: img.data,
                             Number: [i]
                         });
                         console.log(i+ " " + j);
                     }
                 });
                 promises.push(promise);
                 if(promises.length >= 100) {
                     await Promise.all(promises);
                     promises.length = 0; 
                 }
            }
        }
        if(promises.length > 0) {
            await Promise.all(promises);
        }  
}

async function loadImagesYourExamples() {
    
    const promises = [];

        for(let i = 0; i <= 9; i++){

            let files = fs.readdirSync(`YourExamples/${i}`);
            if(files.length != 0){
            for(let j = 0; j < files.length;j++){
                let imagePath = `YourExamples/${i}/${files[j]}`;
                const promise = getImage(imagePath)
                 .then(img => {
                     if (img) { 
                        testing_data.push({
                            Path: imagePath,
                             data: img.data,
                             Number: [i]
                         });
                         console.log(i+ " " + j);
                     }
                 });
                 promises.push(promise);
                 if(promises.length >= 100) {
                     await Promise.all(promises);
                     promises.length = 0; 
                 }
            }
        }
        }
    
        if(promises.length > 0) {
            await Promise.all(promises);
        }  
}

 async function loadImagesTrain() {
     const promises = [];
     for(let j = 0; j < 10; j++){ //max j = 5400 (with my dataset)
         for(let i = 0; i <= 9; i++){
             const promise = getImage(`train_data/${i}/${j}.png`)
                 .then(img => {
                     if (img) { 
                         train_data.push({
                             input: img.data,
                             output: {[i]: 1}
                         });
                         console.log(i+ " " + j);
                     }
                 });
             promises.push(promise);
             if(promises.length >= 100) {
                 await Promise.all(promises);
                 promises.length = 0; 
             }
         }
     }
     if(promises.length > 0) {
         await Promise.all(promises);
     }
 }
 

 loadImagesTrain().then(() => {
    net.train(train_data, {
               log: true
           });
            console.log("The neural network is ready to go!");
 })
 loadImagesForTesting().then(() => {loadImagesYourExamples()})

 async function getImage(put) {
     try {
         let image = await IJS.Image.load(put);
         let grey = image.grey();
        for(let i = 0; i < grey.data.length;i++){
             if(Math.round(grey.data[i]) != 0){
                grey.data[i] = 1;
             }
            else grey.data[i] = 0;
        // grey.data[i] = grey.data[i] / 255;  // If this is included, the training will be very long
         }
        
 
         return grey;
     } catch (error) {
         console.error(`Error loading image ${put}: ${error}`);
         return null;
     }
 }
 let results = [];

 readline.emitKeypressEvents(process.stdin);
 process.stdin.setRawMode(true);
 
 process.stdin.on('keypress', (str, key) => {
 
   if (key.name === 'b') { // test console
    console.log("Console working!");
  }
  if(key.name === 'v'){  // show wrong results (After pressing Button C)
    if(results.length ==  0){
        console.log("Press the C button first!")
    }
    else{
    for (let item of results) {
        if(item.answer != item.number){
         console.log(`Neural Network's answer: ${item.answer}. Real Number: ${item.number}. Image Path: ${item.ImagePath}`)
        }
     }
    }
  }
  if (key.name === 'c') { // tests the neural network
    results = [];
    for (let item of testing_data) {
        results.push({
            ImagePath: item.Path,
            answer: brain.likely(item.data,net),
            number: item.Number[0]
        });

    }
    let Right = [];
    let errors = [];
    for (let item of results) {
       if(item.answer != item.number){
        errors.push(" ") // ¯\_(ツ)_/¯
       }
       else if(item.answer == item.number){
        Right.push(" ") // ¯\_(ツ)_/¯
       }
    }
console.log(`Correct answers: ${Right.length}. Wrong answers:  ${errors.length}`);
console.log(`Percentage of correct answers: ${(Right.length / testing_data.length) * 100}%`)

  }
 });


 
 

