//localStorage.clear();
let categorizedUrls = [];
// Track id of elements
let urlIdNumber = 0;
// Track paginationPageNumber when navigating pages.
let paginationPageNumber = 0;
let edit = false;
const maxPageNumber = 5;

const itemList = document.querySelector('.links__list');
const pagination = document.querySelector('.pagination');


/******************HELPER FUNCTIONS******************/

// Template function to create elements with class and optional href or text
function createDynamicElements(elementType, className, href = null, text = null) {
    const element = document.createElement(elementType);
    if(className)element.classList.add(className);
    if (href) element.href = href;
    if (text) element.textContent = text;
    return element;
}
//On each page refresh re apply page id's to stored id's
function updateLocalStorageID(parsedData) {
    for (let i = 0; i < parsedData.length; i++) {
        urlIdNumber++;
        parsedData[i].id = urlIdNumber;
    }
}
// Update the pagination numberson how many url's have been added 5 links a page.
function updatingPagination() {
    // Calculate how many page numbers to add based on categorizedUrls.length
    const totalUrlPages = Math.ceil(categorizedUrls.length / maxPageNumber);
    if (totalUrlPages > 0) {
        // clear the ol of page numbers then re apply based on number of links
        pagination.querySelector('ol').innerHTML = '';
        for (let i = 0; i < totalUrlPages; i++) {
            const num = document.createElement('li');
            const textNode = document.createTextNode((i + 1).toString());
            num.appendChild(textNode);
            pagination.querySelector('ol').appendChild(num);
            if (i === 0) num.classList.add('active');
        }
    } else {
        return;
        // If there are no pages to show or pagination is hidden
    }
}
/******************HELPER FUNCTIONS******************/



function updateLocalStorageElementsOnLoad(){
    const parsedData = JSON.parse(localStorage.getItem('categorizedUrls'));
    // check to see if any links have been added
    if(parsedData){
        // update id based on number of links added
        updateLocalStorageID(parsedData);
        //keep local and storage arrays up to date
        categorizedUrls = [...parsedData];
        // Limit the loop iterations to a maximum of 2 or the length of the array, whichever is smaller
        const loopLimit = Math.min(5, categorizedUrls.length);
        for(let i = 0; i < loopLimit; i++)createDynamicElementsForDom(parsedData[i].url,parsedData[i].id)
        updatingPagination();
    }
}


/******************FORM VALIDATION******************/
// function fired when form submitted check url is valid and exsists 
async function submitForm(event) {
    event.preventDefault();
    // when new link is added add to the number of id's
    const url = document.getElementById("link").value;
    // Wait for the promise to resolve
    const isValid = await checkUrlStructure(url); 
    document.querySelector('.url-input .error-message').textContent = isValid;
    document.querySelector('.empty-message').classList.add('hide');
    event.target.reset();
};

