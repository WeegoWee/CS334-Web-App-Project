const databaseName = "ITPotDB";
let db;

const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(databaseName, 1);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            db.createObjectStore("Items", { keyPath: "itemId", autoIncrement: true});
            db.createObjectStore("Orders", { keyPath: "orderId", autoIncrement: true});
            db.createObjectStore("OrderedItems", { keyPath: ["orderId", "itemId"]});
            db.createObjectStore("Status", { keyPath: "orderId"});
            const userStore = db.createObjectStore("users", { keyPath: "id", autoIncrement: true });
            userStore.createIndex("email", "email", { unique: true });
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};

const addItem = async (item) => {
    const db = await openDB();
    const tx = db.transaction("Items", "readwrite");
    tx.objectStore("Items").add(item);
    return tx.complete;
};
  
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

const seedItemsIfEmpty = async (defaultItems) => {
    const items = await getAllItems();
    if (items.length === 0) {
        for (const item of defaultItems) {
        await addItem(item);
        }
    }
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
export { openDB, addItem, getAllItems, seedItemsIfEmpty, getAllUsers, addUser,deleteUser,updateUser,getUserById };