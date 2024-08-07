export const coinRewardsAbi = [
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_minkToken",
              "type": "address"
          },
          {
              "internalType": "uint256",
              "name": "_minStakeAmount90Days",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_minStakeAmount180Days",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_minStakeAmount365Days",
              "type": "uint256"
          }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "min90Days",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "min180Days",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "min365Days",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
          }
      ],
      "name": "MinimumStakeAmountsUpdated",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
          },
          {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
          }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "newPenaltyPercentage",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
          }
      ],
      "name": "PenaltyPercentageUpdated",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "reward",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
          }
      ],
      "name": "RewardPaid",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "newRate",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
          }
      ],
      "name": "RewardRateUpdated",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "lockPeriod",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
          }
      ],
      "name": "Staked",
      "type": "event"
  },
  {
      "anonymous": false,
      "inputs": [
          {
              "indexed": true,
              "internalType": "address",
              "name": "user",
              "type": "address"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
          },
          {
              "indexed": false,
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
          }
      ],
      "name": "Unstaked",
      "type": "event"
  },
  {
      "inputs": [
          {
              "internalType": "address[]",
              "name": "_users",
              "type": "address[]"
          },
          {
              "internalType": "uint256[]",
              "name": "_amounts",
              "type": "uint256[]"
          },
          {
              "internalType": "uint256[]",
              "name": "_lockPeriods",
              "type": "uint256[]"
          }
      ],
      "name": "batchStake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "calculateAPY",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "calculateReward",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "claimReward",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "getLockEndTime",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "getRewardBalance",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "getRewardHistory",
      "outputs": [
          {
              "internalType": "uint256[]",
              "name": "",
              "type": "uint256[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "getStakedBalance",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "getStakingDuration",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "_user",
              "type": "address"
          }
      ],
      "name": "getStakingHistory",
      "outputs": [
          {
              "components": [
                  {
                      "internalType": "uint256",
                      "name": "amount",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "lockPeriod",
                      "type": "uint256"
                  },
                  {
                      "internalType": "uint256",
                      "name": "timestamp",
                      "type": "uint256"
                  }
              ],
              "internalType": "struct MinkRewards.StakingDetail[]",
              "name": "",
              "type": "tuple[]"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "getTotalRewardsDistributed",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "lockPeriod180Days",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "lockPeriod365Days",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "lockPeriod90Days",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "minStakeAmount180Days",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "minStakeAmount365Days",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "minStakeAmount90Days",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "minkToken",
      "outputs": [
          {
              "internalType": "contract IERC20",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "owner",
      "outputs": [
          {
              "internalType": "address",
              "name": "",
              "type": "address"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "penaltyPercentage",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "rewardRate",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_lockPeriod",
              "type": "uint256"
          }
      ],
      "name": "stake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "totalRewardsDistributed",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [],
      "name": "totalStaked",
      "outputs": [
          {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
          }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_amount",
              "type": "uint256"
          }
      ],
      "name": "unstake",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_min90Days",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_min180Days",
              "type": "uint256"
          },
          {
              "internalType": "uint256",
              "name": "_min365Days",
              "type": "uint256"
          }
      ],
      "name": "updateMinimumStakeAmounts",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_newPenaltyPercentage",
              "type": "uint256"
          }
      ],
      "name": "updatePenaltyPercentage",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  },
  {
      "inputs": [
          {
              "internalType": "uint256",
              "name": "_newRate",
              "type": "uint256"
          }
      ],
      "name": "updateRewardRate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
  }
]