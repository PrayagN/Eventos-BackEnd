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
          guests:guests,
          eventScheduled: selectedDate,
          bookedDate: new Date(),
          payment:'Advance Only'
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
                unit_amount: advance*100,
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          billing_address_collection: "auto",
          success_url: `${process.env.SERVER_URL}/verifyPayment/${order._id}/${organizer_id}`,
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
        const organizer_id = req.params.organizer_id
        const order = await Orders.findById(order_id)
       await Organizer.findByIdAndUpdate(organizer_id,{$push:{upcomingEvents:order_id}})
        if(order){
          Orders.findByIdAndUpdate(order_id,{$set:{status:true}}).then((response)=>{
            res.redirect(`${process.env.CLIENT_URL}/paymentSuccess`)
          })

        }else{
          res.redirect(`${process.env.CLIENT_URL}/cancelPayment/${order.organizer_id}`)
        }
      } catch (error) {
        console.log(error);
      }
   },
  cancelPayment:async(req,res)=>{
    try {
      const order_id = req.params.order_id
      const order = await Orders.findById(order_id)
      Orders.findByIdAndDelete(order_id).then((response)=>{
        res.redirect(`${process.env.CLIENT_URL}/organizers/`)
      })
      
    } catch (error) {
      console.log(error);
    }
  }
};
