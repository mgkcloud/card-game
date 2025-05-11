const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CardNFT", function () {
    let CardNFT, cardNFT, owner, addr1, addr2;
    const initialBaseURI = "ipfs://testcid/";

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy CardNFT
        CardNFT = await ethers.getContractFactory("CardNFT");
        cardNFT = await CardNFT.deploy(initialBaseURI, owner.address);
        await cardNFT.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await cardNFT.owner()).to.equal(owner.address);
        });

        it("Should set the initial base URI correctly", async function () {
            // Create a dummy card type to check URI
            await cardNFT.createCardType(1, "attributes1", 0, owner.address);
            expect(await cardNFT.uri(0)).to.equal(initialBaseURI + "0.json");
        });
    });

    describe("URI Management", function () {
        it("Should allow owner to set a new base URI", async function () {
            const newBaseURI = "ipfs://newcid/";
            await cardNFT.setBaseURI(newBaseURI);
            // Create a dummy card type to check URI
            await cardNFT.createCardType(1, "attributes1", 0, owner.address);
            expect(await cardNFT.uri(0)).to.equal(newBaseURI + "0.json");
        });

        it("Should prevent non-owners from setting a new base URI", async function () {
            const newBaseURI = "ipfs://newcid/";
            await expect(cardNFT.connect(addr1).setBaseURI(newBaseURI))
                .to.be.revertedWithCustomError(cardNFT, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });
    });

    describe("Card Type Creation and Minting", function () {
        it("Should allow owner to create a new card type", async function () {
            const rarity = 1; // Rare
            const attributes = "{\"name\": \"Test Card\"}";
            const initialSupply = 10;

            await expect(cardNFT.createCardType(rarity, attributes, initialSupply, addr1.address))
                .to.emit(cardNFT, "NewCardTypeCreated")
                .withArgs(0, rarity, attributes);

            expect(await cardNFT.cardRarity(0)).to.equal(rarity);
            expect(await cardNFT.cardAttributes(0)).to.equal(attributes);
            expect(await cardNFT.balanceOf(addr1.address, 0)).to.equal(initialSupply);
        });

        it("Should increment token ID for new card types", async function () {
            await cardNFT.createCardType(1, "attr1", 1, owner.address); // ID 0
            await cardNFT.createCardType(2, "attr2", 1, owner.address); // ID 1
            expect(await cardNFT.uri(1)).to.contain("1.json");
        });

        it("Should allow owner to mint existing cards", async function () {
            const tx = await cardNFT.createCardType(1, "attr1", 1, owner.address);
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId = event.args.tokenId;

            const mintAmount = 5;
            await cardNFT.mintCard(addr2.address, tokenId, mintAmount, "0x");
            expect(await cardNFT.balanceOf(addr2.address, tokenId)).to.equal(mintAmount);
        });

        it("Should prevent non-owners from creating card types", async function () {
            await expect(cardNFT.connect(addr1).createCardType(1, "attr", 1, addr1.address))
                .to.be.revertedWithCustomError(cardNFT, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });

         it("Should prevent non-owners from minting cards", async function () {
            const tx = await cardNFT.createCardType(1, "attr1", 1, owner.address);
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId = event.args.tokenId;

            await expect(cardNFT.connect(addr1).mintCard(addr2.address, tokenId, 5, "0x"))
                .to.be.revertedWithCustomError(cardNFT, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });

        it("Should fail to mint non-existent card types", async function () {
            await expect(cardNFT.mintCard(addr1.address, 99, 1, "0x"))
                .to.be.revertedWith("CardNFT: Card type does not exist");
        });
    });

    describe("Attribute Updates", function () {
        it("Should allow owner to update card attributes", async function () {
            const tx = await cardNFT.createCardType(1, "initialAttr", 1, owner.address);
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId = event.args.tokenId;

            const newAttributes = "{\"name\": \"Updated Card\"}";
            await expect(cardNFT.updateCardAttributes(tokenId, newAttributes))
                .to.emit(cardNFT, "CardAttributesUpdated")
                .withArgs(tokenId, newAttributes);
            expect(await cardNFT.cardAttributes(tokenId)).to.equal(newAttributes);
        });

        it("Should prevent non-owners from updating attributes", async function () {
            const tx = await cardNFT.createCardType(1, "initialAttr", 1, owner.address);
            const receipt = await tx.wait();
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId = event.args.tokenId;

            await expect(cardNFT.connect(addr1).updateCardAttributes(tokenId, "newAttr"))
                .to.be.revertedWithCustomError(cardNFT, "OwnableUnauthorizedAccount")
                .withArgs(addr1.address);
        });
    });

    describe("Burning", function () {
        it("Should allow users to burn their own cards", async function () {
            const initialSupply = 10;
            const tx = await cardNFT.createCardType(1, "attr1", initialSupply, addr1.address);
            const receipt = await tx.wait(); // Wait for transaction receipt
            // Find the NewCardTypeCreated event in the receipt
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId = event.args.tokenId; // Get tokenId from event args

            const burnAmount = 3;
            await cardNFT.connect(addr1).burn(addr1.address, tokenId, burnAmount);
            expect(await cardNFT.balanceOf(addr1.address, tokenId)).to.equal(initialSupply - burnAmount);
        });

        it("Should allow users to burn batch their own cards", async function () {
            const initialSupply1 = 10;
            const tx1 = await cardNFT.createCardType(1, "attr1", initialSupply1, addr1.address);
            const receipt1 = await tx1.wait();
            const event1 = receipt1.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId1 = event1.args.tokenId;

            const initialSupply2 = 5;
            const tx2 = await cardNFT.createCardType(2, "attr2", initialSupply2, addr1.address);
            const receipt2 = await tx2.wait();
            const event2 = receipt2.logs.find(log => log.fragment && log.fragment.name === 'NewCardTypeCreated');
            const tokenId2 = event2.args.tokenId;

            const burnAmounts = [3, 2];
            await cardNFT.connect(addr1).burnBatch(addr1.address, [tokenId1, tokenId2], burnAmounts);
            expect(await cardNFT.balanceOf(addr1.address, tokenId1)).to.equal(initialSupply1 - burnAmounts[0]);
            expect(await cardNFT.balanceOf(addr1.address, tokenId2)).to.equal(initialSupply2 - burnAmounts[1]);
        });
    });
});

