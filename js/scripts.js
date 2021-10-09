

getItems();

var addLinks = document.querySelector('button.add-links');
if (addLinks){
    addLinks.addEventListener('click', async function(){
        var currentItems = localStorage.getItem('link-items');
        var itemsArr = JSON.parse(currentItems);
        itemsArr = itemsArr || [];
        linkArr = await getAllTabURLs();
        linkTitle = linkArr[0];
        linksToOpen = linkArr.splice(1);
        console.log(linkTitle + ' opens: '+ linksToOpen);
        itemsArr.push({"item":linkTitle, "links": linksToOpen, "fav": false, "customTitle" : false});
        saveItems(itemsArr);
        getItems();
    });
}

var deleteButton = document.querySelector('button.delete-all');
if (deleteButton){
    deleteButton.addEventListener('click', async function(){
        deleteAll();
        getItems();
    })
}

var checkTabs = document.querySelector('button-check-tabs');
if (checkTabs){
    checkTabs.addEventListener('click', async function(){
        tabs = await getAllTabURLs();
    });
}


function getItems(){

    const itemsList = document.querySelector('ul.link-list');
    var newItemHTML = '';
    try{
        var items = localStorage.getItem('link-items');
        var itemsArr = JSON.parse(items);
        for(var i = 0; i < itemsArr.length; i++){
            if (itemsArr[i].fav == false) {
                newItemHTML += `<div class = "hovercheck"> <li data-itemindex = "${i}" data-links = "${itemsArr[i].links}" class = "list-item"><span class="link-title" >${itemsArr[i].item}</span><div class = "buttons"><span class = "itemFavorite">⭐</span><span class = "itemUpdate" title = "Replace link with current tabs">🔄</span><span class = "itemEdit">✏️️</span><span class = "itemDelete">🗑️</span></div></li></div>`;
            } else {
                newItemHTML += `<div class = "hovercheck"><li data-itemindex = "${i}" data-links = "${itemsArr[i].links}" class = "list-item"><div class = "favorited"><span class = "itemFavorite">⭐</span></div><span class="link-title" >${itemsArr[i].item}</span><div class = "buttons"><span class = "itemUpdate" title = "Replace link with current tabs">🔄</span><span class = "itemEdit">✏️️</span><span class = "itemDelete">🗑️</span></div></li></div>`;
            }
        }
        itemsList.innerHTML = newItemHTML;
        var itemsListUL = document.querySelectorAll('li');
        for (var i = 0; i< itemsListUL.length; i++){
            itemsListUL[i].querySelector('.link-title').addEventListener('click', function(){
                var links = this.parentNode.dataset.links;
                console.log(links)
                openAllURLs(links);
            });
            itemsListUL[i].querySelector('.itemFavorite').addEventListener('click', function(){
                console.log('fav');
                var index = this.parentNode.parentNode.dataset.itemindex;
                
                itemFavorite(index);
                getItems();
            });

            itemsListUL[i].querySelector('.itemEdit').addEventListener('click', function(){
                var index = this.parentNode.parentNode.dataset.itemindex;
                itemEdit(index);

            });

            itemsListUL[i].querySelector('.itemUpdate').addEventListener('click', async function(){
                var index = this.parentNode.parentNode.dataset.itemindex;
                itemUpdate(index);
                getItems();
            });
            itemsListUL[i].querySelector('.itemDelete').addEventListener('click', function(){

                var index = this.parentNode.parentNode.dataset.itemindex;
                itemDelete(index);
                getItems();

            });
        }
    }
    catch(e){
    }
}

function itemDelete(index){

    var itemsStorage = localStorage.getItem('link-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.splice(index, 1);
    saveItems(itemsArr);
    document.querySelector('ul.link-list li[data-itemindex="'+index+'"]').remove();
}
function itemEdit(index){
    var itemsStorage = localStorage.getItem('link-items');
    var itemsArr = JSON.parse(itemsStorage);
    var toEdit = document.querySelector('ul.link-list li[data-itemindex ="'+index+'"');
    original = toEdit.innerHTML;
    textHolder = itemsArr[index].item;
    toEdit.innerHTML = `<input name = "editTitle" id = "editTitle" type = "text" value = "${itemsArr[index].item}" size = "28"></input><div><span class="itemDone">✔️️</span><span class="itemCancel">❌</span></div>`;
    toEdit.querySelector('.itemDone').addEventListener('click', function(){
        newVal = document.getElementById("editTitle").value
        console.log(newVal);
        if (newVal == ""){
            alert("Please enter a valid title");
        } else{
            itemsArr[index].item = newVal;
            itemsArr[index].customTitle = true;
            saveItems(itemsArr);
            getItems(); 
        }
    });
    toEdit.querySelector('.itemCancel').addEventListener('click', function(){
        toEdit.innerHTML = original;
        getItems();
    });
    saveItems(itemsArr);
}

function saveItems(obj){
    var string = JSON.stringify(obj);
    localStorage.setItem('link-items', string);
}

function getAllTabURLs(){
    // returns an array where linkArr00[0] is the combined title of the links and linkArr00.slice(1) contains all the individual links
    return new Promise((resolve, reject) => {
        try{
            chrome.tabs.query({}, function(tabs){
                title = "";
                var allTabsArr = [""];
                for(var i = 0; i < tabs.length; i++){
                    var aTab = tabs[i]
                    var aTabURL = aTab.url;
                    allTabsArr.push(aTabURL);
                    var fortitle = aTabURL.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
                    title += fortitle + ', ';
                }
                allTabsArr[0] = title.slice(0, -2);
                resolve(allTabsArr);
            
            });

        }
        catch(e){
            reject(e);
        }
    });
}
function openAllURLs(URLs){
    URLArr = URLs.split(',');
    for(i = 0; i < URLArr.length; i++){
        chrome.tabs.create({url: URLArr[i], active: false});
    }
    
}
function itemFavorite(index){
    var itemStorage = localStorage.getItem('link-items');
    var items = JSON.parse(itemStorage);
    favoriteItem = items[index];
    if (items[index].fav == false){
        items.splice(index, 1);
        items.unshift(favoriteItem);
        for(i = 1; i < items.length; i++){
            items[i].fav = false;
        }
        items[0].fav = true;
    }
    else{
        items[index].fav = false;
    }


    saveItems(items);
    getItems();
}

function deleteAll(){
    var empty = [];
    saveItems(empty);
}

function itemDelete(index){

    var itemsStorage = localStorage.getItem('link-items');
    var itemsArr = JSON.parse(itemsStorage);
    itemsArr.splice(index, 1);
    saveItems(itemsArr);
}
async function itemUpdate(index){
    var itemsStorage = localStorage.getItem('link-items');
    var itemsArr = JSON.parse(itemsStorage);
    linkArr = await getAllTabURLs();
    linkTitle = '';
    wasFav = itemsArr[index].fav;
    hasCustomTitle = itemsArr[index].customTitle;

    if (hasCustomTitle == true){
        linkTitle = itemsArr[index].item;
    }
    else{
        linkTitle = linkArr[0];
    }
    linksToOpen = linkArr.splice(1);
    itemsArr.splice(index, 1, {"item":linkTitle, "links": linksToOpen, "fav": wasFav, "customTitle" : hasCustomTitle});
    saveItems(itemsArr);
    getItems();
}

getItems();