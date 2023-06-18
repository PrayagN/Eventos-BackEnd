require("dotenv").config();
const dayjs = require("dayjs");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Organizer = require("../models/organizerModel");
// const User = require("../models/userModel");
const Orders = require("../models/bookedEventsModel");
module.exports = {
  checkoutPayment: async (req, res) => {
    try {
      const user_id = req.decoded.id;
      const { guests, selectedDate, organizer_id } = req.body;
      const organizer = await Organizer.findById(organizer_id);
      const total = guests * organizer.budget;
      const advance = total * 0.1;
      if (organizer) {
        const newOrder = new Orders({
          totalAmount: total,
          advanceAmount: advance,
          organizer: organizer_id,
          client: user_id,
          eventScheduled: selectedDate,
          bookedDate: new Date(),
        });
        newOrder.save().then(async (order) => {
          const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "inr",
                product_data: {
                  name: "Event Advance Payment",
                },
                unit_amount: advance,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          billing_address_collection: "auto",
          success_url: `${process.env.SERVER_URL}/verifyPayment/${order._id}`,
          cancel_url: `${process.env.SERVER_URL}/cancelPayment/${order._id}`,
        });

        res.status(200).json({ url: session.url });
      });
      }else{
        res.redirect(`${process.env.CLIENT_URL}/organizers/view/${organizer_id}`);
      }
    } catch (error) {
      console.log(error);
    }
  },
   verifyPayment :async(req,res)=>{
      try {
        const order_id =req.params.order_id
        const order = await Orders.findById(order_id)
        if(order){
          
        }
      } catch (error) {
        console.log(error);
      }
   }
};
