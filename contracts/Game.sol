// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "./CardNFT.sol"; // Assuming CardNFT is in the same directory or path is adjusted

/**
 * @title Game
 * @dev Manages game instances, requests Chainlink VRF for game seeds, and stores them.
 */
contract Game is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface COORDINATOR;
    CardNFT public cardNFT; // To verify card ownership if needed

    // Chainlink VRF Variables
    uint64 private s_subscriptionId;
    bytes32 private s_keyHash; // Gas lane
    uint32 private s_callbackGasLimit = 100000; // Adjust as needed
    uint16 private s_requestConfirmations = 3; // Number of confirmations
    uint32 private s_numWords = 1; // Requesting one random word for the game seed

    // Game Data
    struct GameInstance {
        uint256 gameId;
        address[] players; // For now, let's assume two players
        uint256 gameSeed; // To be filled by VRF
        bool seedFulfilled;
        // Add other game state variables as needed (e.g., current turn, scores)
    }

    uint256 private nextGameId = 1;
    mapping(uint256 => GameInstance) public games;
    mapping(uint256 => uint256) public s_requestIdToGameId; // Maps VRF request ID to game ID

    event GameCreated(uint256 indexed gameId, address[] players);
    event GameSeedRequested(uint256 indexed gameId, uint256 indexed requestId);
    event GameSeedFulfilled(uint256 indexed gameId, uint256 indexed requestId, uint256 gameSeed);

    /**
     * @param _vrfCoordinator Address of the VRF Coordinator contract.
     * @param _subscriptionId Your VRF subscription ID.
     * @param _keyHash The gas lane key hash.
     * @param _cardNFTAddress Address of the CardNFT contract.
     * @param _initialOwner The address that will initially own this contract.
     */
    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        address _cardNFTAddress,
        address _initialOwner
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(_initialOwner) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        s_subscriptionId = _subscriptionId;
        s_keyHash = _keyHash;
        cardNFT = CardNFT(_cardNFTAddress);
    }

    /**
     * @dev Creates a new game instance and requests a random seed for it.
     * @param _players Array of player addresses participating in the game.
     */
    function createGame(address[] memory _players) external returns (uint256 gameId) {
        // Basic validation (e.g., number of players)
        require(_players.length >= 2, "Game: At least two players required"); // Example: 2 players

        gameId = nextGameId++;
        games[gameId] = GameInstance({
            gameId: gameId,
            players: _players,
            gameSeed: 0, // Seed will be set by VRF
            seedFulfilled: false
        });

        emit GameCreated(gameId, _players);

        // Request randomness for the game seed
        uint256 requestId = COORDINATOR.requestRandomWords(
            s_keyHash,
            s_subscriptionId,
            s_requestConfirmations,
            s_callbackGasLimit,
            s_numWords
        );

        s_requestIdToGameId[requestId] = gameId;
        emit GameSeedRequested(gameId, requestId);
        return gameId;
    }

    /**
     * @dev Callback function for VRF random words fulfillment.
     * @param _requestId The unique ID of the VRF request.
     * @param _randomWords Array of random words returned by the VRF.
     */
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        uint256 gameId = s_requestIdToGameId[_requestId];
        require(gameId != 0, "Game: Invalid request ID for game seed");
        require(games[gameId].seedFulfilled == false, "Game: Seed already fulfilled");

        uint256 gameSeed = _randomWords[0];
        games[gameId].gameSeed = gameSeed;
        games[gameId].seedFulfilled = true;

        // Clean up mapping to save gas
        delete s_requestIdToGameId[_requestId];

        emit GameSeedFulfilled(gameId, _requestId, gameSeed);
        // Further game logic can be triggered here (e.g., starting the game)
    }

    // --- Admin Functions ---

    function setVrfSubscriptionId(uint64 _subscriptionId) external onlyOwner {
        s_subscriptionId = _subscriptionId;
    }

    function setVrfKeyHash(bytes32 _keyHash) external onlyOwner {
        s_keyHash = _keyHash;
    }

    function setVrfCallbackGasLimit(uint32 _callbackGasLimit) external onlyOwner {
        s_callbackGasLimit = _callbackGasLimit;
    }

    function setVrfRequestConfirmations(uint16 _requestConfirmations) external onlyOwner {
        s_requestConfirmations = _requestConfirmations;
    }

    // --- View Functions ---

    function getGameDetails(uint256 _gameId) external view returns (GameInstance memory) {
        return games[_gameId];
    }
}

