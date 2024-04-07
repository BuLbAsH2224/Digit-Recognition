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
    let files = [];
    for(let i = 0; i < 10; i++){
        files.push(fs.readdirSync(`train_data/${i}`));
    }

    let num = Math.min(files[0].length,files[1].length,files[2].length,files[3].length,files[4].length,files[5].length,files[6].length,files[7].length,files[8].length,files[9].length)
        for(let i = 0; i < num; i++){

          
      
            for(let j = 0; j < 10;j++){
                if(files[j][i] != undefined && files[j][i] != null){
                let imagePath = `train_data/${j}/${files[j][i]}`;
                const promise = getImage(imagePath)
                 .then(img => {
                     if (img) { 
                        train_data.push({
                            input: img.data,
                            output: {[j]: 1}
                        });
                         console.log(j + " " + files[j][i] + " load" );
                     }
                 });
                 promises.push(promise);
                 if(promises.length >= 1) {
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
         let rezize = grey.resize({ width: 28,height:28 });
        
         let ImgData = {
            data: []
        }
        for(let i = 0; i < rezize.data.length;i++){
         ImgData.data.push(rezize.data[i] / 255);
        }

        return ImgData;
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

  if(key.name === 'n'){ //save model
    const json = JSON.stringify(net.toJSON());
    let date = new Date()
    let name = `model_${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}-${date.getMilliseconds()}.txt`     
    fs.writeFile(name, json, function(error){
        if(error){  // если ошибка
            return console.log(error);
        }
        console.log(`The file ${name} was successfully written`);
    });
  }


  if(key.name === 'm'){ //load model
      let filename = "" + ".txt" //enter filename

      try{
        let file = fs.readFileSync(filename, 'utf8')
        if(file != undefined && file != null){
        const json = JSON.parse(file);
        net.fromJSON(json);
        console.log("file is load!")
        }
    }
    catch{console.log("Error load file")};
     
      
  }
}
);


 
 

