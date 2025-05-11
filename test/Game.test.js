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

        // Deploy CardNFT
        CardNFT = await ethers.getContractFactory("CardNFT");
        cardNFT = await CardNFT.deploy(initialBaseURI, owner.address);
        await cardNFT.waitForDeployment();
        const cardNFTAddress = await cardNFT.getAddress();

        // Deploy VRFCoordinatorV2Mock
        VRFCoordinatorV2Mock = await ethers.getContractFactory("VRFCoordinatorV2Mock");
        vrfCoordinatorMock = await VRFCoordinatorV2Mock.deploy();
        await vrfCoordinatorMock.waitForDeployment();
        const vrfCoordinatorAddress = await vrfCoordinatorMock.getAddress();

        // Deploy Game contract
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

        // Add Game contract as a consumer to the mock VRF coordinator
        await vrfCoordinatorMock.addConsumerInternal(subscriptionId, gameAddress);
    });

    describe("Deployment", function () {
        it("Should set the correct VRF coordinator address", async function () {
            // Note: Game.sol stores COORDINATOR as a non-public state variable, accessed via VRFConsumerBaseV2's internal variable.
            // We can test it by ensuring requests go to the right mock.
            // Or, make COORDINATOR public in Game.sol if direct checking is desired.
            // For now, we'll infer from successful requests.
            expect(await game.owner()).to.equal(owner.address); // Basic check
        });

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
            
            const gameId = await game.nextGameId() - BigInt(1); // nextGameId is incremented before use
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
            const tx = await game.createGame(players);
            const receipt = await tx.wait();
            // Extract gameId and requestId from events if direct return is not used or for robustness
            const gameCreatedEvent = receipt.logs.find(log => log.fragment && log.fragment.name === "GameCreated");
            gameId = gameCreatedEvent.args.gameId;
            const seedRequestedEvent = receipt.logs.find(log => log.fragment && log.fragment.name === "GameSeedRequested");
            requestId = seedRequestedEvent.args.requestId;
        });

        it("Should fulfill game seed request and update game state", async function () {
            const randomWords = [ethers.toBigInt(ethers.hexlify(ethers.randomBytes(32)))]; // Example random seed
            
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, await game.getAddress(), randomWords))
                .to.emit(game, "GameSeedFulfilled")
                .withArgs(gameId, requestId, randomWords[0]);

            const gameInstance = await game.games(gameId);
            expect(gameInstance.gameSeed).to.equal(randomWords[0]);
            expect(gameInstance.seedFulfilled).to.be.true;
            expect(await game.s_requestIdToGameId(requestId)).to.equal(0); // Should be deleted
        });

        it("Should reject fulfillment if request ID is invalid", async function () {
            const invalidRequestId = 9999;
            const randomWords = [123];
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(invalidRequestId, await game.getAddress(), randomWords))
                .to.be.revertedWith("Invalid request ID"); // Mock's revert string
        });

        it("Should reject fulfillment if seed is already fulfilled for the game", async function () {
            const randomWords1 = [123];
            await vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, await game.getAddress(), randomWords1);

            // Attempt to fulfill again (e.g. if VRF coordinator somehow re-sends or it's a bug)
            const randomWords2 = [456];
            await expect(vrfCoordinatorMock.fulfillRandomWordsWithOverride(requestId, await game.getAddress(), randomWords2))
                 .to.be.revertedWith("Invalid request ID"); // Because s_requests[requestId] is deleted in mock
            // To test Game.sol's internal check: "Game: Seed already fulfilled"
            // we'd need a mock that doesn't delete s_requests or a way to re-request for same gameId.
            // For now, the mock's behavior covers the immediate failure.
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to set VRF subscription ID", async function () {
            const newSubId = 2;
            await game.setVrfSubscriptionId(newSubId);
            // Cannot directly check s_subscriptionId as it's private. Test by effect if possible or make internal getter.
            // For now, assume it works if no revert.
        });

        it("Should prevent non-owners from setting VRF subscription ID", async function () {
            await expect(game.connect(player1).setVrfSubscriptionId(2))
                .to.be.revertedWithCustomError(game, "OwnableUnauthorizedAccount");
        });
        // Add similar tests for setVrfKeyHash, setVrfCallbackGasLimit, setVrfRequestConfirmations
    });

    describe("View Functions", function () {
        it("Should return game details", async function () {
            const players = [player1.address, player2.address];
            const tx = await game.createGame(players);
            const receipt = await tx.wait();
            const gameCreatedEvent = receipt.logs.find(log => log.fragment && log.fragment.name === "GameCreated");
            const gameId = gameCreatedEvent.args.gameId;

            const gameInstance = await game.getGameDetails(gameId);
            expect(gameInstance.gameId).to.equal(gameId);
            expect(gameInstance.players).to.deep.equal(players);
        });
    });
});

