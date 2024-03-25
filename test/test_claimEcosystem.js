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

describe("Y8uDistributor Tests ECOSYSTEM", function () {
    let distributor, token;
    let owner, addr1, addr2;


    beforeEach(async () => {
        [owner, addr1, addr2,addr3,addr4,addr5, addrOverAllocated] = await ethers.getSigners();

        const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
        distributor = await Y8uDistributor.deploy(owner.address);
        // Access the Y8uERC20 token instance from the Y8uDistributor contract
        const tokenAddress = await distributor.y8u();
        token = await ethers.getContractAt("Y8uERC20", tokenAddress);

        await expect(distributor.claimEcosystem()).to.be.revertedWith("TGE not started");

        await distributor.setTgeTimestamp();
    });

    it("Should fail claiming with other address than the owner", async function (){
        try{
            await distributor.connect(addr1).claimEcosystem()
        }catch(err){
            expect(err.message).to.contain("VM Exception while processing")
        }
    })

    it("Should allow first valid claim in first month", async function () {
        await distributor.claimEcosystem()

        const balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000"));
    });

    it("Should allow first valid claim then second 3rd month wont work ", async function () {
        await distributor.claimEcosystem()

        let balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000"));
        await increaseTime(1);
        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(1);
        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");

        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000"));

        await increaseTime(1);
        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");

        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000"));

        await increaseTime(1);
        await distributor.claimEcosystem()
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000"));

        await increaseTime(1);
        await distributor.claimEcosystem()
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(2));

    });


    it("Should allow first valid claim in 3rd month", async function () {
        await increaseTime(4);
        await distributor.claimEcosystem();

        const balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000"));
    });

    it("Should allow first valid claim in 4rd month", async function () {
        await increaseTime(5);
        await distributor.claimEcosystem();
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(2));

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(2));
    });



    it("Should allow first valid claim in final month", async function () {
        await increaseTime(39);
        await distributor.claimEcosystem();

        const balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(await distributor.ECOSYSTEM());

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(40);
        await distributor.claimEcosystem();

        const balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("360000000"));

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
    });

    it("Should allow first valid claim in final month", async function () {
        await increaseTime(50);
        await distributor.claimEcosystem();

        const balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("360000000"));

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
    });


    it("Should claim in 11th and 16th month ", async function () {
        await increaseTime(10);
        await distributor.claimEcosystem();
        let balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(7));
        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(5);

        await distributor.claimEcosystem();
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(12));

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(12));
    });

    it("Should claim every month to test if user gets it right ", async function () {

        await increaseTime(1);

        await distributor.claimEcosystem();
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000"));

        await increaseTime(1);

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000"));

        await increaseTime(1);

        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");
        
        await increaseTime(1);

        await distributor.claimEcosystem();
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000"));

        await increaseTime(1);
        await distributor.claimEcosystem();
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("7200000") + ethers.parseEther("9800000") * BigInt(2));
        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");

        await increaseTime(100)
        await distributor.claimEcosystem();
        balance = await distributor.totalClaimedEcosystem();
        expect(balance).to.equal(ethers.parseEther("360000000"));
        await expect(distributor.claimEcosystem()).to.be.revertedWith("claimable amount is 0");

    });

});
