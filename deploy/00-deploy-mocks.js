const { network } = require("hardhat")
const { developmentChain } = require("../helper-hardhat-config")

const BASE_FEE = ethers.utils.parseEther("0.25")
const GAS_PRICE_LINK = 1e9
// calculated value based on GAS price of the chain
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const args = [BASE_FEE, GAS_PRICE_LINK]

    if (developmentChain.includes(network.name)) {
        log("Local network detected! Deploying mocks...")
        await deploy("VRFCoordinatorV2Mock", {
            contract: "VRFCoordinatorV2Mock",
            from: deployer,
            log: true,
            args: args,
        })
        log("Mocks Deployed!")
        log("--------------------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
