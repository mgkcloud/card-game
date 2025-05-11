const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Game", function () {
    let CardNFT, cardNFT, VRFCoordinatorV2Mock, vrfCoordinatorMock, Game, game;
    let owner, player1, player2, player3;
    const initialBaseURI = "ipfs://testcid/";
    const subscriptionId = 1;
    const keyHash = "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15"; // Example key hash

    beforeEach(async function () {
        [owner, player1, player2, player3] = await ethers.getSigners();
        // console.log("Top beforeEach: Owner address:", owner.address);
        // console.log("Top beforeEach: Player1 address:", player1.address);

        CardNFT = await ethers.getContractFactory("CardNFT");
        cardNFT = await CardNFT.deploy(initialBaseURI, owner.address);
        await cardNFT.waitForDeployment();
        const cardNFTAddress = await cardNFT.getAddress();
        // console.log("Top beforeEach: CardNFT deployed at:", cardNFTAddress);

        VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy();
        await vrfCoordinatorMock.waitForDeployment();
        const vrfCoordinatorAddress = await vrfCoordinatorMock.getAddress();
        // console.log("Top beforeEach: VRFCoordinatorV2Mock deployed at:", vrfCoordinatorAddress);

        Game = await ethers.getContractFactory("Game");
        game = await Game.deploy(
            vrfCoordinatorAddress,
            subscriptionId,
            keyHash,
            cardNFTAddress,
            owner.address
        );
        await game.waitForDeployment();
        const gameAddress = await game.getAddress();
        // console.log("Top beforeEach: Game deployed at:", gameAddress);
        // if (!game.target && !game.address) console.warn("Top beforeEach: Game contract might not be fully initialized (missing target/address)");

        await vrfCoordinatorMock.addConsumerInternal(subscriptionId, gameAddress);
        // console.log("Top beforeEach: Game contract added as consumer to VRF mock.");
    });

    describe("Deployment", function () {
        it("Should set the correct CardNFT address", async function () {
            expect(await game.cardNFT()).to.equal(await cardNFT.getAddress());
        });

        it("Should set the correct owner", async function () {
            expect(await game.owner()).to.equal(owner.address);
        });
    });

    describe("Game Creation and Seed Request", function () {
        it("Should allow creating a game and request a seed", async function () {
            const players = [player1.address, player2.address];
            await expect(game.createGame(players))
                .to.emit(game, "GameCreated")
                .to.emit(game, "GameSeedRequested");
            
            const gameId = await game.nextGameId() - BigInt(1); 
            const gameInstance = await game.games(gameId);
            expect(gameInstance.gameId).to.equal(gameId);
            expect(gameInstance.players).to.deep.equal(players);
            expect(gameInstance.seedFulfilled).to.be.false;

            const requestId = await vrfCoordinatorMock.lastRequestId();
            expect(await game.s_requestIdToGameId(requestId)).to.equal(gameId);
        });

        it("Should reject game creation with less than two players", async function () {
            await expect(game.createGame([player1.address]))
                .to.be.revertedWith("Game: At least two players required");
        });
    });

    describe("VRF Fulfillment for Game Seed", function () {
        let gameId, requestId;
        const players = [player1.address, player2.address];

        beforeEach(async function() {
            console.log("VRF Fulfillment beforeEach: player1 defined?", !!player1, player1 ? player1.address : "player1 undefined");
            console.log("VRF Fulfillment beforeEach: player2 defined?", !!player2, player2 ? player2.address : "player2 undefined");
            console.log("VRF Fulfillment beforeEach: game contract defined?", !!game, game ? (game.target || game.address) : "game undefined");
            
            const currentPlayers = [player1.address, player2.address];
            console.log("VRF Fulfillment beforeEach: currentPlayers:", currentPlayers);

            let tx;
            try {
                console.log("VRF Fulfillment beforeEach: Calling game.createGame with players:", currentPlayers);
                tx = await game.createGame(currentPlayers);
                console.log("VRF Fulfillment beforeEach: game.createGame returned tx:", tx ? "Transaction object defined" : "Transaction object UNDEFINED", tx);
            } catch (e) {
                console.error("VRF Fulfillment beforeEach: Error during game.createGame:", e);
                throw e; 
            }
            
            if (!tx || typeof tx.wait !== 'function') {
                console.error("VRF Fulfillment beforeEach: Transaction object 'tx' is invalid or does not have a 'wait' function:", tx);
                throw new Error("Invalid transaction object from game.createGame");
            }

            console.log("VRF Fulfillment beforeEach: Calling tx.wait()...");
            const receipt = await tx.wait(); 
            console.log("VRF Fulfillment beforeEach: tx.wait() successful, receipt obtained."); // Log receipt details if needed
            
            const gameCreatedEvent = receipt.events?.find(e => e.event === "GameCreated");
            if (!gameCreatedEvent) {
                console.error("VRF Fulfillment beforeEach: GameCreated event not found in receipt events:", receipt.events);
                throw new Error("GameCreated event not found");
            }
            gameId = gameCreatedEvent.args.gameId;

            const seedRequestedEvent = receipt.events?.find(e => e.event === "GameSeedRequested");
            if (!seedRequestedEvent) {
                console.error("VRF Fulfillment beforeEach: GameSeedRequested event not found in receipt events:", receipt.events);
                throw new Error("GameSeedRequested event not found");
            }
            requestId = seedRequestedEvent.args.requestId;
            console.log(`VRF Fulfillment beforeEach: gameId ${gameId}, requestId ${requestId} extracted.`);
        });

        it("Should fulfill game seed request and update game state", async function () {
            console.log("Test - Should fulfill: gameId:", gameId, "requestId:", requestId);
            const randomWords = [ethers.toBigInt(ethers.hexlify(ethers.randomBytes(32)))]; 
            
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, (game.target || game.address), randomWords))
                .to.emit(game, "GameSeedFulfilled")
                .withArgs(gameId, requestId, randomWords[0]);

            const gameInstance = await game.games(gameId);
            expect(gameInstance.gameSeed).to.equal(randomWords[0]);
            expect(gameInstance.seedFulfilled).to.be.true;
            expect(await game.s_requestIdToGameId(requestId)).to.equal(0); 
        });

        it("Should reject fulfillment if request ID is invalid", async function () {
            const invalidRequestId = 9999;
            const randomWords = [123];
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(invalidRequestId, (game.target || game.address), randomWords))
                .to.be.revertedWith("Invalid request ID");
        });

        it("Should reject fulfillment if seed is already fulfilled for the game", async function () {
            const randomWords1 = [ethers.toBigInt(123)];
            await vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, (game.target || game.address), randomWords1);

            const randomWords2 = [ethers.toBigInt(456)];
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, (game.target || game.address), randomWords2))
                 .to.be.revertedWith("Invalid request ID"); 
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set VRF subscription ID", async function () {
            const newSubId = 2;
            await game.setVrfSubscriptionId(newSubId);
        });

        it("Should prevent non-owners from setting VRF subscription ID", async function () {
            await expect(game.connect(player1).setVrfSubscriptionId(2))
                .to.be.revertedWithCustomError(game, "OwnableUnauthorizedAccount");
        });
    });

    describe("View Functions", function () {
        it("Should return game details", async function () {
            const players = [player1.address, player2.address];
            const tx = await game.createGame(players);
            const receipt = await tx.wait();
            const gameCreatedEvent = receipt.events.find(e => e.event === "GameCreated");
            const gameId = gameCreatedEvent.args.gameId;

            const gameInstance = await game.getGameDetails(gameId);
            expect(gameInstance.gameId).to.equal(gameId);
            expect(gameInstance.players).to.deep.equal(players);
        });
    });
});

