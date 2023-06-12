const { expect } = require("chai")
const { boolean } = require("hardhat/internal/core/params/argumentTypes")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Global constants for creating a seller...
const SELLER_NAME = "Giga Chad"
const DESCRIPTION = "Hey I'm a seller!"
const SELLER_IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const LOCATION = "Nigeria"
const CONTACT = "GigaChad@gmail.com"

// Global constants for listing an item...
const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5


describe("Dappazon", () => {
  let dappazon
  let deployer, buyer, seller
  

  beforeEach(async () => {
    // Setup accounts
    [deployer, buyer, seller] = await ethers.getSigners()


    // Deploy contract
    const Dappazon = await ethers.getContractFactory("Dappazon")
    dappazon = await Dappazon.deploy()
  })

  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address)
    })
  })

  describe("approving a seller", () => {

    beforeEach(async () => {
      //approve seller
      transaction = await dappazon.connect(deployer).approveSeller(seller.address, SELLER_NAME, DESCRIPTION, SELLER_IMAGE, LOCATION, CONTACT)
      await transaction.wait()
    })

    it("Returns seller attributes", async () => {
      const seller_l = await dappazon.sellers(seller.address)
      expect(seller_l.name).to.equal(SELLER_NAME)
      expect(seller_l.description).to.equal(DESCRIPTION)
      expect(seller_l.image).to.equal(SELLER_IMAGE)
      expect(seller_l.location).to.equal(LOCATION)
      expect(seller_l.contact).to.equal(CONTACT)
      expect(seller_l.approved).to.equal(true)
    })

    it("Emits Approve event", () => {
      expect(transaction).to.emit(dappazon, "SellerAdded")
    })
  })



  describe("Listing", () => {
    let transaction

    beforeEach(async () => {
      //approve a seller
      transaction = await dappazon.connect(deployer).approveSeller(seller.address, SELLER_NAME, DESCRIPTION, SELLER_IMAGE, LOCATION, CONTACT)
      // List a item
      transaction = await dappazon.connect(seller).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()
    })

    it("Returns item attributes", async () => {
      const item = await dappazon.items(ID)

      expect(item.id).to.equal(ID)
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
      expect(item.seller).to.equal(seller.address)
    })

    it("Emits List event", () => {
      expect(transaction).to.emit(dappazon, "List")
    })
  })

  describe("Buying", () => {
    let transaction

    beforeEach(async () => {
      //approve a seller
      transaction = await dappazon.connect(deployer).approveSeller(seller.address, SELLER_NAME, DESCRIPTION, SELLER_IMAGE, LOCATION, CONTACT)
      // List a item
      transaction = await dappazon.connect(seller).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

            // Get seller balance before
      balanceBefore = await ethers.provider.getBalance(seller.address)
      console.log("balance before:", balanceBefore.value)
      console.log("Cost:", (COST.value))
      console.log("expected balance:", (COST) + (balanceBefore))
      console.log( typeof(COST))
      console.log( typeof(balanceBefore))


      // Buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
      console.log("seller balance after buy:", await ethers.provider.getBalance(seller.address))
      

      await transaction.wait()
    })


    it("Updates buyer's order count", async () => {
      const result = await dappazon.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it("Adds the order", async () => {
      const order = await dappazon.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it("Updates the sellers balance", async () => {
      const result = await ethers.provider.getBalance(seller.address)
      expect(result).to.be.greaterThan(balanceBefore)
    })

    it("Emits Buy event", () => {
      expect(transaction).to.emit(dappazon, "Buy")
    })
  })

  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // List a item
      let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      // Buy a item
      transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Get Deployer balance before
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Withdraw
      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait()
    })

   /* it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    }) */

    it('Updates the contract balance', async () => {
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(0)
    })
  })
})