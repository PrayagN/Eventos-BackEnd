require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)




module.exports = {
  checkoutPayment: async (req, res) => {
    try {
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "inr",
              product_data: {
                name: "T-shi",
              },
              unit_amount: 2000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        billing_address_collection: "auto",
        success_url: `${process.env.CLIENT_URL}/paymentSuccess`,
        cancel_url: `${process.env.CLIENT_URL}/organizers`,
      });
      console.log("sdf");
      res.json({ url: session.url });
    } catch (error) {
      console.log(error);
    }
  },
};
