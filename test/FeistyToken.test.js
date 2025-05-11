const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FeistyToken", function () {
    let FeistyToken, feistyToken, owner, addr1, addr2;
    const initialSupply = ethers.parseUnits("1000000", 18); // 1 million tokens with 18 decimals

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        FeistyToken = await ethers.getContractFactory("FeistyToken");
        feistyToken = await FeistyToken.deploy(owner.address);
        await feistyToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await feistyToken.owner()).to.equal(owner.address);
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await feistyToken.balanceOf(owner.address);
            expect(await feistyToken.totalSupply()).to.equal(ownerBalance);
            expect(ownerBalance).to.equal(initialSupply);
        });

        it("Should have the correct name and symbol", async function () {
            expect(await feistyToken.name()).to.equal("Feisty Token");
            expect(await feistyToken.symbol()).to.equal("FST");
        });
    });

    describe("Transactions", function () {
        it("Should transfer tokens between accounts", async function () {
            // Transfer 50 tokens from owner to addr1
            await feistyToken.transfer(addr1.address, 50);
            const addr1Balance = await feistyToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(50);

            // Transfer 50 tokens from addr1 to addr2
            await feistyToken.connect(addr1).transfer(addr2.address, 50);
            const addr2Balance = await feistyToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });

        it("Should fail if sender doesn’t have enough tokens", async function () {
            const initialOwnerBalance = await feistyToken.balanceOf(owner.address);
            // Try to send 1 token from addr1 (0 tokens) to owner (1000000 tokens).
            await expect(
                feistyToken.connect(addr1).transfer(owner.address, 1)
            ).to.be.revertedWithCustomError(feistyToken, "ERC20InsufficientBalance");

            // Owner balance shouldn't have changed.
            expect(await feistyToken.balanceOf(owner.address)).to.equal(
                initialOwnerBalance
            );
        });

        it("Should update balances after transfers", async function () {
            const initialOwnerBalance = await feistyToken.balanceOf(owner.address);

            // Transfer 100 tokens from owner to addr1.
            await feistyToken.transfer(addr1.address, 100);

            // Transfer another 50 tokens from owner to addr2.
            await feistyToken.transfer(addr2.address, 50);

            // Check balances.
            const finalOwnerBalance = await feistyToken.balanceOf(owner.address);
            expect(finalOwnerBalance).to.equal(initialOwnerBalance - BigInt(150));

            const addr1Balance = await feistyToken.balanceOf(addr1.address);
            expect(addr1Balance).to.equal(100);

            const addr2Balance = await feistyToken.balanceOf(addr2.address);
            expect(addr2Balance).to.equal(50);
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            const mintAmount = ethers.parseUnits("500", 18);
            await feistyToken.mint(addr1.address, mintAmount);
            expect(await feistyToken.balanceOf(addr1.address)).to.equal(mintAmount);
            expect(await feistyToken.totalSupply()).to.equal(initialSupply + mintAmount);
        });

        it("Should prevent non-owners from minting tokens", async function () {
            const mintAmount = ethers.parseUnits("500", 18);
            await expect(
                feistyToken.connect(addr1).mint(addr2.address, mintAmount)
            ).to.be.revertedWithCustomError(feistyToken, "OwnableUnauthorizedAccount");
        });
    });

    describe("Burning", function () {
        it("Should allow users to burn their own tokens", async function () {
            const burnAmount = ethers.parseUnits("100", 18);
            await feistyToken.transfer(addr1.address, burnAmount); // Give addr1 some tokens
            await feistyToken.connect(addr1).burn(burnAmount);
            expect(await feistyToken.balanceOf(addr1.address)).to.equal(0);
            expect(await feistyToken.totalSupply()).to.equal(initialSupply - burnAmount);
        });

        it("Should fail if user tries to burn more tokens than they have", async function () {
            const burnAmount = ethers.parseUnits("100", 18);
            await expect(
                feistyToken.connect(addr1).burn(burnAmount) // addr1 has 0 tokens
            ).to.be.revertedWithCustomError(feistyToken, "ERC20InsufficientBalance");
        });

        it("Should allow owner to burn tokens from any account using burnFrom", async function () {
            const burnAmount = ethers.parseUnits("100", 18);
            await feistyToken.transfer(addr1.address, burnAmount * BigInt(2)); // Give addr1 some tokens
            
            await feistyToken.burnFrom(addr1.address, burnAmount);
            expect(await feistyToken.balanceOf(addr1.address)).to.equal(burnAmount);
            expect(await feistyToken.totalSupply()).to.equal(initialSupply - burnAmount);
        });

        it("Should prevent non-owners from using burnFrom", async function () {
            const burnAmount = ethers.parseUnits("100", 18);
            await feistyToken.transfer(addr1.address, burnAmount);
            await expect(
                feistyToken.connect(addr2).burnFrom(addr1.address, burnAmount)
            ).to.be.revertedWithCustomError(feistyToken, "OwnableUnauthorizedAccount");
        });
    });
});

