chrome.runtime.onStartup.addListener(function() { 
    links = [];
    chrome.storage.sync.get('fav', function(result){
        links = result.fav;
        console.log(links);
        if (result.fav != ''){
        for(i = 0; i < links.length; i ++)
            {
            chrome.tabs.create({url: links[i], active : false});
            }
        }
    })
});