// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Minimal mock for VRFConsumerBaseV2, only including what VRFCoordinatorV2Mock needs
contract VRFConsumerBaseV2 {
    /**
     * @notice fulfillRandomWords handles the VRF response. Your contract must override this function.
     * @param requestId The Id initially returned by requestRandomWords
     * @param randomWords the VRF output
     */
    function rawFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external virtual {}
}

