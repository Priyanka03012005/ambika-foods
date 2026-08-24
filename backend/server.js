const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");

dotenv.config();

console.log("Key ID:", process.env.RAZORPAY_KEY_ID);
console.log(
    "Secret loaded:",
    !!process.env.RAZORPAY_KEY_SECRET
);

const app = express();

app.use(cors());
app.use(express.json());


// ==========================================
// RAZORPAY
// ==========================================

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});


// ==========================================
// CREATE RAZORPAY ORDER
// ==========================================

app.post("/create-order", async (req, res) => {

    try {

        const { amount, quantity } = req.body;

        if (!amount || !quantity) {

            return res.status(400).json({
                success: false,
                message: "Amount and quantity are required."
            });

        }

        const order = await razorpay.orders.create({

            amount: amount * 100,

            currency: "INR",

            receipt:
                "ambika_" +
                Date.now(),

            notes: {

                product:
                    "Idli + Dosa Batter",

                quantity:
                    `${quantity} kg`

            }

        });


        res.json({

            success: true,

            orderId: order.id,

            amount: order.amount,

            currency: order.currency

        });

    }

    catch (error) {

        console.error(
            "Create order error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Unable to create payment order."

        });

    }

});


// ==========================================
// VERIFY PAYMENT
// ==========================================

app.post("/verify-payment", (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        const isValid =
            crypto.timingSafeEqual(

                Buffer.from(
                    generatedSignature,
                    "utf8"
                ),

                Buffer.from(
                    razorpay_signature,
                    "utf8"
                )

            );


        if (!isValid) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed."

            });

        }


        res.json({

            success: true,

            message:
                "Payment verified successfully.",

            paymentId:
                razorpay_payment_id,

            orderId:
                razorpay_order_id

        });

    }

    catch (error) {

        console.error(
            "Verification error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Payment verification failed."

        });

    }

});


// ==========================================
// TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.send(
        "Ambika Foods Payment Server is running!"
    );

});


// ==========================================
// START SERVER
// ==========================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `Ambika Foods server running on port ${PORT}`
    );
});