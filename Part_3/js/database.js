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
