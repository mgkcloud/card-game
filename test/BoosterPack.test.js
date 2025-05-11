const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BoosterPack", function () {
    let CardNFT, cardNFT, VRFCoordinatorV2Mock, vrfCoordinatorMock, BoosterPack, boosterPack;
    let FeistyToken, feistyToken; // Added for ERC20 payment tests
    let owner, addr1, addr2;
    const initialBaseURI = "ipfs://testcid/";
    let subscriptionId; // Made dynamic
    const keyHash = "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15"; // Example key hash
    const boosterPackPriceETH = ethers.parseEther("0.1");
    const boosterPackPriceFST = ethers.parseUnits("100", 18); // Example price in FST tokens
    const cardsPerPack = 5;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy CardNFT
        CardNFT = await ethers.getContractFactory("CardNFT");
        cardNFT = await CardNFT.deploy(initialBaseURI, owner.address);
        await cardNFT.waitForDeployment();
        const cardNFTAddress = await cardNFT.getAddress();

        // Deploy FeistyToken (ERC20)
        FeistyToken = await ethers.getContractFactory("FeistyToken");
        feistyToken = await FeistyToken.deploy(owner.address);
        await feistyToken.waitForDeployment();
        const feistyTokenAddress = await feistyToken.getAddress();

        // Distribute some FST tokens to addr1 for testing ERC20 payments
        await feistyToken.transfer(addr1.address, ethers.parseUnits("1000", 18));

        // Deploy VRFCoordinatorV2Mock
        VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy();
        await vrfCoordinatorMock.waitForDeployment();
        const vrfCoordinatorAddress = await vrfCoordinatorMock.getAddress();

        // Create a new subscription for each test run
        const createSubTx = await vrfCoordinatorMock.createSubscription();
        await createSubTx.wait(); // Ensure transaction is mined
        subscriptionId = await vrfCoordinatorMock.s_nextSubId(); // Get the latest subId after creation


        // Deploy BoosterPack (configured for ETH payment by default in this setup)
        BoosterPack = await ethers.getContractFactory("BoosterPack");
        boosterPack = await BoosterPack.deploy(
            subscriptionId,
            vrfCoordinatorAddress,
            keyHash,
            cardNFTAddress,
            ethers.ZeroAddress, // Payment token address (0 for ETH initially)
            owner.address
        );
        await boosterPack.waitForDeployment();
        const boosterPackAddress = await boosterPack.getAddress();

        // Set booster pack price and cards per pack AFTER deployment
        const setPriceTx = await boosterPack.setBoosterPackPrice(boosterPackPriceETH);
        await setPriceTx.wait();
        const setCardsTx = await boosterPack.setCardsPerPack(cardsPerPack);
        await setCardsTx.wait();

        // Add BoosterPack contract as a consumer to the mock VRF coordinator
        await vrfCoordinatorMock.addConsumerInternal(subscriptionId, boosterPackAddress);

        // Pre-create some card types in CardNFT
        const createType1Tx = await cardNFT.createCardType(1, "attr1", 0, owner.address);
        await createType1Tx.wait();
        const createType2Tx = await cardNFT.createCardType(2, "attr2", 0, owner.address);
        await createType2Tx.wait();
        const createType3Tx = await cardNFT.createCardType(3, "attr3", 0, owner.address);
        await createType3Tx.wait();

        // Transfer CardNFT ownership to BoosterPack to allow minting
        const transferOwnershipTx = await cardNFT.transferOwnership(boosterPackAddress);
        await transferOwnershipTx.wait();
    });

    describe("Deployment & Configuration", function () {
        it("Should set the correct VRF coordinator address", async function () {
            expect(await boosterPack.COORDINATOR()).to.equal(await vrfCoordinatorMock.getAddress());
        });

        it("Should set the correct CardNFT address", async function () {
            expect(await boosterPack.cardNFT()).to.equal(await cardNFT.getAddress());
        });

        it("Should set the correct owner", async function () {
            expect(await boosterPack.owner()).to.equal(owner.address);
        });

        it("Should set the initial booster pack price (ETH)", async function () {
            expect(await boosterPack.boosterPackPrice()).to.equal(boosterPackPriceETH);
        });

        it("Should set the correct payment token address (ETH by default)", async function () {
            expect(await boosterPack.paymentToken()).to.equal(ethers.ZeroAddress);
        });
    });

    describe("Purchasing Booster Pack (ETH)", function () {
        it("Should allow a user to purchase a booster pack with correct ETH", async function () {
            await expect(boosterPack.connect(addr1).purchaseBoosterPack({ value: boosterPackPriceETH }))
                .to.emit(boosterPack, "BoosterPackRequested");
            const requestId = await vrfCoordinatorMock.lastRequestId();
            expect(await boosterPack.s_requestIdToSender(requestId)).to.equal(addr1.address);
        });

        it("Should reject purchase with insufficient ETH", async function () {
            const insufficientAmount = ethers.parseEther("0.05");
            await expect(boosterPack.connect(addr1).purchaseBoosterPack({ value: insufficientAmount }))
                .to.be.revertedWith("BoosterPack: Insufficient ETH sent");
        });

        it("Should refund excess ETH sent", async function () {
            const excessAmount = ethers.parseEther("0.2");
            const initialBalance = await ethers.provider.getBalance(addr1.address);

            const tx = await boosterPack.connect(addr1).purchaseBoosterPack({ value: excessAmount });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const finalBalance = await ethers.provider.getBalance(addr1.address);
            expect(finalBalance).to.be.closeTo(initialBalance - boosterPackPriceETH - gasUsed, ethers.parseEther("0.001"));
        });
    });

    describe("Purchasing Booster Pack (ERC20 Token - FST)", function () {
        let boosterPackFST;

        beforeEach(async function() {
            // Deploy a new BoosterPack instance configured for FST token payment
            boosterPackFST = await BoosterPack.deploy(
                subscriptionId,
                await vrfCoordinatorMock.getAddress(),
                keyHash,
                await cardNFT.getAddress(),
                await feistyToken.getAddress(), // FST token address
                owner.address
            );
            await boosterPackFST.waitForDeployment();
            const boosterPackFSTAddress = await boosterPackFST.getAddress();

            // Set price and cards for FST version
            await boosterPackFST.setBoosterPackPrice(boosterPackPriceFST);
            await boosterPackFST.setCardsPerPack(cardsPerPack);
            
            // Add new BoosterPack as consumer
            await vrfCoordinatorMock.addConsumerInternal(subscriptionId, boosterPackFSTAddress);
            
            // Transfer CardNFT ownership to this new BoosterPack instance
            await cardNFT.transferOwnership(boosterPackFSTAddress); // Note: CardNFT can only have one owner.
                                                                 // For more robust testing, deploy a new CardNFT or use RBAC.
                                                                 // Here, we re-assign for simplicity of this test block.
        });

        it("Should allow a user to purchase a booster pack with FST tokens", async function () {
            // addr1 approves BoosterPackFST to spend their FST tokens
            await feistyToken.connect(addr1).approve(await boosterPackFST.getAddress(), boosterPackPriceFST);
            
            await expect(boosterPackFST.connect(addr1).purchaseBoosterPack())
                .to.emit(boosterPackFST, "BoosterPackRequested");
            
            const requestId = await vrfCoordinatorMock.lastRequestId(); // Assuming mock tracks last request globally or per coordinator
            expect(await boosterPackFST.s_requestIdToSender(requestId)).to.equal(addr1.address);
            expect(await feistyToken.balanceOf(addr1.address)).to.equal(ethers.parseUnits("1000", 18) - boosterPackPriceFST);
            expect(await feistyToken.balanceOf(await boosterPackFST.getAddress())).to.equal(boosterPackPriceFST);
        });

        it("Should reject purchase if ETH is sent when ERC20 payment is configured", async function () {
            await expect(boosterPackFST.connect(addr1).purchaseBoosterPack({ value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("BoosterPack: ETH sent unnecessarily");
        });

        it("Should reject purchase if token transfer fails (insufficient allowance or balance)", async function () {
            // No approval given
            await expect(boosterPackFST.connect(addr1).purchaseBoosterPack())
                .to.be.revertedWith("ERC20: insufficient allowance"); // Or specific error from transferFrom
            
            // Approve, but addr2 has no FST tokens
            await feistyToken.connect(addr2).approve(await boosterPackFST.getAddress(), boosterPackPriceFST);
            await expect(boosterPackFST.connect(addr2).purchaseBoosterPack())
                .to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });

    describe("VRF Fulfillment", function () {
        it("Should mint cards to the requester upon VRF fulfillment (ETH purchase)", async function () {
            const purchaseTx = await boosterPack.connect(addr1).purchaseBoosterPack({ value: boosterPackPriceETH });
            await purchaseTx.wait();
            const requestId = await vrfCoordinatorMock.lastRequestId();

            const randomWords = [ethers.toBigInt(ethers.hexlify(ethers.randomBytes(32)))];
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, await boosterPack.getAddress(), randomWords))
                .to.emit(boosterPack, "BoosterPackFulfilled")
                .withArgs(requestId, addr1.address, (ids) => ids.length === cardsPerPack);

            let totalBalance = BigInt(0);
            const totalTypes = await cardNFT.totalCardTypes();
            for (let i = 0; i < totalTypes; i++) {
                totalBalance += await cardNFT.balanceOf(addr1.address, i);
            }
            expect(totalBalance).to.equal(cardsPerPack);
        });

        // Add a similar test for VRF fulfillment after an ERC20 purchase
        // This requires setting up a boosterPackFST instance again or a more complex beforeEach

        it("Should fail fulfillment if request ID is invalid", async function () {
            const invalidRequestId = 999;
            const randomWords = [12345];
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(invalidRequestId, await boosterPack.getAddress(), randomWords))
                .to.be.revertedWith("Invalid request ID");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set booster pack price (ETH or Token)", async function () {
            const newPriceETH = ethers.parseEther("0.2");
            await boosterPack.setBoosterPackPrice(newPriceETH);
            expect(await boosterPack.boosterPackPrice()).to.equal(newPriceETH);

            // Test with ERC20 configured pack (requires a separate instance or re-configuration)
        });

        it("Should allow owner to set payment token", async function () {
            await boosterPack.setPaymentToken(await feistyToken.getAddress());
            expect(await boosterPack.paymentToken()).to.equal(await feistyToken.getAddress());
            await boosterPack.setPaymentToken(ethers.ZeroAddress); // Set back to ETH
            expect(await boosterPack.paymentToken()).to.equal(ethers.ZeroAddress);
        });

        it("Should allow owner to withdraw ETH balance", async function () {
            await boosterPack.connect(addr1).purchaseBoosterPack({ value: boosterPackPriceETH });
            const contractBalance = await ethers.provider.getBalance(await boosterPack.getAddress());
            expect(contractBalance).to.equal(boosterPackPriceETH);

            const ownerInitialBalance = await ethers.provider.getBalance(owner.address);
            const withdrawTx = await boosterPack.withdrawETH();
            const withdrawReceipt = await withdrawTx.wait();
            const gasUsed = withdrawReceipt.gasUsed * withdrawReceipt.gasPrice;
            const ownerFinalBalance = await ethers.provider.getBalance(owner.address);

            expect(await ethers.provider.getBalance(await boosterPack.getAddress())).to.equal(0);
            expect(ownerFinalBalance).to.be.closeTo(ownerInitialBalance + contractBalance - gasUsed, ethers.parseEther("0.001"));
        });

        it("Should allow owner to withdraw ERC20 tokens", async function () {
            // Setup for ERC20 withdrawal
            const boosterPackFST = await BoosterPack.deploy(
                subscriptionId, await vrfCoordinatorMock.getAddress(), keyHash, await cardNFT.getAddress(), await feistyToken.getAddress(), owner.address
            );
            await boosterPackFST.waitForDeployment();
            await boosterPackFST.setBoosterPackPrice(boosterPackPriceFST);
            await cardNFT.transferOwnership(await boosterPackFST.getAddress()); // Re-assign ownership
            await vrfCoordinatorMock.addConsumerInternal(subscriptionId, await boosterPackFST.getAddress());

            await feistyToken.connect(addr1).approve(await boosterPackFST.getAddress(), boosterPackPriceFST);
            await boosterPackFST.connect(addr1).purchaseBoosterPack();
            expect(await feistyToken.balanceOf(await boosterPackFST.getAddress())).to.equal(boosterPackPriceFST);

            await boosterPackFST.withdrawTokens(await feistyToken.getAddress());
            expect(await feistyToken.balanceOf(await boosterPackFST.getAddress())).to.equal(0);
            expect(await feistyToken.balanceOf(owner.address)).to.include(boosterPackPriceFST); // Owner gets the tokens
        });
    });
});

