const fetch = require('node-fetch');

async function testCreateOrder() {
    const orderData = {
        clientName: "Test Client",
        phone: "1234567890",
        shoeType: "Кроссовки",
        brand: "Nike",
        color: "White",
        services: "Cleaning [Master1: 500 грн], Repair [Master2: 1000 грн]",
        serviceDetails: [
            { service: "Cleaning", masterId: 1, masterName: "Master1", price: "500" },
            { service: "Repair", masterId: 2, masterName: "Master2", price: "1000" }
        ],
        price: "1500",
        prepayment: "200",
        paymentMethod: "Cash",
        comment: "Please be careful",
        quantity: 1,
        masterId: 1
    };

    const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    });

    if (response.ok) {
        const result = await response.json();
        console.log("Order created successfully:", result);
    } else {
        const error = await response.text();
        console.log("Failed to create order:", error);
    }
}

testCreateOrder();
