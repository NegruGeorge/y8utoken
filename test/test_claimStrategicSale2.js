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

describe("Y8uDistributor Tests StategicSale2", function () {
    let distributor, token;
    let owner, addr1, addr2;
    let merkleTree;
    let allocations;
    let root;

    const ONE_MONTH_IN_SECS = 30 * 24 * 60 * 60;
    // const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    beforeEach(async () => {
        [owner, addr1, addr2,addr3,addr4,addr5, addrOverAllocated] = await ethers.getSigners();

        const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
        distributor = await Y8uDistributor.deploy(owner.address);
        // Access the Y8uERC20 token instance from the Y8uDistributor contract
        const tokenAddress = await distributor.y8u();
        token = await ethers.getContractAt("Y8uERC20", tokenAddress);

        // Prepare Merkle tree data
        allocations = [
            [addr1.address, ethers.parseEther("100000")],
            [addr2.address, ethers.parseEther("5000")],
            [addr3.address, ethers.parseEther("5")],
            [addr4.address, ethers.parseEther("195")],
            [addr5.address, ethers.parseEther("9894800")],
            [addrOverAllocated.address, ethers.parseEther("1234")],
        ];

        merkleTree = StandardMerkleTree.of(allocations, ["address", "uint256"]);
        await expect(claimTokens(addr1, ethers.parseEther("100000"), addr1)).to.be.revertedWith("TGE not started")
        await distributor.setTgeTimestamp();
        await expect(claimTokens(addr1, ethers.parseEther("100000"), addr1)).to.be.revertedWith("Invalid Merkle proof Strategic sale 2")

        // Set the Merkle root for private sale in the distributor contract
        await distributor.setMerkleRootStrategicSale2(merkleTree.root);
        await distributor.setMerkleRootStrategicSale2(merkleTree.root);

    });

    async function claimTokens(claimer, totalAllocation, account) {
        const leaf = [account.address, totalAllocation.toString()];
        const proof = merkleTree.getProof(leaf);
        await distributor.connect(claimer).claimStrategicSale2(totalAllocation, proof);
    }

    it("Should allow first valid claim in first month", async function () {
        const allocation = ethers.parseEther("100000");
        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(100_000 ) / BigInt(10_000_000));
    });

    it("Should allow first valid claim in second month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(1);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);


        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(200_000 ) / BigInt(10_000_000));
    });


    it("Should allow first valid claim in 3rd month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(2);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000));
    });


    it("Should allow first valid claim in 4rd month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(3);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
            + allocation * BigInt(485_000 ) / BigInt(10_000_000));
    });


    it("Should allow first valid claim in 10th month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(9);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(7) * allocation * BigInt(485_000 ) / BigInt(10_000_000));
    });

    it("Should allow first valid claim in 23th month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(23);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);
        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation );
    });

    it("Should allow first valid claim in 23th month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(23);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation);
    });


    it("Should allow first valid claim in > 24th month", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");

        await increaseTime(90);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation);
    });

    
    it("Should claim in first and 3rd month ", async function () {
        const allocation = ethers.parseEther("100000");
        let block = await ethers.provider.getBlock("latest");
        await claimTokens(addr1, allocation, addr1);
        let balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(100_000 ) / BigInt(10_000_000) )

        await increaseTime(2);
        block = await ethers.provider.getBlock("latest");

        await claimTokens(addr1, allocation, addr1);

        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000));
    });

    it("Should claim every month to test if user gets it right ", async function () {
        const allocation = ethers.parseEther("100000");
        await claimTokens(addr1, allocation, addr1);
        let balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(100_000 ) / BigInt(10_000_000)) 

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(200_000 ) / BigInt(10_000_000));

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000));

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + allocation * BigInt(485_000 ) / BigInt(10_000_000));
    
        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(2) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(3) * allocation * BigInt(485_000 ) / BigInt(10_000_000));
        
        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(4) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        //.
        //..
        //...
        //....

        await increaseTime(10);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(14) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        await increaseTime(4);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(18) * allocation * BigInt(485_000 ) / BigInt(10_000_000));
        // expect(balance).to.equal(allocation);

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(19) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(20) * allocation * BigInt(485_000 ) / BigInt(10_000_000));
        expect(balance).to.equal(allocation);


        await increaseTime(1);
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(allocation);

        await increaseTime(1);    
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(allocation);

    });

    it("Should claim random to test if user gets it right ", async function () {
        const allocation = ethers.parseEther("100000");
        await claimTokens(addr1, allocation, addr1);
        let balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(100_000 ) / BigInt(10_000_000) )

        await increaseTime(1);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(200_000 ) / BigInt(10_000_000));

        

        await increaseTime(2);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        +  allocation * BigInt(485_000 ) / BigInt(10_000_000));
    
    
        await increaseTime(3);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(4) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        //.
        //..
        //...
        //....

        await increaseTime(10);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(14) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        await increaseTime(6);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation);

        await increaseTime(1);    
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(allocation);

        await increaseTime(1);    
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(allocation);
    });


    it("Should over allocate", async function () {
        const allocation = ethers.parseEther("100000");

        await increaseTime(90);     

        await claimTokens(addr1, ethers.parseEther("100000"), addr1);
        await claimTokens(addr2, ethers.parseEther("5000"), addr2);
        await claimTokens(addr3, ethers.parseEther("5"), addr3);
        await claimTokens(addr4, ethers.parseEther("195"), addr4);
        await claimTokens(addr5, ethers.parseEther("9894800"), addr5);

        await expect(claimTokens(addrOverAllocated, ethers.parseEther("1234"), addrOverAllocated)).to.be.revertedWith("Strategic sale 2 allocation is 100%");

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation);
    });


    it("Should claim random to test if user gets it right ", async function () {
        const allocation = ethers.parseEther("100000");
        await claimTokens(addr1, allocation, addr1);
        let balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(100_000 ) / BigInt(10_000_000) )

        await increaseTime(1);
        await claimTokens(addr1,  ethers.parseEther("100000"), addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(200_000 ) / BigInt(10_000_000));

        

        await increaseTime(2);
        await claimTokens(addr1,  ethers.parseEther("100000"), addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000)
        +  allocation * BigInt(485_000 ) / BigInt(10_000_000));

        await claimTokens(addr3,  ethers.parseEther("5"), addr3);
        balance = await token.balanceOf(addr3.address);
        expect(balance).to.equal(ethers.parseEther("5") * BigInt(300_000 ) / BigInt(10_000_000)
        + ethers.parseEther("5") * BigInt(485_000 ) / BigInt(10_000_000));
    
    
        await increaseTime(3);

        await claimTokens(addr1, ethers.parseEther("100000"), addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(ethers.parseEther("100000") * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(4) * ethers.parseEther("100000") *  BigInt(485_000 ) / BigInt(10_000_000) );

        await claimTokens(addr3,  ethers.parseEther("5"), addr3);
        balance = await token.balanceOf(addr3.address);
        expect(balance).to.equal(ethers.parseEther("5") * BigInt(300_000 ) / BigInt(10_000_000)
        + BigInt(4) *  ethers.parseEther("5") * BigInt(485_000 ) / BigInt(10_000_000));

        await claimTokens(addr5,  ethers.parseEther("9894800"), addr5);
        balance = await token.balanceOf(addr5.address);
        expect(balance).to.equal( ethers.parseEther("9894800") * BigInt(300_000 ) / BigInt(10_000_000) 
        + BigInt(4) *   ethers.parseEther("9894800") * BigInt(485_000 ) / BigInt(10_000_000));


        //.
        //..
        //...
        //....

        await increaseTime(10);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation * BigInt(300_000 ) / BigInt(10_000_000) 
        + BigInt(14) * allocation * BigInt(485_000 ) / BigInt(10_000_000));

        await increaseTime(6);
        await claimTokens(addr1, allocation, addr1);
        balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation);

        await claimTokens(addr2, ethers.parseEther("5000"), addr2);
        balance = await token.balanceOf(addr2.address);
        expect(balance).to.equal(ethers.parseEther("5000"));


        await increaseTime(1);    
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr1.address);
            expect(balance).to.equal(allocation);

        await increaseTime(1);    
        await expect(claimTokens(addr2, ethers.parseEther("5000"), addr2)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr2.address);
            expect(balance).to.equal(ethers.parseEther("5000"));

        await claimTokens(addr4, ethers.parseEther("195"), addr4);
        balance = await token.balanceOf(addr4.address);
        expect(balance).to.equal(ethers.parseEther("195"));    

        await claimTokens(addr5, ethers.parseEther("9894800"), addr5);
        balance = await token.balanceOf(addr5.address);
        expect(balance).to.equal(ethers.parseEther("9894800"));  

        await claimTokens(addr3, ethers.parseEther("5"), addr3);
        balance = await token.balanceOf(addr3.address);
            expect(balance).to.equal(ethers.parseEther("5"));

        await increaseTime(1);    
        await expect(claimTokens(addr4, ethers.parseEther("195"), addr4)).to.be.revertedWith("No tokens are claimable");
        balance = await token.balanceOf(addr4.address);
            expect(balance).to.equal(ethers.parseEther("195"));

            
        await expect(claimTokens(addrOverAllocated, ethers.parseEther("1234"), addrOverAllocated)).to.be.revertedWith("Strategic sale 2 allocation is 100%")

        expect(await distributor.totalClaimedStrategicSale2()).to.eq(ethers.parseEther("10000000"));
            
    });


    it("Should reject an invalid claim", async function () {
        const allocation = ethers.parseEther("100000");
        const badAllocation = ethers.parseEther("5000"); 
        const leaf = [addr2.address, badAllocation];// Incorrect leaf
        const proof = merkleTree.getProof(leaf);

        await expect(distributor.connect(addr1).claimPrivateSale(badAllocation, proof)).to.be.revertedWith("Invalid Merkle proof Private sale");
    });


    it("Should not allow claim more than allocated", async function () {
        const allocation = ethers.parseEther("100000");
        await claimTokens(addr1, allocation, addr1);

        // Attempt to claim again with the same proof
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
    });

    it("Should adjust total claimed amount after a successful claim", async function() {
      const initialAllocation = ethers.parseEther("5000");
      await claimTokens(addr2, initialAllocation, addr2);
  
      const totalClaimedAfter = await distributor.totalClaimedStrategicSale2();
      expect(totalClaimedAfter).to.equal(initialAllocation / BigInt(100));
  });
  
  it("Should prevent claiming with a proof for a different account", async function() {
      const allocation = ethers.parseEther("5000");
      // Attempt to claim using addr1's allocation for addr2

      await expect(claimTokens(addr1, allocation, addr2)).to.be.revertedWith("Invalid Merkle proof Strategic sale 2");
  });
    
  it("Should reject claim attempts exceeding the allocated amount", async function() {
      const allocation = ethers.parseEther("5000");
      await claimTokens(addr2, allocation, addr2);
  
      // Attempt to claim again exceeds the allocated amount
      const additionalClaimAmount = ethers.parseEther("5000");
      await expect(claimTokens(addr2, additionalClaimAmount, addr2)).to.be.revertedWith("No tokens are claimable");
  });
  
  it("Total supply should not exceed max supply limit after claims", async function() {
      // Assuming the max supply is set and known
      const maxSupply = await token.MAX_SUPPLY();
      // Perform claims that approach the max supply
      await claimTokens(addr1, ethers.parseEther("100000"), addr1);
      await claimTokens(addr2, ethers.parseEther("5000"), addr2);
      // Total supply should not exceed the max supply
      const totalSupply = await token.totalSupply();
      expect(totalSupply).to.be.lte(maxSupply);
      expect(await distributor.totalClaimedStrategicSale2()).to.eq(ethers.parseEther("105000") / BigInt(100))
  });

});
