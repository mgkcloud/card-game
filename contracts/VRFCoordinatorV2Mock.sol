// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import "./mocks/VRFConsumerBaseV2.sol"; // Corrected import path

contract VRFCoordinatorV2Mock is VRFCoordinatorV2Interface {
    struct Subscription {
        uint96 balance;
        uint64 subId;
        address owner;
        address[] consumers;
        // For pendingRequestExists mock
        uint256 pendingRequestCount;
    }

    mapping(uint64 => Subscription) private s_subscriptions;
    uint64 private s_nextSubId = 1;
    uint256 private s_lastRequestId = 0;

    // For requestSubscriptionOwnerTransfer mock
    mapping(uint64 => address) private s_pendingOwnerTransfers;

    uint32 public constant MAX_CONSUMERS = 100;
    uint256 public constant LINK_BALANCE_CAP = 1000000 * 10**18; // 1M LINK

    event SubscriptionCreated(uint64 indexed subId, address owner);
    event SubscriptionFunded(uint64 indexed subId, uint256 oldBalance, uint256 newBalance);
    event SubscriptionConsumerAdded(uint64 indexed subId, address consumer);
    event SubscriptionConsumerRemoved(uint64 indexed subId, address consumer);
    event SubscriptionCanceled(uint64 indexed subId, address to, uint256 amount);
    event RandomWordsRequested(
        bytes32 indexed keyHash,
        uint256 requestId,
        uint256 preSeed,
        uint64 indexed subId,
        uint16 minimumRequestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords,
        address indexed sender
    );
    event RandomWordsFulfilled(uint256 indexed requestId, uint256 outputSeed, uint96 payment);
    event SubscriptionOwnerTransferRequested(uint64 indexed subId, address indexed from, address indexed to);
    event SubscriptionOwnerTransferred(uint64 indexed subId, address indexed from, address indexed to);

    constructor() {}

    function createSubscription() external override returns (uint64 subId) {
        subId = s_nextSubId++;
        s_subscriptions[subId] = Subscription({
            balance: 0,
            subId: subId,
            owner: msg.sender,
            consumers: new address[](0),
            pendingRequestCount: 0
        });
        emit SubscriptionCreated(subId, msg.sender);
        return subId;
    }

    function getSubscription(uint64 _subId) external view override returns (uint96 balance, uint64 reqCount, address owner, address[] memory consumers) {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner != address(0), "Subscription not found");
        return (sub.balance, sub.pendingRequestCount, sub.owner, sub.consumers);
    }

    // fundSubscription is not part of VRFCoordinatorV2Interface, but often used in mocks. Keeping it for now if tests rely on it.
    // If it causes override issues, it means the interface has changed or this mock had extra functions.
    // The error log showed: "TypeError: Function has override specified but does not override anything."
    // This means fundSubscription is NOT in the interface. Removing `override`.
    function fundSubscription(uint64 _subId, uint96 _amount) external /* override */ {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner != address(0), "Subscription not found");
        uint256 oldBalance = sub.balance;
        sub.balance += _amount;
        if (sub.balance > LINK_BALANCE_CAP) {
            sub.balance = uint96(LINK_BALANCE_CAP);
        }
        emit SubscriptionFunded(_subId, uint96(oldBalance), sub.balance);
    }

    function addConsumer(uint64 _subId, address _consumer) external override {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner == msg.sender, "Not subscription owner");
        require(sub.consumers.length < MAX_CONSUMERS, "Too many consumers");
        for (uint i = 0; i < sub.consumers.length; i++) {
            require(sub.consumers[i] != _consumer, "Consumer already added");
        }
        sub.consumers.push(_consumer);
        emit SubscriptionConsumerAdded(_subId, _consumer);
    }

    function removeConsumer(uint64 _subId, address _consumer) external override {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner == msg.sender, "Not subscription owner");
        bool found = false;
        for (uint i = 0; i < sub.consumers.length; i++) {
            if (sub.consumers[i] == _consumer) {
                sub.consumers[i] = sub.consumers[sub.consumers.length - 1];
                sub.consumers.pop();
                found = true;
                break;
            }
        }
        require(found, "Consumer not found");
        emit SubscriptionConsumerRemoved(_subId, _consumer);
    }

    // Corrected cancelSubscription signature (no return value in interface)
    function cancelSubscription(uint64 _subId, address _to) external override {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner == msg.sender, "Not subscription owner");
        uint96 balance = sub.balance;
        delete s_subscriptions[_subId];
        emit SubscriptionCanceled(_subId, _to, balance);
        // In a real scenario, transfer LINK to `_to` address. Mock doesn't handle actual token transfers.
    }

    function requestRandomWords(
        bytes32 _keyHash,
        uint64 _subId,
        uint16 _minimumRequestConfirmations,
        uint32 _callbackGasLimit,
        uint32 _numWords
    ) external override returns (uint256 requestId) {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner != address(0), "Subscription not found");
        // require(sub.balance >= fee, "Subscription balance too low"); // Basic fee check, fee calculation is complex
        sub.pendingRequestCount++; 
        requestId = ++s_lastRequestId;
        emit RandomWordsRequested(
            _keyHash,
            requestId,
            0, // preSeed - not used in mock
            _subId,
            _minimumRequestConfirmations,
            _callbackGasLimit,
            _numWords,
            msg.sender
        );
        return requestId;
    }

    function getRequestConfig() external view override returns (uint16, uint32, bytes32[] memory) {
        bytes32[] memory s_provingKeyHashes = new bytes32[](1);
        s_provingKeyHashes[0] = bytes32(0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15); // Example keyhash
        return (3, 2500000, s_provingKeyHashes); // Example values matching typical test setups
    }

    // Added missing interface functions
    function requestSubscriptionOwnerTransfer(uint64 _subId, address _newOwner) external override {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner == msg.sender, "Not subscription owner");
        require(_newOwner != address(0), "New owner cannot be zero address");
        s_pendingOwnerTransfers[_subId] = _newOwner;
        emit SubscriptionOwnerTransferRequested(_subId, msg.sender, _newOwner);
    }

    function acceptSubscriptionOwnerTransfer(uint64 _subId) external override {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner != address(0), "Subscription not found");
        require(s_pendingOwnerTransfers[_subId] == msg.sender, "Not the pending owner");
        address oldOwner = sub.owner;
        sub.owner = msg.sender;
        delete s_pendingOwnerTransfers[_subId];
        emit SubscriptionOwnerTransferred(_subId, oldOwner, msg.sender);
    }

    function pendingRequestExists(uint64 _subId) external view override returns (bool) {
        return s_subscriptions[_subId].pendingRequestCount > 0;
    }

    // Test helper to directly fulfill with specific words
    // This is not part of the interface but crucial for testing.
    function fulfillRandomWordsWithOverride(uint256 _requestId, address _consumerContract, uint256[] memory _randomWords) external {
        require(_consumerContract != address(0), "Consumer address cannot be zero");
        // Ensure the request was made and not yet fulfilled for this mock
        // This basic check might need to be more robust depending on test needs
        Subscription storage sub; 
        bool subFound = false;
        // Find which sub this request belongs to (not directly stored in this simplified mock)
        // For testing, we assume the request is valid and decrement a pending count if one exists.
        // A more complex mock would map requestId to subId.
        // For now, just call the consumer.
        
        VRFConsumerBaseV2 consumer = VRFConsumerBaseV2(_consumerContract);
        consumer.rawFulfillRandomWords(_requestId, _randomWords);
        emit RandomWordsFulfilled(_requestId, _randomWords[0], 0); // payment is 0 for mock
    }

    // Helper for tests to get the last request ID
    function lastRequestId() external view returns (uint256) {
        return s_lastRequestId;
    }

    // Helper for tests to create and fund a subscription in one go, and add a consumer.
    // Not part of the interface.
    function createSubscriptionAndFund(uint96 _amount) external returns (uint64 subId) {
        subId = createSubscription();
        fundSubscription(subId, _amount);
        return subId;
    }

    // Internal version for tests to add consumer without msg.sender check
    function addConsumerInternal(uint64 _subId, address _consumer) external {
        Subscription storage sub = s_subscriptions[_subId];
        require(sub.owner != address(0), "Subscription not found"); 
        require(sub.consumers.length < MAX_CONSUMERS, "Too many consumers");
        for (uint i = 0; i < sub.consumers.length; i++) {
            if (sub.consumers[i] == _consumer) return; 
        }
        sub.consumers.push(_consumer);
        emit SubscriptionConsumerAdded(_subId, _consumer);
    }

    // The getFeeConfig function was causing an override error, it's not in the provided interface.
    // Removing it. If tests need it, they might be based on an older or more complete mock.
    // function getFeeConfig() external view /* override */ returns (uint32, uint32, uint32, uint32, uint32, uint32, uint32, uint32, uint256) {
    //     return (0,0,0,0,0,0,0,0,0); // All zero for mock
    // }
}