// Check if the URL is valid 
async function checkUrlStructure(url) {
    // Regex pattern to validate URLs starting with http(s):// and a valid domain name
    if(/^(http(s):\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g.test(url)) {
        try {
            return await checkUrlExsists(url);
        } catch (error) {
            console.error('An error occurred while checking URL status:', error);
        }
    } else {
        return 'Please enter a valid URL.';
    }
};

// Check if the URL exsists
async function checkUrlExsists(url) {
    // URL fetch may take some time add loader so the user can see a response
    const loader = document.querySelector('.loader');
    loader.style.display = 'block';
    try {
        const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${url}`);
        loader.style.display = 'none';
        // If a valid url then update and send user through to results page
        if (response.status === 200) {
            // split into categories to check what needs updating.
            if(!edit)categorizedUrls.push({url: url});
            // Update the local storage categorizedUrls URL
            localStorage.setItem("categorizedUrls", JSON.stringify(categorizedUrls));
            // Pass url through to results page
            window.location.href = `results.html?url=${encodeURIComponent(url)}`;
            // revert link state back to null so urls can bee added with the correct campaign
            edit = false;
        } else {
            return 'The provided URL does not exist.';
        }
    } catch (error) {
        loader.style.display = 'none';
        console.error('An error occurred:', error);
        return 'An error occurred while checking the URL, please try re submitting your URL';
    }
};
/******************FORM VALIDATION******************/


/******************LIST OF LINKS******************/
function createDynamicElementsForDom(link,id) {
    // insread of genrating the id here add it to the ;ink list 
    const maxLink = link.length > 65 ? link.substring(0, 65) + '...' : link;
    const listItem = document.createElement('li');
    // Pass all dynamicly created elements through to template function 
    const linkContainer = createDynamicElements('div', 'link-container');
    const anchorTag = createDynamicElements('a', 'link-container__link', link, maxLink);
    linkContainer.setAttribute('id', id);
    
    const errorDiv = createDynamicElements('div', 'error-message');
    linkContainer.appendChild(anchorTag);
    linkContainer.appendChild(errorDiv);
    listItem.appendChild(linkContainer);

    const buttonsContainer = createDynamicElements('div', 'buttons-container');
    const editButton = createDynamicElements('button', 'edit', null, 'Edit');
    buttonsContainer.appendChild(editButton);

    const deleteButton = createDynamicElements('button', 'delete', null, 'Delete');
    buttonsContainer.appendChild(deleteButton);
    listItem.appendChild(buttonsContainer);

    // Prepend the new listItem to the beginning of the itemList
    if (itemList.firstChild) {
        itemList.insertBefore(listItem, itemList.firstChild);
    } else {
        itemList.appendChild(listItem);
    }
}
/******************LIST OF LINKS******************/



/******************PAGINATION******************/
//Switch between pages showing 5 links at a time 
function navigatePages(paginationPageNumber) {
    itemList.innerHTML = '';
    const startIndex = paginationPageNumber * maxPageNumber; // Calculate the starting index
    const endIndex = startIndex + maxPageNumber; // Calculate the ending index
    for (let x = startIndex; x < endIndex; x++) {
        if (categorizedUrls[x]) {
            createDynamicElementsForDom(categorizedUrls[x].url, categorizedUrls[x].id);
        }
    }
}
// Add bottom border to current page number in pagination
function showCurrentPageNumber(num) {
    const listNumber = document.querySelector('.pagination__container ol');
    const items = listNumber.querySelectorAll('li');
    for (let i = 0; i < items.length; i++)items[i].classList.remove('active');
    listNumber.querySelector(`li:nth-child(${num})`).classList.add('active');
}
/******************PAGINATION******************/


/******************LINK BUTTONS EDIT & DELETE******************/
async function CheckifEditedUrlIsValid(li,udatedLink) {
    const linkContainer = li.querySelector('.link-container');
    const update = li.querySelector('.update');
    edit = true;
    const isValid = await checkUrlStructure(udatedLink); 
    if (isValid === true) {
        const anchorTag = createDynamicElements('a', null, newLink, newLink);
        linkContainer.querySelector('a').replaceWith(anchorTag);
        editBtn.textContent = 'Edit';
        editBtn.classList.remove('update');
        // Clear the error message
        linkContainer.querySelector('.error-message').textContent = '';

    } else {
        // If the URL is not valid, display the error message
        linkContainer.querySelector('.error-message').textContent = isValid;
        linkContainer.querySelector('input').remove();
        linkContainer.querySelector('a').classList.remove('hide');
        update.textContent = 'Edit';
        update.classList.remove('update');
        if(!update.classList.contains('edit'))update.classList.add('edit');
        console.log('throwing error so revert  back to original url');
        // if the url fails we want to revert the url of the element back to what it was 

    }
}

pagination.addEventListener('click', (event) => {
    const next = event.target.classList.contains('next');
    const prev = event.target.classList.contains('prev');
    if (next) {
        if (paginationPageNumber <= Math.ceil(categorizedUrls.length / maxPageNumber)-2) {
            paginationPageNumber++;
            navigatePages(paginationPageNumber);
            showCurrentPageNumber(paginationPageNumber + 1);
        }else{
            return;
        }
    }
    if (prev) {
        if (paginationPageNumber > 0) {
            paginationPageNumber--;
            navigatePages(paginationPageNumber);
            showCurrentPageNumber(paginationPageNumber+ 1);
        }else{
            return;
        }
    }
});

itemList.addEventListener('click', (event) => {
    const editBtn = event.target.closest('.edit');
    const updateBtn = event.target.closest('.update');
    const deleteBtn = event.target.closest('.delete');
    const inputField = event.target.closest('input');

    if (inputField) {
        event.stopPropagation(); // Prevent the click event from propagating
        return;
    }
    if(editBtn){
        const updateButtons = itemList.querySelectorAll('.update');
        for (const button of updateButtons) {
            const linkContainer = button.closest('li').querySelector('.link-container');
            linkContainer.querySelector('input').remove();
            linkContainer.querySelector('a').classList.remove('hide');
            button.textContent = 'Edit';
            button.classList.remove('update');
            if(!button.classList.contains('edit'))button.classList.add('edit');
            linkContainer.querySelector('.error-message').textContent = '';
        }
        // when the edit button is clicked rever back all the other buttons
        const linkListItem = editBtn.closest('li'); // Find the parent li element of the edit button
        const linkContainer = linkListItem.querySelector('.link-container'); // Find the link container within the li element
        linkContainer.querySelector('.error-message').textContent = '';

        // create input field when edit button clicked
        const inputField = createDynamicElements('input', null, null, null);
        inputField.type = 'text';
        inputField.value = linkContainer.querySelector('a').getAttribute('href');

        linkContainer.querySelector('a').classList.add('hide');
        linkContainer.appendChild(inputField);

        // Update Edit button so the user knows where to click when they have finished editing the link
        editBtn.textContent = 'Update';
        editBtn.classList.replace('edit', 'update');
    }
    if(updateBtn){
       const li = updateBtn.closest('li');
       const linkContainer = li.querySelector('.link-container');
       const id = linkContainer.id;
       const newLink = linkContainer.querySelector('input').value;
       for (let i = 0; i < categorizedUrls.length; i++) {
            if (categorizedUrls[i].id == id) {
                categorizedUrls[i].url = newLink;
                localStorage.setItem("categorizedUrls", JSON.stringify(categorizedUrls));
                break; // Exit the loop once the element is found and removed
            }
       }  
    CheckifEditedUrlIsValid(li,newLink);
    }
     if (deleteBtn) {
        const linkListItem = deleteBtn.closest('li');
        const id = linkListItem.querySelector('.link-container').id;
        for (let i = 0; i < categorizedUrls.length; i++) {
            if (categorizedUrls[i].id == id) {
                categorizedUrls.splice(i, 1); // Use the index 'i' to remove the element
                localStorage.setItem("categorizedUrls", JSON.stringify(categorizedUrls));
                linkListItem.remove(); 
                break; // Exit the loop once the element is found and removed
            }
        }      
    }
});

/******************LINK BUTTONS EDIT & DELETE******************/

// Create a new instance of Mutation Observer
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            if (!itemList.querySelector('li')) {
                updateLocalStorageElementsOnLoad();
                paginationPageNumber = 0;
            } 
            if(categorizedUrls.length === 0){
                document.querySelector('.empty-message').classList.remove('hide');
                pagination.classList.add('hide');
            }else{
                pagination.classList.remove('hide');
                document.querySelector('.empty-message').classList.add('hide');

            }
        }
    }
});

observer.observe(itemList, { childList: true });

// On page load always fire to persist page load.
updateLocalStorageElementsOnLoad();

