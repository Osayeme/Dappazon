// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    address public owner;



    struct Seller{
        address seller;
        string name;
        string description;
        string image;
        string location;
        string contact;
        bool approved;
    }

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
        address seller;
        
    }

    struct Order {
        uint256 time;
        Item item;
    }

    mapping(uint256 => Item) public items;
    mapping(address => mapping(uint256 => Order)) public orders;
    mapping(address => uint256) public orderCount;
    mapping(address => Seller) public sellers;

    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, uint256 cost, uint256 quantity, address seller);
    event SellerAdded(address seller, string name);



    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
    modifier onlySellers() {
        require(sellers[msg.sender].approved);
        _;
    }

    constructor() {
        owner = msg.sender;
        sellers[owner] = Seller(owner, "Dappazon", "The best Dappazon in the world", "", "", "", true); // Add owner as seller
    }

    function approveSeller(address _seller,
        string memory _name,
        string memory _description,
        string memory _image,
        string memory _location,
        string memory _contact
        ) public onlyOwner {
            // Create Seller
        Seller memory seller = Seller(
            _seller,
            _name,
            _description,
            _image,
            _location,
            _contact,
            true
        );
        // Add seller to mapping
        sellers[_seller] = seller;

        emit SellerAdded(_seller, _name);
    }

    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlySellers{
        // Create Item
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock,
            msg.sender
        );

        // Add Item to mapping
        items[_id] = item;

        // Emit event
        emit List(_name, _cost, _stock, msg.sender);
    }

    function buy(uint256 _id) public payable {
        // Fetch item
        Item memory item = items[_id];

        // Require enough ether to buy item
        require(msg.value >= item.cost);

        // Require item is in stock
        require(item.stock > 0);

        // Create order
        Order memory order = Order(block.timestamp, item);

        // Add order for user
        orderCount[msg.sender]++; // <-- Order ID
        orders[msg.sender][orderCount[msg.sender]] = order;

        // Subtract stock
        items[_id].stock = item.stock - 1;

        //Pay seller
        (bool success, ) = item.seller.call{value: item.cost}("");
        require(success);

        // Emit event
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    function withdraw() public onlyOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        //alternativey: payable(owner).transfer(address(this).balance);
        require(success);
    }
}