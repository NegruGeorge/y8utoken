// const { expect } = require("chai");
// const { ethers, network } = require("hardhat");
// const { StandardMerkleTree } = require("@openzeppelin/merkle-tree");
// const {
//     time,
//     loadFixture,
//   } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


// async function increaseTime(months) {
    
//     const seconds = months * 30 * 24 * 60 * 60 + 10;
    
//     // Increase the time in the Hardhat Network
//     await network.provider.send("evm_increaseTime", [seconds]);
    
//     // Mine a new block to apply the time change
//     await network.provider.send("evm_mine");
//   }

// describe("Y8uDistributor Tests AiMining", function () {
//     let distributor, token;
//     let owner, addr1, addr2;


//     beforeEach(async () => {
//         [owner, addr1, addr2,addr3,addr4,addr5, addrOverAllocated] = await ethers.getSigners();

//         const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
//         distributor = await Y8uDistributor.deploy(owner.address);
//         // Access the Y8uERC20 token instance from the Y8uDistributor contract
//         const tokenAddress = await distributor.y8u();
//         token = await ethers.getContractAt("Y8uERC20", tokenAddress);
        
//     });

//     it("Should not be able to execute transaction with other accounts than the owner", async function (){
//         expect(await token.owner()).to.eq(await distributor.getAddress());
        
//         try{
//             // mint with another address than the distributor address.
//             await expect(token.mint(addr1.address,1))

//         }catch(err){
//             expect(err.message).to.contain("OwnableUnauthorizedAccount");
//         }

//         await distributor.setTgeTimestamp();
//         await distributor.claimAirdrop();

//     })

//     it("Should be able to change the owner", async function () {
//         expect(await token.owner()).to.eq(await distributor.getAddress());
        
        
//         try{
//             await distributor.connect(addr1).changeOwner();

//         }catch(err){
//             expect(err.message).to.contain("OwnableUnauthorizedAccount");

//         }
//         expect(await token.owner()).to.eq(await distributor.getAddress());
//         expect(await distributor.owner()).to.eq(await owner.getAddress());

//         // can change only with the distributor owner
//         await distributor.changeOwner();

//         expect(await token.owner()).to.eq(await owner.getAddress());
//         expect(await token.balanceOf(await addr1.getAddress())).to.eq("0")
//         await token.mint(await addr1.getAddress(),10);
//         expect(await token.balanceOf(await addr1.getAddress())).to.eq("10")



//     });

    

// });
