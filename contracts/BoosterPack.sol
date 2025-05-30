// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CardNFT.sol"; // Assuming CardNFT.sol is in the same directory

/**
 * @title BoosterPack
 * @dev Manages the purchase and random distribution of CardNFTs using Chainlink VRF.
 */
contract BoosterPack is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface public COORDINATOR;
    CardNFT public cardNFT; // Interface or contract instance
    IERC20 public paymentToken; // ERC20 token for payment (optional, could use ETH)

    // Chainlink VRF Variables
    uint64 s_subscriptionId;
    address vrfCoordinator; // Address of the VRF Coordinator contract
    bytes32 keyHash; // Gas lane key hash
    uint32 callbackGasLimit = 100000; // Gas limit for the callback function
    uint16 requestConfirmations = 3; // Number of confirmations for VRF request
    uint32 numWords = 1; // Number of random words to request (adjust based on pack size/complexity)

    // Booster Pack Configuration
    uint256 public boosterPackPrice = 1 ether; // Price in ETH or paymentToken units
    uint8 public cardsPerPack = 5; // Number of cards per booster pack

    // Mapping from request ID to the user who requested the pack
    mapping(uint256 => address) public s_requestIdToSender;

    // Events
    event BoosterPackRequested(uint256 indexed requestId, address indexed requester);
    event BoosterPackFulfilled(uint256 indexed requestId, address indexed requester, uint256[] cardIds);

    /**
     * @dev Constructor initializes VRF parameters, CardNFT address, and payment token.
     */
    constructor(
        uint64 subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash,
        address _cardNFTAddress,
        address _paymentTokenAddress, // Set to address(0) if using ETH
        address initialOwner
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(initialOwner) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        s_subscriptionId = subscriptionId;
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        cardNFT = CardNFT(_cardNFTAddress);
        if (_paymentTokenAddress != address(0)) {
            paymentToken = IERC20(_paymentTokenAddress);
        }
    }

    /**
     * @dev Allows a user to purchase a booster pack.
     * Handles payment (ETH or ERC20) and requests randomness from Chainlink VRF.
     */
    function purchaseBoosterPack() public payable {
        if (address(paymentToken) == address(0)) {
            // Payment via ETH
            require(msg.value >= boosterPackPrice, "BoosterPack: Insufficient ETH sent");
            // Handle potential refunds if msg.value > boosterPackPrice
            if (msg.value > boosterPackPrice) {
                payable(msg.sender).transfer(msg.value - boosterPackPrice);
            }
        } else {
            // Payment via ERC20 token
            require(msg.value == 0, "BoosterPack: ETH sent unnecessarily");
            require(paymentToken.transferFrom(msg.sender, address(this), boosterPackPrice), "BoosterPack: ERC20 transfer failed");
        }

        // Request randomness
        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );

        s_requestIdToSender[requestId] = msg.sender;
        emit BoosterPackRequested(requestId, msg.sender);
    }

    /**
     * @dev Callback function executed by the VRF Coordinator with the random result.
     * Determines card IDs based on randomness and mints them to the requester.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        address requester = s_requestIdToSender[requestId];
        require(requester != address(0), "BoosterPack: Invalid request ID");
        delete s_requestIdToSender[requestId]; // Prevent re-entrancy/replay

        // --- Logic to determine card IDs based on randomWords --- 
        // This is a placeholder. A real implementation needs sophisticated logic 
        // based on rarity tiers defined in CardNFT or here.
        // Example: Use randomWords[0] modulo total card types to pick IDs.
        // Need access to total number of card types (_nextTokenId in CardNFT).
        // For simplicity, let's assume we mint 'cardsPerPack' of card ID 0 for now.
        
        uint256[] memory mintedCardIds = new uint256[](cardsPerPack);
        uint256[] memory amounts = new uint256[](cardsPerPack);

        // Placeholder: Determine actual card IDs and amounts based on randomWords and rarity
        for (uint i = 0; i < cardsPerPack; i++) {
            // Replace with actual logic using randomWords[0]
            uint256 randomCardId = uint256(keccak256(abi.encode(randomWords[0], i))) % cardNFT.totalCardTypes(); // Use public getter
            mintedCardIds[i] = randomCardId; 
            amounts[i] = 1; // Mint 1 of each card
        }

        // Mint the determined cards to the requester using the CardNFT contract
        // Ensure CardNFT.mintCard allows this contract to mint.
        // cardNFT.mintCard(requester, cardId, amount, ""); // Single mint
        cardNFT.mintBatch(requester, mintedCardIds, amounts, ""); // Batch mint (more efficient)

        emit BoosterPackFulfilled(requestId, requester, mintedCardIds);
    }

    // --- Admin Functions ---

    function setBoosterPackPrice(uint256 _newPrice) public onlyOwner {
        boosterPackPrice = _newPrice;
    }

    function setCardsPerPack(uint8 _newAmount) public onlyOwner {
        cardsPerPack = _newAmount;
    }

    function setCallbackGasLimit(uint32 _newLimit) public onlyOwner {
        callbackGasLimit = _newLimit;
    }

    function setRequestConfirmations(uint16 _newConfirmations) public onlyOwner {
        requestConfirmations = _newConfirmations;
    }

    function setNumWords(uint32 _newNumWords) public onlyOwner {
        numWords = _newNumWords;
    }

    function setKeyHash(bytes32 _newKeyHash) public onlyOwner {
        keyHash = _newKeyHash;
    }

    // Function to withdraw ETH balance (if using ETH payments)
    function withdrawETH() public onlyOwner {
        (bool success, ) = owner().call{value: address(this).balance}("");
        require(success, "BoosterPack: ETH withdrawal failed");
    }

    // Function to withdraw ERC20 token balance (if using token payments)
    function withdrawTokens(address _tokenAddress) public onlyOwner {
        IERC20 token = IERC20(_tokenAddress);
        uint256 balance = token.balanceOf(address(this));
        require(token.transfer(owner(), balance), "BoosterPack: Token withdrawal failed");
    }
}

