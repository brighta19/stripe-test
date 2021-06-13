let status = document.querySelector("#status");
let form = document.forms["myForm"];

// Sample test API key from Stripe Docs
let stripe = Stripe("pk_test_TYooMQauvdEDq54NiTphI7jx");

form.onsubmit = e => {
    e.preventDefault();
    
    changeStatus("Processing", "gray");

    let card = {
        number: form["number"].value,
        exp_month: form["exp_month"].value,
        exp_year: form["exp_year"].value,
        // Doesn't use zip code
        cvc: form["cvc"].value
    };

    // Send card info and confirm without using Stripe Elements
    fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify({
            paytype: form["paytype"].value,
            address_zip: form["address_zip"].value,
            card,
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            changeStatus("Success!", "green")
        }
        else {
            changeStatus("Error: " + data.error, "red");
        }
    });
};

function changeStatus(msg, color="black") {
    status.innerText = msg;
    status.style.color = color;
}
