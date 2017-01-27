const getPurchasedCartItems = (carts, start, end) =>
  new Promise((resolve, reject) => {
    carts.aggregate([
      {
        $match : { 
          purchased : true,
          purchased_date: { $exists: true, $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: {
            items: '$amazon.CartItems',
          },
        },
      },
      {
        $unwind: "$_id.items", 
      },
      { 
        $group: {
          _id: {
            items: '$_id.items',
            
          },
        },
      }, 
      {
        $unwind: "$_id.items.CartItem", 
      },
      {
        $unwind: "$_id.items.CartItem.ItemTotal",
      },
      {
        $unwind: "$_id.items.CartItem.Price",
      },
      {
        $unwind: "$_id.items.CartItem.ProductGroup",
      },
      {
        $unwind: "$_id.items.CartItem.Quantity",
      },
      {
        $unwind: "$_id.items.CartItem.SellerNickname",
      },
      {
        $unwind: "$_id.items.CartItem.ASIN",
      },
      {
        $unwind: "$_id.items.CartItem.CartItemId",
      },
      {
        $unwind: "$_id.items.CartItem.Title",
      },
      {
        $unwind: "$_id.items.CartItem.Price.FormattedPrice",
      },

    ], (err, result) => {
      if (err) { reject(err); }
      const carts = result.map(cart => {
        return {
          Title: cart._id.items.CartItem.Title,
          ASIN: cart._id.items.CartItem.ASIN,
          CartItemId:cart._id.items.CartItem.CartItemId,
          Price: cart._id.items.CartItem.Price.FormattedPrice,
          ProductGroup: cart._id.items.CartItem.ProductGroup,
          //Quantity: cart._id.items.CartItem.Quantity,

        };
      });
      resolve(carts);
    });
  });

module.exports = getPurchasedCartItems;
if (!module.parent) {
  require('../../../kip')
  getPurchasedCartItems(db.carts, new Date(new Date().setDate(new Date().getDate()-180)), new Date(new Date().setDate(new Date().getDate()))).then(console.log.bind(console)) //cart of past half year
}
