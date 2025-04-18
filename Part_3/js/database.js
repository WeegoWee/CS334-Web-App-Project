/* Griffin Graham
This is the basic JS to be used to create the Database and it's tables, with some basic functionaly for adding and retrieving orders and items.
*/

//Name to be used for the DB.
const databaseName = "ITPotDB";

//Defining the global variable for the database instance.
let db;

//Opens a connection to the IndexedDB instance.
const openDB = () => {
    return new Promise((resolve, reject) => {
        //Opens or creates the DB if it doesn't exist.
        const request = indexedDB.open(databaseName, 1);
        
        //This happens if the database needs to be created or upgraded.
        request.onupgradeneeded = (event) => {
            db = event.target.result;

            //Object store for Items with auto incrementing primary key.
            db.createObjectStore("Items", { keyPath: "itemId", autoIncrement: true});

            //Object store for Orders.
            db.createObjectStore("Orders", { keyPath: "orderId" });

            //Object store using compound key to tie an orderId to the items in the order.
            db.createObjectStore("OrderedItems", { keyPath: ["orderId", "itemId"]});

            //Object store for different statuses for an orderId.
            db.createObjectStore("Status", { keyPath: "orderId"});
            const userStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
            userStore.createIndex("email", "email", { unique: true });

            const messageStore = db.createObjectStore('Messages', { keyPath: 'id', autoIncrement: true });
            messageStore.createIndex('timestamp', 'timestamp');
        };

        // If successful will return the opened database.
        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        //If it's not, it will reject with the details.
        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

//Method to add an item into the Items object store.
const addItem = async (item) => {
    const db = await openDB();
    const tx = db.transaction("Items", "readwrite");
    tx.objectStore("Items").add(item);
    return tx.complete;
};

//Retrieves all items in the Items object store.  
const getAllItems = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction("Items", "readonly");
        const store = tx.objectStore("Items");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

//Adds a complete order, with the items and status history.
const addOrder = async (order, orderedItems, statusHistory) => {
    const db = await openDB();

    const tx = db.transaction(["Orders", "OrderedItems", "Status"], "readwrite");

    //Uses timestamp as a unique ID instead of auto incrementing.
    const orderId = Date.now();
    order.orderId = orderId;

    tx.objectStore("Orders").add(order);

    orderedItems.forEach(item => {
        tx.objectStore("OrderedItems").add({
            orderId,
            itemId: item.itemId,
            amount: item.amount,
            comment: item.comment || ""
        });
    });

    tx.objectStore("Status").add({
        orderId,
        statusHistory
    });

    await tx.complete;
    return orderId;
};


const getAllUsers = async () => {
    const db = await openDB();
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");
    const request = store.getAll();

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const addUser = async (user) => {
    const db = await openDB();
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");
  
    
    const index = store.index("email");
    const existing = await new Promise((resolve, reject) => {
      const req = index.get(user.email);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  
    if (existing) {
      throw new Error("A user with that email already exists.");
    }
  
    store.add({
      ...user,
      createdAt: new Date().toISOString()
    });
  
    await tx.done;
  };
  const getUserById = async (id) => {
    const db = await openDB();
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");
    const request = store.get(id);

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const updateUser = async (user) => {
    const db = await openDB();
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");
    store.put(user);
    return tx.done;
};

const deleteUser = async (id) => {
    const db = await openDB();
    const tx = db.transaction("users", "readwrite");
    const store = tx.objectStore("users");
    store.delete(id);
    return tx.done;
};

export { openDB, addItem, getAllItems, getAllUsers, addUser, deleteUser, updateUser, getUserById, addOrder, addMessage, getAllMessages, deleteMessage };

//Adds a complete order, with the items and status history.

//add messages
const addMessage = async (message) => {
    const db = await openDB();
    const tx = db.transaction('Messages', 'readwrite');
    tx.objectStore('Messages').add(message);
    return tx.done;
  };
  
  // Get all messages
  const getAllMessages = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('Messages', 'readonly');
      const store = tx.objectStore('Messages');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  };
  
  // Delete a message
  const deleteMessage = async (id) => {
    const db = await openDB();
    const tx = db.transaction('Messages', 'readwrite');
    tx.objectStore('Messages').delete(id);
    return tx.done;
  };
