/*Griffin Graham
This creates a few example entries in the Database for a couple orders and items to use as a baseline for testing pages.
*/
import { openDB, addItem, getAllItems, getAllUsers, addUser,deleteUser,updateUser,getUserById, addOrder } from './database.js';
document.addEventListener("DOMContentLoaded", async () => {
    await openDB();

    //If there's already items in the DB, it will NOT add these items, and will clear out, if there are no items it will add.
    const checkItems = await getAllItems();
    if (checkItems.length > 0) {
        console.log("Database already has entries");
        return;
    }
    const exampleItems = [
        {
            itemId: 1,
            series: "Black",
            name: "Earl Grey Tea",
            isNoCaffeine: false,
            isCold: false,
            stock: 50,
            price: 3.49,
            imageURL: "product1.jpg"
        },
        {
            itemId: 2,
            series: "Herbal",
            name: "Chamomile Tea",
            isNoCaffeine: false,
            isCold: false,
            stock: 50,
            price: 2.49,
            imageURL: "product2.jpg"
        },
        {
            itemId: 3,
            series: "Green",
            name: "Green Tea",
            isNoCaffeine: false,
            isCold: false,
            stock: 50,
            price: 2.99,
            imageURL: "product3.jpg"
        }
    ]

    //Iterates through above the above items and adds them to the database.
    for (const item of exampleItems) {
        await addItem(item);
    }

    const exampleOrder = {
        orderId: 10001,
        customerName: "Customer McCustomerFace",
        dateTime: "2025-04-08T14:33:00Z",
        address: "123 ABC Street",
        phone: "555-555-5555"
    };

    const exampleOrderedItems = [
        {itemId: 1, amount: 3, comment: "Extra Hot"},
        {itemId: 2, amount: 1, comment: ""}
    ];

    const exampleStatusHistory = [
        { name: "Placed", date: "2025-04-08T14:33:00Z"},
        { name: "Completed", date: "2025-04-08T14:39:00Z"}
    ];

    //Adds the order with the above example data.
    await addOrder(exampleOrder, exampleOrderedItems, exampleStatusHistory);

    //Commented out, but used to ensure that data is added on the page that this script is executed on for troubleshooting.
    //alert("Example data has been added to DB");
});