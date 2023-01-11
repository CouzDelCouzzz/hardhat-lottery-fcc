const { assert, expect } = require("chai")
const { network, ethers, getNamedAccounts, deployments } = require("hardhat")
const { developmentChain, networkConfig } = require("../../helper-hardhat-config")

developmentChain.includes(network.name)
    ? describe.skip
    : describe("Raffle Unit Tests", function () {
          let raffle, raffleEntranceFee, deployer

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer
              raffle = await ethers.getContract("Raffle", deployer)
              raffleEntranceFee = await raffle.getEntranceFee()
          })

          describe("fulfillRandomWords", function () {
              it("works with live Chinlink Keeper and Chainlink VRF, we get a random winner", async function () {
                  const startingTimeStamp = await raffle.getLatestTimeStamp()
                  const accounts = await ethers.getSigners()
                  // setup listener before we enter the raffle
                  await new Promise(async (resolve, reject) => {
                      raffle.once("WinnerPicked", async () => {
                          console.log("WinnerPicked event fire!")

                          // assert
                          try {
                              const recentWinner = await raffle.getRecentWinner()
                              const raffleState = await raffle.getRaffleState()
                              const winnerEndingBalance = await accounts[0].getBalance()
                              const endingTimeStamp = await raffle.getLatestTimeStamp()

                              await expect(raffle.getPlayer(0)).to.be.reverted // as the array should be empty
                              assert.equal(recentWinner.toString(), accounts[0].address)
                              assert.equal(raffleState, 0)
                              assert.equal(
                                  winnerEndingBalance.toString(),
                                  winnerStartingBalance.add(raffleEntranceFee).toString()
                              )
                              assert(endingTimeStamp > startingTimeStamp)

                              resolve()
                          } catch (error) {
                              console.log(error)
                              reject(error)
                          }
                      })

                      // entering the raffle
                      await raffle.enterRaffle({ value: raffleEntranceFee })
                      const winnerStartingBalance = await accounts[0].getBalance()

                      // and this code WONT COMPLETE until our listener has finished listening!!
                  })
              })
          })
      })
