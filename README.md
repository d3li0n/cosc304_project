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
> 	- The search function is implemented by the method `getProducts` and allows to search by name and category.
> 	- If there is no search, all products will be displayed.
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

> - `controllers/AdminController.js` can be accessed by going into admin/orders: http://naturly.herokuapp.com/admin, where we can see the sales, shipments, users, orders, and the products in the database.
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
