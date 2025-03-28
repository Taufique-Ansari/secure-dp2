const { ethers } = require("hardhat");

async function main() {
  const PrivacyContract = await ethers.getContractFactory("PrivacyContract");
  console.log("Deploying PrivacyContract...");
  
  const privacyContract = await PrivacyContract.deploy();
  // Wait for the contract to be deployed
  await privacyContract.waitForDeployment();

  const address = await privacyContract.getAddress();
  console.log("PrivacyContract deployed to:", address);
  // Save this address to your .env.local file
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 