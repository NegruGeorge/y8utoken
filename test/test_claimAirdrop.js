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

describe("Y8uDistributor Tests Airdrop", function () {
    let distributor, token;
    let owner, addr1, addr2;
    let merkleTree;

    const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    beforeEach(async () => {
        [owner, addr1, addr2,addr3,addr4,addr5, addrOverAllocated] = await ethers.getSigners();

        const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
        distributor = await Y8uDistributor.deploy(owner.address);
        // Access the Y8uERC20 token instance from the Y8uDistributor contract
        const tokenAddress = await distributor.y8u();
        token = await ethers.getContractAt("Y8uERC20", tokenAddress);

        await expect(distributor.claimAirdrop()).to.be.revertedWith("TGE not started");

        await distributor.setTgeTimestamp();
    });

    it("Should fail claiming with other address than the owner", async function (){
        try{
            await distributor.connect(addr1).claimAirdrop()
        }catch(err){
            expect(err.message).to.contain("VM Exception while processing")
        }
    })

    it("Should allow first valid claim in first month", async function () {
        await distributor.claimAirdrop();
        const balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("1000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("1000000"));
    });

    it("Should allow first valid claim in second month", async function () {
        await increaseTime(1);
        await distributor.claimAirdrop();

        const balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("2000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("2000000"));
    });


    it("Should allow first valid claim in 3rd month", async function () {
        await increaseTime(2);
        await distributor.claimAirdrop();

        const balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("3000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("3000000"));
    });

    it("Should allow first valid claim in 4rd month", async function () {
        await increaseTime(3);
        await distributor.claimAirdrop();

        const balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("4000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("4000000"));
    });

    it("Should allow first valid claim in 5th month", async function () {
        await increaseTime(4);
        await distributor.claimAirdrop();

        const balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("5000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("5000000"));
    });

    it("Should allow first valid claim in 10th month", async function () {
        await increaseTime(9);
        await distributor.claimAirdrop();

        const balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("5000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("5000000"));
    });

   
    it("Should claim in first and 3rd month ", async function () {
        await distributor.claimAirdrop();
        let balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("1000000"));
        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(2);

        await distributor.claimAirdrop();
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("3000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("3000000"));
    });

    it("Should claim in first and 6th month ", async function () {
        await distributor.claimAirdrop();
        let balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("1000000"));
        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(5);

        await distributor.claimAirdrop();
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("5000000"));

        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
        expect(balance).to.equal(ethers.parseEther("5000000"));
    });

    it("Should claim every month to test if user gets it right ", async function () {
        await distributor.claimAirdrop();
        let balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("1000000"));
        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(1);

        await distributor.claimAirdrop();
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("2000000"));

        await increaseTime(1);

        await distributor.claimAirdrop();
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("3000000"));

        await increaseTime(1);

        await distributor.claimAirdrop();
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("4000000"));

        await increaseTime(1);

        await distributor.claimAirdrop();
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("5000000"));

        await increaseTime(1);
        await expect(distributor.claimAirdrop()).to.be.revertedWith("claimable amount is 0");
    
        balance = await distributor.totalClaimedAirdrop();
        expect(balance).to.equal(ethers.parseEther("5000000"));
    });

});
