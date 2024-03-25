const { expect } = require("chai");
const { ethers } = require("hardhat");
const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");

describe("Y8uDistributor Tests", function () {
    let distributor, token;
    let owner, addr1, addr2;
    let merkleTree;
    let allocations;
    let root;

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();

        const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
        distributor = await Y8uDistributor.deploy(owner.address);
        // Access the Y8uERC20 token instance from the Y8uDistributor contract
        const tokenAddress = await distributor.y8u();
        token = await ethers.getContractAt("Y8uERC20", tokenAddress);

        // Prepare Merkle tree data
        allocations = [
            [addr1.address, ethers.parseEther("1000")],
            [addr2.address, ethers.parseEther("500")]
          ];

        merkleTree = StandardMerkleTree.of(allocations, ["address", "uint256"]);

        // Set the Merkle root for private sale in the distributor contract
        await distributor.setMerkleRootPrivateSale(merkleTree.root);
        await distributor.setTgeTimestamp();

    });

    async function claimTokens(claimer, totalAllocation, account) {
        const leaf = [account.address, totalAllocation.toString()];
        const proof = merkleTree.getProof(leaf);
        await distributor.connect(claimer).claimPrivateSale(totalAllocation, proof);
    }

    it("Should allow a valid claim", async function () {
        const allocation = ethers.parseEther("1000");
        await claimTokens(addr1, allocation, addr1);

        const balance = await token.balanceOf(addr1.address);
        expect(balance).to.equal(allocation  / BigInt(100));
    });

    it("Should reject an invalid claim", async function () {
        const allocation = ethers.parseEther("1000");
        const badAllocation = ethers.parseEther("500"); 
        const leaf = [addr2.address, badAllocation];// Incorrect leaf
        const proof = merkleTree.getProof(leaf);

        await expect(distributor.connect(addr1).claimPrivateSale(badAllocation, proof, {from: addr1.address})).to.be.revertedWith("Invalid Merkle proof Private sale");
    });

    it("Should not allow claim more than allocated", async function () {
        const allocation = ethers.parseEther("1000");
        await claimTokens(addr1, allocation, addr1);

        // Attempt to claim again with the same proof
        await expect(claimTokens(addr1, allocation, addr1)).to.be.revertedWith("No tokens are claimable");
    });

  it("Should prevent claiming with a proof for a different account", async function() {
      const allocation = ethers.parseEther("500");
      // Attempt to claim using addr1's allocation for addr2

      await expect(claimTokens(addr1, allocation, addr2)).to.be.revertedWith("Invalid Merkle proof Private sale");
  });
    
  it("Should reject claim attempts exceeding the allocated amount", async function() {
      const allocation = ethers.parseEther("500");
      await claimTokens(addr2, allocation, addr2);
  
      // Attempt to claim again exceeds the allocated amount
      const additionalClaimAmount = ethers.parseEther("500");
      await expect(claimTokens(addr2, additionalClaimAmount, addr2)).to.be.revertedWith("No tokens are claimable");
  });
  
 

});
