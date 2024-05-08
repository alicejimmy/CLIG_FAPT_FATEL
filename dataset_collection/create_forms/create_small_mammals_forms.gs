// Get the ID of this URL in the google drive
function getFolderId(folderUrl) {
  var regex = /folders\/([a-zA-Z0-9_-]+)/;
  var match = folderUrl.match(regex);
  return match ? match[1] : null;
}

// Save file name and ID to csv file
function storeSMAsCSV(imageID, folder) {
  var formsFolder;
  if (folder.getFoldersByName("forms").hasNext()) {
    formsFolder = folder.getFoldersByName("forms").next();
  } else {
    formsFolder = folder.createFolder("forms");
  }

  var csvContent = 'image_name,image_ID\n';
  for (var i = 0; i < imageID.length; i++) {
    csvContent += imageID[i].join(",") + "\n";
  }

  var csvFile;
  if (formsFolder.getFilesByName("small_mammals_imageID.csv").hasNext()) {
    csvFile = formsFolder.getFilesByName("small_mammals_imageID.csv").next();
  } else {
    csvFile = formsFolder.createFile("small_mammals_imageID.csv", "");
  }
  csvFile.setContent(csvContent);
}

// Get the ID of all images in the google drive
function getSMImageID(folder) {
  var select_images_folder = folder.getFoldersByName('select_images').next();
  var images_folder = select_images_folder.getFoldersByName('small_mammals').next();
  var files = images_folder.getFiles();
  
  // Save the file name and ID of each image after shuffling the order
  var imageID =[];
  for (var i = 0; files.hasNext(); i++){
      var file = files.next();
      var data =[file.getName(),file.getId()];
      imageID[i] = data;
  }
  imageID.sort(function() {return (0.5-Math.random());});
  // Save file name and ID to csv file
  storeSMAsCSV(imageID, folder);

  return imageID
}

// make forms
function makeSMForm(title, desc, folderUrl, option, questionsPerPage, questionsPerForm) {
  // Get the ID of this URL in the google drive
  var folderId = getFolderId(folderUrl);
  var folder = DriveApp.getFolderById(folderId);

  // Get the ID of all images in the google drive
  var imageID = getSMImageID(folder);
  console.log(imageID[0][0])
  console.log("Start making forms")

  for (var i=0; i<imageID.length; i++) {
    if (i % questionsPerForm === 0) {
      form = FormApp.create(title + '(' + (i/questionsPerForm+1) + ')');
      form.setDescription(desc);
      var nameItem = form.addTextItem();
      nameItem.setTitle('請輸入您的姓名:').setRequired(true);
    }

    var googleUrl = 'https://drive.usercontent.google.com/u/3/uc?id=';
    var imgUrl = googleUrl + imageID[i][1] + '&export=download';
    var img = UrlFetchApp.fetch(imgUrl);
    Utilities.sleep(100);
    var imgItem = form.addImageItem();
    try {
      imgItem.setImage(img);
    } catch (e) {
      Utilities.sleep(500);
      imgItem.setImage(img);
    }
    
    Utilities.sleep(10);
    var item = form.addMultipleChoiceItem();
    item.setTitle('Q' + (i+1) + ': 上圖是什麼動物?')
    .setChoices([
      item.createChoice(option[0]),
      item.createChoice(option[1]),
      item.createChoice(option[2]),
      item.createChoice(option[3]),
      item.createChoice(option[4])
    ])
    .setRequired(true)

    if ((i+1) % questionsPerPage === 0 && (i+1) < imageID.length) {
      form.addPageBreakItem();
    }
  }
}

function mainSM() {
  /* Remember to manually move the completed questionnaire to /create_forms/small_mammals/ */
  /* Remember to switch the executed function to mainSM */
  /* Remember to change folderUrl to the URL of your own google drive */

  // The shared URL of the "create_forms" folder in the google drive
  var folderUrl = 'https://drive.google.com/drive/folders/159kuW7UcAXa887-XzOXwkEAZC41lM01M?usp=sharing';
  // Questions per page
  var questionsPerPage = 20;
  // Questions per form
  var questionsPerForm = 100;
  
  // Forms title
  var title = 'Cifar100的小型哺乳類動物(small mammals)問卷';
  // Forms introduction
  var desc = 'Cifar100的小型哺乳類動物(small mammals)，包含倉鼠(hamster), 老鼠(mouse), 兔子(rabbit), 錢鼠(shrew), 松鼠(squirrel)，共五種類別，請選出每張圖片的動物為以上五種中的哪個類別。\nCifar100的小型哺乳類動物(small mammals)問卷總題數共500題，由於題數較多，因此問卷會分成5份，每份100題，請確定每份皆有填寫。';
  // Question options
  var option = ['倉鼠', '老鼠', '兔子', '錢鼠', '松鼠'];
  
  // make forms
  makeSMForm(title, desc, folderUrl, option, questionsPerPage, questionsPerForm)
}