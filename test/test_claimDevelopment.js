const { expect } = require("chai");
const { ethers, network } = require("hardhat");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


async function increaseTime(months) {
    
    const seconds = months * 30 * 24 * 60 * 60 + 10;
    
    // Increase the time in the Hardhat Network
    await network.provider.send("evm_increaseTime", [seconds]);
    
    // Mine a new block to apply the time change
    await network.provider.send("evm_mine");
  }

describe("Y8uDistributor Tests Development", function () {
    let distributor, token;
    let owner, addr1, addr2;


    beforeEach(async () => {
        [owner, addr1, addr2,addr3,addr4,addr5, addrOverAllocated] = await ethers.getSigners();

        const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
        distributor = await Y8uDistributor.deploy(owner.address);
        // Access the Y8uERC20 token instance from the Y8uDistributor contract
        const tokenAddress = await distributor.y8u();
        token = await ethers.getContractAt("Y8uERC20", tokenAddress);

        await expect(distributor.claimDevelopment()).to.be.revertedWith("TGE not started");

        await distributor.setTgeTimestamp();
    });

    it("Should fail claiming with other address than the owner", async function (){
        try{
            await distributor.connect(addr1).claimDevelopment()
        }catch(err){
            expect(err.message).to.contain("VM Exception while processing")
        }
    })

    it("Should allow first valid claim in first month", async function () {
        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("0"));
    });

    it("Should allow first valid claim in second month", async function () {
        await increaseTime(1);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333"));    });


    it("Should allow first valid claim in 3rd month", async function () {
        await increaseTime(2);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(2));
    });

    it("Should allow first valid claim in 4rd month", async function () {
        await increaseTime(3);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(3));

        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(3));
    });


    it("Should allow first valid claim in final month", async function () {
        await increaseTime(48);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(48));

        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(49);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("100000000"));

        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(50);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("100000000"));

        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
    });


    it("Should allow first valid claim in 10th month", async function () {
        await increaseTime(9);
        await distributor.claimDevelopment();

        const balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(9));

        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(9));
    });

    it("Should claim in 3rd and 6th month ", async function () {
        await increaseTime(3);
        await distributor.claimDevelopment();
        let balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333")* BigInt(3));
        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(2);

        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(5));

        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(5));
    });

    it("Should claim every month to test if user gets it right ", async function () {
        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(3);

        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333")* BigInt(3));

        await increaseTime(1);

        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(4));

        await increaseTime(1);

        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(5));

        await increaseTime(1);

        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(6));

        await increaseTime(1);
        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("2083333") * BigInt(7));
        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(100)
        await distributor.claimDevelopment();
        balance = await distributor.totalClaimedDevelopment();
        expect(balance).to.equal(ethers.parseEther("100000000"));
        await expect(distributor.claimDevelopment()).to.be.revertedWith("claimable amount is 0");

    });

});
