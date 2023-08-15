
// Get the URL parameter from the current URL
const urlParam = new URLSearchParams(window.location.search).get('url');

// Display the URL on the page
const urlElement = document.getElementById('submittedURL');
if (urlParam) {
    urlElement.textContent = `Inputted URL: ${decodeURIComponent(urlParam)}`;
} else {
    urlElement.textContent = 'No URL parameter found.';
}