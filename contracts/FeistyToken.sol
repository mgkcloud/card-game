// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FeistyToken
 * @dev ERC20 token for the Feisty Card Game in-game economy.
 * Allows for minting by the owner (e.g., for game rewards) and standard ERC20 operations.
 */
contract FeistyToken is ERC20, Ownable {
    /**
     * @dev Constructor that sets the token name, symbol, and mints an initial supply to the contract deployer.
     * @param initialOwner The address that will initially own the contract and receive the initial supply.
     */
    constructor(address initialOwner) ERC20("Feisty Token", "FST") Ownable(initialOwner) {
        // Mint an initial supply to the deployer (initialOwner).
        // The actual amount can be decided based on tokenomics.
        // For now, let's mint 1 million tokens with 18 decimals.
        _mint(initialOwner, 1000000 * (10**decimals()));
    }

    /**
     * @dev Creates `amount` tokens and assigns them to `account`, increasing
     * the total supply.
     *
     * Emits a {Transfer} event with `from` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - The caller must be the contract owner.
     */
    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     * - The caller must be the contract owner or approved for `account`.
     *   For simplicity in this version, we restrict burning to the token holder themselves.
     */
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Destroys `amount` tokens from `account`, reducing the
     * total supply.
     *
     * Emits a {Transfer} event with `to` set to the zero address.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens.
     * - The caller must be the contract owner (for administrative burning).
     */
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
}

