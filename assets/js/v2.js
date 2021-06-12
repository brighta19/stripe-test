let status = document.querySelector("#status");
let form = document.forms["myForm"];

// Sample test API key from Stripe Docs
Stripe.setPublishableKey('pk_test_TYooMQauvdEDq54NiTphI7jx');

form.onsubmit = e => {
    e.preventDefault();
    
    changeStatus("Processing", "gray");

    let card = {
        number: form["number"].value,
        exp_month: form["exp_month"].value,
        exp_year: form["exp_year"].value,
        address_zip: form["address_zip"].value,
        cvc: form["cvc"].value
    };

    Stripe.card.createToken(card, (status, response) => {        
        if (response.error) {
            changeStatus("Error: " + response.error.code, "red");
        } else {
            let token = response.id;
        
            // form.append($("<input type=\"hidden\" name=\"cc_token_id\" />").val(cc_token_id));
            let inputElement = document.createElement("input");
            inputElement.type = "hidden";
            inputElement.name = "cc_token_id";
            inputElement.value = token;
            form.append(inputElement);
        
            form.submit(); // Causes a page reload, resetting card info if errors occur :(
            // Maybe use fetch (like v3 page)
        }
    });
};

function changeStatus(msg, color="black") {
    status.innerText = msg;
    status.style.color = color;
}



if (error != "") {
    changeStatus("Error: " + error, "red");
}
