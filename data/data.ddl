DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS shipment;
DROP TABLE IF EXISTS productinventory;
DROP TABLE IF EXISTS warehouse;
DROP TABLE IF EXISTS orderproduct;
DROP TABLE IF EXISTS incart;
DROP TABLE IF EXISTS product;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS ordersummary;
DROP TABLE IF EXISTS paymentmethod;
DROP TABLE IF EXISTS token;
DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
    customerId          INT IDENTITY,
    firstName           VARCHAR(40),
    lastName            VARCHAR(40),
    email               VARCHAR(50),
    phonenum            VARCHAR(20),
    address             VARCHAR(50),
    city                VARCHAR(40),
    state               VARCHAR(20),
    postalCode          VARCHAR(20),
    country             VARCHAR(40),
    userid              VARCHAR(20),
    password            VARCHAR(30),
    PRIMARY KEY (customerId)
);

CREATE TABLE paymentmethod (
    paymentMethodId     INT IDENTITY,
    paymentType         VARCHAR(20),
    paymentNumber       VARCHAR(30),
    paymentExpiryDate   DATE,
    customerId          INT,
    PRIMARY KEY (paymentMethodId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE ordersummary (
    orderId             INT IDENTITY,
    orderDate           DATETIME,
    totalAmount         DECIMAL(10,2),
    shiptoAddress       VARCHAR(50),
    shiptoCity          VARCHAR(40),
    shiptoState         VARCHAR(20),
    shiptoPostalCode    VARCHAR(20),
    shiptoCountry       VARCHAR(40),
    customerId          INT,
    PRIMARY KEY (orderId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE 
);

CREATE TABLE category (
    categoryId          INT IDENTITY,
    categoryName        VARCHAR(50),    
    PRIMARY KEY (categoryId)
);

CREATE TABLE product (
    productId           INT IDENTITY,
    productName         VARCHAR(40),
    productPrice        DECIMAL(10,2),
    productImageURL     VARCHAR(100),
    productImage        VARBINARY(MAX),
    productDesc         VARCHAR(1000),
    categoryId          INT,
    PRIMARY KEY (productId),
    FOREIGN KEY (categoryId) REFERENCES category(categoryId)
);

CREATE TABLE orderproduct (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE incart (
    orderId             INT,
    productId           INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (orderId, productId),
    FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE warehouse (
    warehouseId         INT IDENTITY,
    warehouseName       VARCHAR(30),    
    PRIMARY KEY (warehouseId)
);

CREATE TABLE shipment (
    shipmentId          INT IDENTITY,
		orderId							INT,
    shipmentDate        DATETIME,   
    shipmentDesc        VARCHAR(100),   
    warehouseId         INT, 
    PRIMARY KEY (shipmentId),
		FOREIGN KEY (orderId) REFERENCES ordersummary(orderId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE productinventory ( 
    productId           INT,
    warehouseId         INT,
    quantity            INT,
    price               DECIMAL(10,2),  
    PRIMARY KEY (productId, warehouseId),   
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE NO ACTION,
    FOREIGN KEY (warehouseId) REFERENCES warehouse(warehouseId)
        ON UPDATE CASCADE ON DELETE NO ACTION
);

CREATE TABLE review (
    reviewId            INT IDENTITY,
    reviewRating        INT,
    reviewDate          DATETIME,   
    customerId          INT,
    productId           INT,
    reviewComment       VARCHAR(1000),          
    PRIMARY KEY (reviewId),
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES product(productId)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE token (
		restoreId						INT IDENTITY,
    customerId					INT,
    token      					VARCHAR(20),
		expiresAt						DATETIME,
		isUsed							BIT NOT NULL DEFAULT(0),
		PRIMARY KEY(restoreId),    
    FOREIGN KEY (customerId) REFERENCES customer(customerId)
        ON UPDATE CASCADE ON DELETE CASCADE,
);

INSERT INTO category(categoryName) VALUES ('Fire');
INSERT INTO category(categoryName) VALUES ('Earth');
INSERT INTO category(categoryName) VALUES ('Air');
INSERT INTO category(categoryName) VALUES ('Water');


INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Camp Fire', 1, 'Fire from a premium camping location', 'fire_3.jpg', CAST(N'fire_1.jpg' as VARBINARY), 145.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Blue Flame', 1, 'The hottest fire known to man', 'fire_2.jpg', CAST(N'fire_4.jpg' as VARBINARY), 439.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Rain Forest Earth', 2, 'Dirt from the Amazon rain forest', 'earth_1.jpg', CAST(N'earth_2.jpg' as VARBINARY), 124.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Canyon Earth', 2, 'Dirt from the depths of a secret canyon', 'earth_4.jpg', CAST(N'earth_3.jpg' as VARBINARY), 389.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Cloud Air', 3, 'Air from the height of clouds', 'air_1.jpg', CAST(N'air_3.jpg' as VARBINARY), 89.75);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Artic Air', 3, 'Air from the mountains in the Artic', 'air_2.jpg', CAST(N'air_4.jpg' as VARBINARY), 279.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Clean Water', 4, 'Fresh water from secluded lakes', 'water_1.jpg', CAST(N'water_2.jpg' as VARBINARY), 176.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Pure Water', 4, 'Purest water from icebergs in the north', 'water_4.jpg', CAST(N'water_3.jpg' as VARBINARY), 176.00);
INSERT product(productName, categoryId, productDesc, productImageURL, productImage, productPrice) VALUES ('Fiji Water Bottle', 4, 'Bottle of water picked from mountain Fiji.', 'water_5.jpg', CAST(N'water_6.jpg' as VARBINARY), 5376.23);

    
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Arnold', 'Anderson', 'a.anderson@gmail.com', '204-111-2222', '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada', 'arnold' , 'test');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Bobby', 'Brown', 'bobby.brown@hotmail.ca', '572-342-8911', '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States', 'bobby' , 'bobby');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Candace', 'Cole', 'cole@charity.org', '333-444-5555', '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States', 'candace' , 'password');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Darren', 'Doe', 'oe@doe.com', '250-807-2222', '444 Dover Lane', 'Kelowna', 'BC', 'V1V 2X9', 'Canada', 'darren' , 'pw');
INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES ('Elizabeth', 'Elliott', 'engel@uiowa.edu', '555-666-7777', '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States', 'beth' , 'test');

DECLARE @orderId int
INSERT INTO ordersummary (customerId,  orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry) VALUES (1, '2019-10-15 10:25:55', 410.75, '103 AnyWhere Street', 'Winnipeg', 'MB', 'R3X 45T', 'Canada')
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 1, 1, 145)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 2, 89.75)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 7, 1, 176);


DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry) VALUES (2, '2019-10-16 18:00:00', 89.75, '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States')
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 5, 89.75);

DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry) VALUES (3, '2019-10-15 3:30:22', 455, '333 Central Crescent', 'Chicago', 'IL', '33333', 'United States')
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 6, 2, 279)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 7, 3, 176);

DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry) VALUES (2, '2019-10-17 05:45:11', 1217.75, '222 Bush Avenue', 'Boston', 'MA', '22222', 'United States')
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 3, 4, 124)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 8, 3, 176)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 4, 3, 389)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 2, 2, 439)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 4, 89.75);

DECLARE @orderId int
INSERT INTO ordersummary (customerId, orderDate, totalAmount, shiptoAddress, shiptoCity, shiptoState, shiptoPostalCode, shiptoCountry) VALUES (5, '2019-10-15 10:25:55', 652.75, '555 Everwood Street', 'Iowa City', 'IA', '52241', 'United States')
SELECT @orderId = @@IDENTITY
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 5, 4, 89.75)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 3, 2, 124)
INSERT INTO orderproduct (orderId, productId, quantity, price) VALUES (@orderId, 2, 3, 439);

ALTER TABLE customer ADD isAdmin BIT NOT NULL DEFAULT(0);
UPDATE customer SET isAdmin = 1 WHERE customerId = 2;

ALTER TABLE productinventory
ADD CONSTRAINT CH_CheckForNegative CHECK(quantity >=0);

INSERT INTO warehouse (warehouseName) VALUES ('warehouse1')
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (1,1,1,145)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (2,1,5,439)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (3,1,4,124)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (4,1,3,389)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (5,1,4,89.75)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (6,1,5,279)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (7,1,2,176)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (8,1,4,176)
INSERT INTO productinventory (productId,warehouseId,quantity,price) VALUES (9,1,3,5376.23);