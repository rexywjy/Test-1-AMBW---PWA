var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
// var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  // createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();
    alert('openCreatePostModal');

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }else{
    alert(deferredPrompt);
  }

  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function(registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

// closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use, allows to save assets in cache on demand otherwise
function onSaveButtonClicked(event) {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
      .then(function(cache) {
        cache.add('https://httpbin.org/get');
        cache.add('/src/images/sf-boat.jpg');
      });
  }
}

function clearCards() {
  while(sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  console.log('createCard');
  console.log(data);
  
  var cardWrapper = document.createElement('a'); // Wrap the card content in an anchor tag
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp rounded-3';
  // cardWrapper.href = 'details/' + data.slug; // Set the href attribute to the item details page URL with slug
  cardWrapper.style.position = 'relative'; // Ensure relative positioning
  cardWrapper.style.height = '180px'; // Set the height of the card
  cardWrapper.style.textDecoration = 'none';
  cardWrapper.setAttribute('data-slug', data.slug); // Set the slug attribute to the item slug
  
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '100%'; // Fill the entire height of the card
  cardTitle.style.paddingBottom = '25%'; // Reserve space for title
  cardTitle.style.textShadow = '2px 2px 4px #000000';
  cardTitle.style.textDecoration = 'none';
  cardWrapper.appendChild(cardTitle);
  
  var cardDesc = document.createElement('div');
  cardDesc.className = 'mdl-card__supporting-text';
  cardDesc.style.position = 'absolute'; // Position absolutely
  cardDesc.style.bottom = '0'; // Align to the bottom
  cardDesc.style.left = '0'; // Align to the left
  cardDesc.style.right = '0'; // Align to the right
  cardDesc.style.padding = '3px'; // Add padding for better appearance
  cardDesc.style.paddingTop = '6px'; // Add padding for better appearance
  cardDesc.style.boxShadow = '0px -20px 20px rgba(0, 0, 0, 0.3)'; // Add padding for better appearance
  cardDesc.style.backgroundColor = 'rgba(0, 0, 0, 0.3)'; // Semi-transparent background for readability
  cardDesc.style.color = 'white'; // Text color
  cardDesc.style.overflow = 'hidden'; // Hide overflow text
  cardDesc.style.textOverflow = 'ellipsis'; // Add ellipsis for overflow text
  cardDesc.style.display = '-webkit-box'; // Use old WebKit box layout to limit lines
  cardDesc.style.webkitLineClamp = '2'; // Limit the number of lines to 3
  cardDesc.style.webkitBoxOrient = 'vertical'; // Set the text to vertical orientation
  cardDesc.style.width = '100%'; // Set the width to fill the parent
  cardDesc.textContent = data.desc;
  cardTitle.appendChild(cardDesc);
  
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);

  cardWrapper.addEventListener('click', function(event) {
    // event.preventDefault();
    goToDetails(data.id);
  })
  
  
}

function goToDetails(slug) {
  // alert(slug);
  var url = 'https://rexywjy-91265-default-rtdb.asia-southeast1.firebasedatabase.app/workouts/' + slug + '.json';
  console.log('fetch',fetch(url),'fetch');
  var networkDataReceived = false;

  if (!localStorage.getItem(slug)) {
    // console.log(fetch(url));
    fetch(url)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        // networkDataReceived = true;
        localStorage.setItem('now', JSON.stringify(data));
        localStorage.setItem(slug, JSON.stringify(data));
        
        window.location.href = '/detail.html'; 
      })
      .catch(function (error) {
        console.error('Fetch error:', error);
        window.location.href = '/offline.html'; 
      });
  } else {
    localStorage.setItem('now', localStorage.getItem(slug));
    // Jika data sudah ada di session storage, arahkan ke halaman detail
    window.location.href = '/detail.html';
  }
}

function updateUI(data) {
  clearCards();
  for (var i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

var url = 'https://rexywjy-91265-default-rtdb.asia-southeast1.firebasedatabase.app//workouts.json'; // sesuaikan link firebase + "/namaTables.json"
var networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data);
    var dataArray = [];
    for (var key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(function(data) {
      if (!networkDataReceived) {
        console.log('From cache', data);
        updateUI(data);
      }
    });
}
