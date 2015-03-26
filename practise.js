/**
 * Created by c on 2015/3/20.
 */

var db;

var bookEditId;

var note = document.getElementById('notification');
var bookInfoForm = document.getElementById('bookInfoForm');
var bookList = document.getElementById('bookList');
var title = document.getElementById('title');
var writer = document.getElementById('writer');
var press = document.getElementById('press');
var category = document.getElementById('category');
var submit = document.getElementById('submit');

var titleEdit = document.getElementById('titleEdit');
var writerEdit = document.getElementById('writerEdit');
var pressEdit = document.getElementById('pressEdit');
var categoryEdit = document.getElementById('categoryEdit');
var submitEdit = document.getElementById('submitEdit');

(function () {
  if(!window.indexedDB) {
    alert('Your browser does not support IndexedDB');
  }
  else {
    const DB_NAME = 'hanshanLibrary';
    const DB_VERSION = 1;
    const DB_STORE_NAME = 'hanshanLibrary';

    console.log('App initialized.');

    function openDB() {
      //make a request to open IndexedDB
      //return an IDBOpenDBRequest object
      var DBOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

      DBOpenRequest.onsuccess = function (event) {
        db = event.target.result;
        console.log('database initialized');
        displayData();
      };

      DBOpenRequest.onerror = function (event) {
        console.log('error loading database.');
      };

      DBOpenRequest.onupgradeneeded = function (event) {
        var db = event.target.result;

        db.onerror = function (event) {
          console.log('error loading database.');
        };

        var objectStore = db.createObjectStore(DB_STORE_NAME,{ autoIncrement : true });
        objectStore.createIndex('title', 'title', { unique:true } );
        objectStore.createIndex('writer', 'writer', { unique:false } );
        objectStore.createIndex('press', 'press', { unique:false } );
        objectStore.createIndex('category', 'category', { unique:false } );

        console.log('object store created.');
      };
    }

    bookInfoForm.addEventListener('submit', addData, false);

    function addData(e) {
      e.preventDefault();

      if(title.value == '' || writer.value == '' || press.value == '' || category.value == '') {
        console.log('Data incomplete.');
        return;
      }
      else {
        var newItem = {
          title:title.value, writer:writer.value, press:press.value, category:category.value
        };

        var transaction = db.transaction(DB_STORE_NAME, 'readwrite');

        transaction.oncomplete = function (event) {
          console.log('transaction complete.');
          displayData();
        };

        transaction.onerror = function (event) {
          console.log('transaction not complete. error: '+transaction.error+'.');
        };

        var objectStore = transaction.objectStore(DB_STORE_NAME);

        console.log(objectStore.indexNames);
        console.log(objectStore.name);
        console.log(objectStore.transaction);
        console.log(objectStore.autoIncrement);


        var ObjectStoreRequest = objectStore.add(newItem);

        ObjectStoreRequest.onsuccess = function (event) {
          console.log('Data added to database.');
          title.value = '';
          writer.value = '';
          press.value = '';
          category.value = '';
        };

      }
    }



    function displayData() {
      while (bookList.hasChildNodes()) {
        bookList.removeChild(bookList.lastChild);
      }

       var objectStore = db.transaction(DB_STORE_NAME).objectStore(DB_STORE_NAME);

      objectStore.openCursor().onsuccess = function (event) {
        var cursor = event.target.result;

        if (cursor) {
          var listItem = document.createElement('div');
          listItem.class="well";

          var titleStrong = document.createElement('strong');
          titleStrong.innerHTML = cursor.value.title;

          var writerSpan = document.createElement('span');
          writerSpan.className = "pull-right label label-primary";
          writerSpan.innerText = cursor.value.writer;

          var h3Container = document.createElement('h3');
          h3Container.appendChild(titleStrong);
          h3Container.appendChild(writerSpan);

          var deleteButton = document.createElement('button');
          deleteButton.innerText='Delete';
          deleteButton.className="pull-right btn btn-success ";
          deleteButton.setAttribute('title-selected', cursor.key);
          deleteButton.onclick = function (event) {
            deleteItem(event);
          };

          var updateButton = document.createElement('button');
          updateButton.innerText = 'Update';
          updateButton.className="pull-right btn btn-success ";
          updateButton.setAttribute('title-selected', cursor.key);
          updateButton.setAttribute('data-toggle', "modal");
          updateButton.setAttribute('data-target', "#myModal");
          updateButton.onclick = function (event) {
            showItem(event);
          };


          var pressSpan = document.createElement('span');
          pressSpan.className = "lead";
          pressSpan.innerText = cursor.value.press;

          listItem.appendChild(h3Container);
          listItem.appendChild(deleteButton);
          listItem.appendChild(updateButton);
          listItem.appendChild(pressSpan);

          bookList.appendChild(listItem);

          cursor.continue();
        }
      };
    }

    function deleteItem(event) {
      var bookSelected = event.target.getAttribute('title-selected');
      var bookSelectedId = Number(bookSelected);
      var transaction = db.transaction(DB_STORE_NAME,'readwrite');
      var request= transaction.objectStore(DB_STORE_NAME).delete(bookSelectedId);

      transaction.oncomplete = function () {
        event.target.parentNode.parentNode.removeChild(event.target.parentNode);
        console.log('Book id: '+bookSelected+' deleted.');
      };
    }

    function showItem(event) {
      var bookSelected = event.target.getAttribute('title-selected');
      var bookSelectedId = Number(bookSelected);
      bookEditId = bookSelectedId;
      var transaction = db.transaction(DB_STORE_NAME,'readwrite');
      var request= transaction.objectStore(DB_STORE_NAME).get(bookSelectedId);

      request.onsuccess = function (event) {
        var bookInfo = event.target.result;
        titleEdit.value = bookInfo.title;
        writerEdit.value = bookInfo.writer;
        pressEdit.value = bookInfo.press;
        categoryEdit.value = bookInfo.category;
      };
    }

    submitEdit.onclick = function () {
      var itemEdited = {
        title:titleEdit.value, writer:writerEdit.value, press:pressEdit.value, category:categoryEdit.value
      };
      var transaction = db.transaction(DB_STORE_NAME,'readwrite');
      var request= transaction.objectStore(DB_STORE_NAME).put(itemEdited, bookEditId);


      displayData();


    };

    openDB();
  }
})();