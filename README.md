# Naturly
> The website can be accessed at:
> - https://naturly.herokuapp.com/

> Git repo:
> - https://github.com/d3li0n/cosc304_project

> User Accounts
>    - User with no admin access: user: `oe@doe.com` password: `pw`
>    - User with admin access: user: `bobby.brown@hotmail.ca` password: `bobby`
---

## Files
> - `listorder.js` is now controlled by `AdminController.js` an only accessible by the following URL(need to be authorized to access this page) http://naturly.herokuapp.com/admin/orders
> - `loaddata.js` is now controlled by `AdminController.js` an only accessible by the following URL(need to be authorized to access this page) http://naturly.herokuapp.com/admin/connection
> - `routes.js` handles all the routing of the website whenever a link is clicked or a page is called.
> - `controllers/StoreController.js` maintains the store page: http://naturly.herokuapp.com/store , which accesses the database and grabs the products and their corresponding prices/images.
> - `controllers/ProductController.js` maintains the product page: http://naturly.herokuapp.com/products/{product id} , which accesses the database and grabs the product information(price, category, name, images, description), reviews for the product
> 	- The search function is implemented by the method `getProducts`.
> - `controllers/CartController.js` controls the function of adding to the cart: http://naturly.herokuapp.com/cart, displaying items in the cart, and the checkout process.
> 	- Maintains a record of what is in the cart for the session managed by `loadCart`.
> 	- Displays the items and total amount of the order throught the method `addProduct`.
> 	- When it's time to checkout, `cartCheckout` will prompt the user to login if they aren't and give an error if the cart is empty.
> 	- On a successful checkout, an order is placed and `orderproduct` is updated in the db.
> 	- Once the order is placed, the cart is emptied so a user may shop again.
> - `controllers/UserController.js` handles the login and logout of a user: http://naturly.herokuapp.com/login.
> 	- `isEmailValid` checks if the entered email is a valid email address
> 	- `authUser` authenticates the user's login credentials and will throw an error if the account doesn't exist in the database or if the password is incorrect.
> 	- `fethCart` stores cart information, so if a user logs out with items in the cart, they will be saved to `ordersummary` in the database for retrieval on the next login.
> 	- Helps in adding to the cart in session.
> 	- Handles validation of customerId is a number and if customerId exists in the database.
>   - Loads information about the user to http://naturly.herokuapp.com/account
>   - Allows to modify information about the user  http://naturly.herokuapp.com/account/settings

> - `controllers/AdminController.js` can be accessed by going into admin/orders: http://naturly.herokuapp.com/admin, where we can see the sales, shipments, users, orders, and the products in the database.
> - http://naturly.herokuapp.com/admin/sales - show the total sales and total count of ordered products by day
> - http://naturly.herokuapp.com/admin/shipments - show all orders that are waiting to be shipped/processed by the admin
> - http://naturly.herokuapp.com/admin/shipments/{shipment id} - show the order to be processed and confirmation to be shipped
> 	- To use the admin function you need to be authorized as an admin
> 		- Email: `bobby.brown@hotmail.ca`
> 		- Password: `bobby`
> 		
### BONUS
> - `controllers/CartController.js` prompts the user to login if they aren't and orders can't be placed without logging into the website.
> - Page header updated to have links in the header to Home, Store, Account, and Administrator.
> > ![image](https://user-images.githubusercontent.com/71531356/128616025-20e01299-e325-4f2b-b051-961df2f0cb1c.png)
> - Filter by category implemented with a quick drop down box for faster catergorial filtering.
> > ![image](https://user-images.githubusercontent.com/71531356/128616028-40d5bccd-fe43-43e3-be67-c0c921d9be49.png)
> - Cart page improved formatting with ProductId, Product Name, Quantity, and the Price of each item. The Order Total, Shipping Total(10%) and the Subtotal is visible large and clear for easy reading.
> > ![image](https://user-images.githubusercontent.com/71531356/128616018-fa8f8fdd-fe87-46f1-b474-717ab00acfb6.png)


### Lab 8
> - `ProductController.js` implements the method `displayProduct` which is used to show the products when their name is clicked (For example:http://naturly.herokuapp.com/product/1)
>   - The id is used to to retrieve and display product information.
>   - the image is displayed using both the HTML tag based on `productImageUrl` while also from the binary field `productImage`.
>   - add cart and back to store are both available, also with reviews.
> > ![image](https://user-images.githubusercontent.com/71531356/128963161-62f1a989-9293-4908-a7ea-af11764ab477.png)
> - `AdminController.js` controls all admin features and checks authorization before allowing a user to view the Admin page http://naturly.herokuapp.com/admin
> 	- To use the admin function you need to be authorized as an admin
> 		- Email: `bobby.brown@hotmail.ca`
> 		- Password: `bobby`
> 	- The `validate` function will check if the entered email is valid and if the password is valid.
> 	- On the admin page we can check the database connection, sales, shipments, users, and the orders.
> > ![image](https://user-images.githubusercontent.com/71531356/128963367-3585bd3b-351d-49d4-87cf-3ccd52386ae9.png)
> - Total sales:http://naturly.herokuapp.com/admin/sales, are listed by the order date, the total amount of that day, and the number of orders .
> > ![image](https://user-images.githubusercontent.com/71531356/128963591-161de2d4-a89c-4ee2-b50d-f9b6027e6223.png)
> - The logged in user is visible from the main page on top of the my account button at anytime.
> > ![image](https://user-images.githubusercontent.com/71531356/128963684-7dab1a77-e562-46f7-af69-9753e50ce878.png)
> - The user account page: http://naturly.herokuapp.com/account will automatically redirect to the login page if a user isn't logged in.
> - If user is logged in, `getUserSettings` in `UserController.js` will display personal information when the user clicks on `My Account`: http://naturly.herokuapp.com/account
> > ![image](https://user-images.githubusercontent.com/71531356/128964349-3ed2fb9e-c2e8-420a-b912-0183bf92069c.png)
> - `AdminController.js` also handles all the shipment through `loadShipment` and ship by verifying that there are enough products to ship the order, then if there are no conflicts, inserts the shipment into the database. The inventory is then updateded in the `productinventory` table. If there is insufficient inventory, a rollback is performed and quantity is updated in `productinventory`.
