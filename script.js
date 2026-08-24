// ==========================================
// AMBIKA FOODS
// Razorpay Test Payment
// ==========================================

const PRICE_PER_KG = 70;

// ⚠️ Replace with your father's WhatsApp number.
// Example: 919876543210
const WHATSAPP_NUMBER = "919XXXXXXXXX";

let quantity = 1;


// ==========================================
// ELEMENTS
// ==========================================

const quantityDisplay =
    document.getElementById("quantity");

const totalDisplay =
    document.getElementById("total");

const summaryProductPrice =
    document.getElementById("summaryProductPrice");

const upiAmount =
    document.getElementById("upiAmount");

const increaseButton =
    document.getElementById("increase");

const decreaseButton =
    document.getElementById("decrease");

const upiPayment =
    document.getElementById("upiPayment");

const codPayment =
    document.getElementById("codPayment");

const upiDetails =
    document.getElementById("upiDetails");

const codDetails =
    document.getElementById("codDetails");

const upiPayButton =
    document.getElementById("upiPayButton");

const whatsappOrder =
    document.getElementById("whatsappOrder");


// ==========================================
// UPDATE ORDER
// ==========================================

function updateOrder() {

    const total =
        quantity * PRICE_PER_KG;

    quantityDisplay.textContent =
        `${quantity} kg`;

    totalDisplay.textContent =
        total;

    summaryProductPrice.textContent =
        total;

    if (upiAmount) {

        upiAmount.textContent =
            total;

    }
}


// ==========================================
// INCREASE
// ==========================================

increaseButton.addEventListener(
    "click",
    () => {

        quantity++;

        updateOrder();

    }
);


// ==========================================
// DECREASE
// ==========================================

decreaseButton.addEventListener(
    "click",
    () => {

        if (quantity > 1) {

            quantity--;

            updateOrder();

        }

    }
);


// ==========================================
// PAYMENT METHOD
// ==========================================

upiPayment.addEventListener(
    "change",
    () => {

        if (upiPayment.checked) {

            upiDetails.classList.add(
                "active"
            );

            codDetails.classList.remove(
                "active"
            );

        }

    }
);


codPayment.addEventListener(
    "change",
    () => {

        if (codPayment.checked) {

            codDetails.classList.add(
                "active"
            );

            upiDetails.classList.remove(
                "active"
            );

        }

    }
);


// ==========================================
// RAZORPAY PAYMENT
// ==========================================

upiPayButton.addEventListener(
    "click",
    async () => {

        try {

            const amount =
                quantity * PRICE_PER_KG;


            // ----------------------------------
            // Disable button
            // ----------------------------------

            upiPayButton.disabled = true;

            upiPayButton.innerHTML =
                "Creating payment...";


            // ----------------------------------
            // Create Razorpay order
            // ----------------------------------

            const response =
                await fetch(
                    "http://localhost:3000/create-order",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            amount: amount,

                            quantity: quantity

                        })

                    }
                );


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Unable to create order"
                );

            }


            // ----------------------------------
            // Razorpay options
            // ----------------------------------

            const options = {

                key: "rzp_test_TTXIarAzhCKqbF",

                amount: data.amount,

                currency: "INR",

                name: "Ambika Foods",

                description:
                    `${quantity} kg Idli + Dosa Batter`,

                order_id:
                    data.orderId,


                prefill: {

                    name:
                        document
                            .getElementById(
                                "customerName"
                            )
                            .value,

                    contact:
                        document
                            .getElementById(
                                "phone"
                            )
                            .value

                },


                theme: {

                    color: "#168c45"

                },


                handler:
                    async function (payment) {

                        await verifyPayment(
                            payment
                        );

                    },


                modal: {

                    ondismiss:
                        function () {

                            resetUPIButton();

                        }

                }

            };


            // ----------------------------------
            // Open Razorpay
            // ----------------------------------

            const razorpay =
                new Razorpay(options);


            razorpay.open();


        }

        catch (error) {

            console.error(error);

            alert(
                "Unable to start payment. " +
                "Please try again."
            );

            resetUPIButton();

        }

    }
);


// ==========================================
// VERIFY PAYMENT
// ==========================================

