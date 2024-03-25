const hre = require("hardhat");

async function main() {
  [owner] = await ethers.getSigners();
  console.log(`DEPLOYER: ${owner.address}`);


 
  console.log(`deploy in progress...`);
  const Y8uDistributor = await ethers.getContractFactory("Y8uDistributor");
  distributor = await Y8uDistributor.deploy(owner.address);
  // Access the Y8uERC20 token instance from the Y8uDistributor contract
  const tokenAddress = await distributor.y8u();
  token = await ethers.getContractAt("Y8uERC20", tokenAddress);
  console.log("done")
  
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


