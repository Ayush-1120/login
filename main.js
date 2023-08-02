const apiBaseUrl = "https://qa2.sunbasedata.com/sunbase/portal/api/assignment.jsp";
let token = null;

// Function to handle form submissions and API calls
function handleFormSubmit(event) {
    event.preventDefault();
    const form = event.target;

    if (form.id === "loginForm") {
        // Login form submission
        const loginId = form.loginId.value;
        const password = form.password.value;
        authenticateUser(loginId, password);
    } else if (form.id === "addCustomerForm") {
        // Add new customer form submission
        const firstName = form.firstName.value;
        const lastName = form.lastName.value;
        const street = form.street.value;
        const address = form.address.value;
        const city = form.city.value;
        const state = form.state.value;
        const email = form.email.value;
        const phone = form.phone.value;
        addNewCustomer(firstName, lastName, street, address, city, state, email, phone);
    }
}

// Function to authenticate the user
function authenticateUser(loginId, password) {
    const authApiUrl = "https://qa2.sunbasedata.com/sunbase/portal/api/assignment_auth.jsp";
    const data = { login_id: loginId, password: password };

    fetch(authApiUrl, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            // Store the token for future API calls
            token = data.token;
            // Hide login screen and show customer list screen
            document.getElementById("loginScreen").style.display = "none";
            document.getElementById("customerListScreen").style.display = "block";
            // Fetch and display the customer list
            getCustomerList();
        } else {
            alert("Authentication failed!");
        }
    })
    .catch(error => console.error("Error during authentication:", error));
}

// Function to fetch and display the customer list
function getCustomerList() {
    fetch(`${apiBaseUrl}?cmd=get_customer_list`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(response => response.json())
    .then(customers => {
        const customerListElement = document.getElementById("customerList");
        customerListElement.innerHTML = "";

        customers.forEach(customer => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${customer.first_name}</td>
                <td>${customer.last_name}</td>
                <td>${customer.street}</td>
                <td>${customer.address}</td>
                <td>${customer.city}</td>
                <td>${customer.state}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td><button onclick="deleteCustomer('${customer.uuid}')">Delete</button></td>
            `;
            customerListElement.appendChild(row);
        });
    })
    .catch(error => console.error("Error fetching customer list:", error));
}

// Function to add a new customer
function addNewCustomer(firstName, lastName, street, address, city, state, email, phone) {
    const data = {
        first_name: firstName,
        last_name: lastName,
        street: street,
        address: address,
        city: city,
        state: state,
        email: email,
        phone: phone
    };

    fetch(`${apiBaseUrl}?cmd=create`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
    })
    .then(response => {
        if (response.status === 201) {
            alert("Customer created successfully!");
            // Fetch and display the updated customer list
            getCustomerList();
        } else if (response.status === 400) {
            alert("First Name or Last Name is missing!");
        } else {
            alert("Failed to create the customer!");
        }
    })
    .catch(error => console.error("Error adding new customer:", error));
}

// Function to delete a customer
function deleteCustomer(uuid) {
    fetch(`${apiBaseUrl}?cmd=delete&uuid=${uuid}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(response => {
        if (response.status === 200) {
            alert("Customer deleted successfully!");
            // Fetch and display the updated customer list
            getCustomerList();
        } else if (response.status === 400) {
            alert("UUID not found!");
        } else {
            alert("Error deleting the customer!");
        }
    })
    .catch(error => console.error("Error deleting customer:", error));
}

// Add event listeners to form submissions
document.getElementById("loginForm").addEventListener("submit", handleFormSubmit);
document.getElementById("addCustomerForm").addEventListener("submit", handleFormSubmit);

// Show the login screen by default
document.getElementById("loginScreen").style.display = "block";