async function verifyPayment(
    payment
) {

    try {

        const response =
            await fetch(
                "http://localhost:3000/verify-payment",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        razorpay_order_id:
                            payment
                                .razorpay_order_id,

                        razorpay_payment_id:
                            payment
                                .razorpay_payment_id,

                        razorpay_signature:
                            payment
                                .razorpay_signature

                    })

                }
            );


        const data =
            await response.json();


        if (!data.success) {

            throw new Error(
                "Payment verification failed"
            );

        }


        alert(
            "Payment successful! ✅"
        );


        // Send order to WhatsApp
        sendWhatsAppOrder(
            "UPI",
            "PAID",
            data.paymentId
        );


    }

    catch (error) {

        console.error(error);

        alert(
            "Payment was received, but " +
            "verification failed. " +
            "Please contact Ambika Foods."
        );

    }

    finally {

        resetUPIButton();

    }

}


// ==========================================
// RESET BUTTON
// ==========================================

function resetUPIButton() {

    upiPayButton.disabled = false;

    upiPayButton.innerHTML =
        `📱 Pay ₹<span id="upiAmount">${quantity * PRICE_PER_KG}</span> via UPI`;

}


// ==========================================
// WHATSAPP BUTTON
// ==========================================

whatsappOrder.addEventListener(
    "click",
    () => {

        const paymentElement =
            document.querySelector(
                'input[name="payment"]:checked'
            );


        const payment =
            paymentElement
                ? paymentElement.value
                : "";


        sendWhatsAppOrder(
            payment,
            payment === "Cash on Delivery"
                ? "COD"
                : "PAYMENT NOT VERIFIED",
            ""
        );

    }
);


// ==========================================
// SEND WHATSAPP ORDER
// ==========================================

function sendWhatsAppOrder(
    payment,
    paymentStatus,
    paymentId
) {

    const name =
        document
            .getElementById("customerName")
            .value
            .trim();

    const phone =
        document
            .getElementById("phone")
            .value
            .trim();

    const area =
        document
            .getElementById("area")
            .value;

    const address =
        document
            .getElementById("address")
            .value
            .trim();

    const landmark =
        document
            .getElementById("landmark")
            .value
            .trim();

    const deliveryTime =
        document
            .getElementById("deliveryTime")
            .value;


    // ======================================
    // VALIDATION
    // ======================================

    if (!name) {

        alert(
            "Please enter your name."
        );

        return;

    }


    if (!/^[0-9]{10}$/.test(phone)) {

        alert(
            "Please enter a valid 10-digit mobile number."
        );

        return;

    }


    if (!area) {

        alert(
            "Please select your delivery area."
        );

        return;

    }


    if (!address) {

        alert(
            "Please enter your delivery address."
        );

        return;

    }


    if (!deliveryTime) {

        alert(
            "Please select your preferred delivery time."
        );

        return;

    }


    if (!payment) {

        alert(
            "Please select a payment method."
        );

        return;

    }


    // ======================================
    // TOTAL
    // ======================================

    const total =
        quantity * PRICE_PER_KG;


    // ======================================
    // MESSAGE
    // ======================================

    let message =

`🥣 *NEW ORDER - AMBIKA FOODS*

📋 *CUSTOMER DETAILS*

Name: ${name}
Phone: ${phone}

🥣 *ORDER*

Product: Idli + Dosa Batter
Quantity: ${quantity} kg
Price: ₹${PRICE_PER_KG}/kg

📍 *DELIVERY*

Area: ${area}
Address: ${address}
Landmark: ${landmark || "Not provided"}

🕘 Delivery Time:
${deliveryTime}

💳 *PAYMENT*

Method: ${payment}
Status: ${paymentStatus}`;


    if (paymentId) {

        message +=
            `\nPayment ID: ${paymentId}`;

    }


    message +=

`

💰 *TOTAL: ₹${total}*

Thank you! 🙏`;


    // ======================================
    // WHATSAPP
    // ======================================

    const whatsappURL =
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(message)}`;


    window.open(
        whatsappURL,
        "_blank"
    );

}


// ==========================================
// INITIAL UPDATE
// ==========================================

updateOrder();